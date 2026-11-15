// Run as an expression through Orca eval on an isolated dev origin.
(async()=>{
  const {ambientContent}=await import('/src/chapter/ambient.ts');
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const test=window.__chapterTest;
  const q=s=>document.querySelector(s),click=s=>q(s).click();
  const send=text=>{q('#chat-answer').value=text;q('#chat-answer').dispatchEvent(new Event('input',{bubbles:true}));click('[data-chat=send]');};
  const results=[];
  for(const [id,answers] of [
    ['guard',['来领取我的包裹','我忘记带了']],
    ['student-a',['我刚来','宿舍']],
    ['resident-b',['不喜欢这里','打篮球']],
    ['elder-c',['今天我没空','不坐了谢谢']]
  ]){
    const npc=ambientContent.npcs.find(n=>n.id===id);
    const before=test.snapshot();
    // Finish any previous smoke attempt, then enter the normal replay path.
    if(before.chats?.[id]){
      while((test.snapshot().chats?.[id]??0)<npc.turns.length){
        test.chat(id);const index=test.snapshot().chats[id];send(npc.turns[index].responses[0].sample[0]);
      }
    }
    test.chat(id);if(q('[data-chat=replay]'))click('[data-chat=replay]');
    check(q('#chat-answer').value==='','A hint must not fill the answer');
    for(let i=0;i<3;i++){click(`[data-hint="${i}"]`);check(q('[data-chat=hint]').textContent.length>10,`${id} hint ${i}`);check(q('#chat-answer').value==='','No autofill');}
    const first=q('.chat-chinese').textContent;
    send('我不知道你在说什么');check((test.snapshot().chats?.[id]??0)===0,'Unknown intent must not advance');
    check(q('[data-chat=feedback]').textContent.includes('chưa hiểu'),'Neutral clarification');
    q('#chat-answer').value=answers[0];q('#chat-answer').dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));
    q('#chat-answer').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,isComposing:true}));
    check((test.snapshot().chats?.[id]??0)===0,'IME Enter must not submit');
    q('#chat-answer').dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));await new Promise(r=>setTimeout(r,0));
    q('#chat-answer').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    check(test.snapshot().chats[id]===1,`${id} accepts alternate wording`);
    click('[data-chat=send]');check(test.snapshot().chats[id]===1,'No double advancement');
    click('#chapter-close');test.chat(id);
    check(q('.chat-chinese').textContent===npc.turns[1].prompt[0],`${id} resumes second turn`);
    check(q('dialog').scrollTop===0,'Question visible on resume');
    send(answers[1]);check(test.snapshot().chats[id]===2,`${id} accepts second answer`);
    const reply=q('[data-chat=outcome]').textContent;
    const after=test.snapshot();
    for(const key of ['completed','steps','skills','relations'])check(JSON.stringify(before[key])===JSON.stringify(after[key]),'Optional talk must not alter '+key);
    const audio=await fetch(`/audio/ambient/${id}-${npc.turns[0].id}-prompt.wav`);check(audio.ok,'Voice must load');
    const bytes=await audio.arrayBuffer();const audioContext=new AudioContext();
    try{const decoded=await audioContext.decodeAudioData(bytes);check(decoded.duration>.3,'Voice must decode');}finally{await audioContext.close();}
    click('#chapter-close');await test.flush();results.push({id,first,reply,complete:after.chats[id]});
  }
  test.chat('guard');check(!!q('[data-chat=replay]'),'Completed talk offers replay');
  click('#chapter-close');
  check(test.snapshot().scene==='gate','World check uses a fresh game at the gate');
  q('canvas').focus();
  const walk=async(key,coordinate,target)=>{
    window.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
    try{for(let frame=0;frame<200&&Math.abs(test.position()[coordinate]-target)>12;frame++)await new Promise(requestAnimationFrame);}
    finally{window.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));}
  };
  if(test.position().x<768)await walk('d','x',780);
  if(test.position().y<448)await walk('s','y',460);
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true,cancelable:true}));
  check(q('#chapter-title').textContent.includes('bảo vệ'),'E opens the nearby ambient NPC');
  check(!!q('[data-chat=replay]'),'E reaches the correct completed chat');
  await test.flush();
  return {pass:true,cases:results,worldInteraction:true,progress:test.snapshot().chats};
})()
