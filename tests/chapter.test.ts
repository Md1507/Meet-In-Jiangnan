import {test} from 'node:test';
import assert from 'node:assert/strict';
import {content,interpret,utteranceById,validScenarioProposal} from '../src/chapter/content.ts';
import {newChapter,attempt,endPeriod,completeCharacter,eventForScene,finishEvent,dailyActivity,dueReviews,review,validChapter,migrateChapter,travel,activeQuests} from '../src/chapter/engine.ts';
import {questGuidance,scenarioGuidance} from '../src/chapter/guidance.ts';

test('guidance follows the missing scenario NPC schedule and existing unlocks',()=>{
  const s=newChapter();const arrival=content.quests.find(q=>q.id==='arrival')!;
  for(let period=0;period<3;period++){s.period=period;const g=questGuidance(s,arrival);const npc=content.npcs.find(n=>n.id==='mentor')!;assert.equal(g.npc?.id,npc.id);assert.equal(g.scene?.id,npc.schedule[period]);}
  s.steps.arrival=['greeting','introduction'];assert.equal(questGuidance(s,arrival).npc?.id,'officer');
  const breakfast=content.quests.find(q=>q.id==='breakfast')!;assert.equal(questGuidance(s,breakfast).branch,'locked');assert.match(questGuidance(s,breakfast).text,/ngày 2/);
  assert.equal(scenarioGuidance(s,'order_water')?.branch,'locked');
  for(const scene of content.scenes){const {x,y}=scene.spawn;assert.ok(!scene.colliders.some(([l,t,r,b])=>x+8>l&&x-8<r&&y+16>t&&y-22<b),scene.id);}
});

test('breakfast guidance and reward survive replay and save round trip',()=>{
  const s=newChapter();for(const [id,text] of [['greeting','老师好'],['introduction','我叫小雨'],['checkin','我来办理入住']] as const)attempt(s,id,text,'typed',0);
  s.day=2;const breakfast=content.quests.find(q=>q.id==='breakfast')!;assert.equal(questGuidance(s,breakfast).branch,'active');
  assert.equal(attempt(s,'order_water','不要热水','typed',0).accepted,false);assert.equal(s.completed.includes('breakfast'),false);
  assert.equal(attempt(s,'order_water','我想喝一杯热水','typed',0).accepted,true);assert.equal(questGuidance(s,breakfast).branch,'complete');
  const restored=JSON.parse(JSON.stringify(s));assert.equal(validChapter(restored),true);const reward=restored.relations.seller;
  attempt(restored,'order_water','我想喝一杯热水','typed',0);assert.equal(restored.relations.seller,reward);assert.equal(restored.skills.speaking.order_water,undefined);
});

test('each quest keeps a continuation through wrong answers, partial replay and late completion',()=>{
  const s=newChapter();
  const say=(id:string,text?:string)=>attempt(s,id,text??utteranceById.get(content.scenarios.find(c=>c.id===id)!.positive[0])!.text,'typed',0);
  for(const quest of content.quests){
    if(quest.day>s.day)assert.equal(questGuidance(s,quest).branch,'locked',quest.id);
    while(s.day<quest.day)endPeriod(s);
    for(const id of quest.steps){
      assert.equal(scenarioGuidance(s,id)?.branch,'active',quest.id+': missing step');
      const before=structuredClone(s.steps);
      say(id,utteranceById.get(content.scenarios.find(c=>c.id===id)!.negative[0])!.text);
      assert.deepEqual(s.steps,before,'wrong answer preserves quest steps');
      assert.equal(scenarioGuidance(s,id)?.branch,'active');
      say(id);
      if(!s.completed.includes(quest.id)){
        const g=scenarioGuidance(s,id)!;
        assert.equal(g.branch,'replay',quest.id+': completed step stays attached to quest');
        assert.match(g.text,/Tiếp theo:/);
        if(g.npc)assert.ok(g.text.includes(g.npc.name));
        const progress=structuredClone(s.steps),rewards=structuredClone(s.relations);
        say(id);assert.deepEqual(s.steps,progress);assert.deepEqual(s.relations,rewards);
      }
    }
    if(quest.id===content.endingQuest){
      // The invitation may be done while the written preparation is missing.
      assert.match(scenarioGuidance(s,'invitation')!.text,/bài viết lời mời.*我/);
      say('invitation');
      const invitation=utteranceById.get(content.scenarios.find(c=>c.id==='invitation')!.positive[0])!;
      attempt(s,'invitation',invitation.text,'typed',0,undefined,'lesson-10');
      completeCharacter(s,'我','quiz');
    }
    assert.equal(questGuidance(s,quest).branch,'complete');
    assert.equal(scenarioGuidance(s,quest.steps[0])?.branch,'complete');
    // Delay the next meeting deliberately: no quest expires at its nominal day.
    for(let period=0;period<3;period++)endPeriod(s);
  }
  assert.equal(s.endingMode,'keyboard');assert.equal(validChapter(s),true);
});

test('day-six preparation works in either order without completing the invitation early',()=>{
  const base=newChapter();
  for(const q of content.quests.filter(q=>q.id!==content.endingQuest)){
    while(base.day<q.day)endPeriod(base);
    for(const id of q.steps)attempt(base,id,utteranceById.get(content.scenarios.find(c=>c.id===id)!.positive[0])!.text,'typed',0);
  }
  while(base.day<6)endPeriod(base);
  for(const order of [['sentence','handwriting'],['handwriting','sentence']]){
    const s=structuredClone(base);
    for(const skill of order){
      if(skill==='sentence')attempt(s,'invitation',utteranceById.get('invitation-0')!.text,'typed',0,undefined,'lesson-10');
      else completeCharacter(s,'我','quiz');
      assert.equal(s.completed.includes('welcome'),false);
    }
    while(s.day<7)endPeriod(s);
    assert.equal(s.completed.includes('welcome'),false,'practice before day 7 does not replace the meeting');
    attempt(s,'invitation',utteranceById.get('invitation-0')!.text,'typed',0);
    assert.equal(s.endingMode,'keyboard');assert.equal(validChapter(s),true);
  }
});

test('all twelve scenes accept their authored variants and reject explicit wrong meaning',()=>{
  for(const scenario of content.scenarios){for(const id of scenario.positive)assert.equal(interpret(scenario.id,utteranceById.get(id)!.text).accepted,true);for(const id of scenario.negative)assert.equal(interpret(scenario.id,utteranceById.get(id)!.text).accepted,false);}
});
test('compositional expressions beyond examples accept complete meaning and reject contradictions',()=>{
  const cases=[
    ['greeting','老师早上好。','老师不好。'],
    ['introduction','您好，我的名字叫小雨，谢谢。','我叫小雨不对我叫小明。'],
    ['repeat','请您可以重复一次吗？','您可以不要再说一遍吗？'],
    ['checkin','您好，我想办理一下入住手续，谢谢。','我来退房。'],
    ['room_problem','我的房间里的灯坏了，谢谢。','我的房间里的灯没有坏。'],
    ['order_water','麻烦帮我倒一杯热水，谢谢。','我要两杯热水。'],
    ['quantity','请帮我买两个包子，谢谢。','请帮我买三个包子。'],
    ['price','请问，这个卖多少钱？','这个卖十块钱。'],
    ['directions','请问，去图书馆怎么走？','请问，去食堂怎么走？'],
    ['schedule','请问，上课的时间是什么时候？','上课的时间是八点。'],
    ['parcel','您好，我想领取我的包裹，谢谢。','我想寄我的包裹。'],
    ['invitation','我们明天一块去吃饭吧。','我们今天一块去吃饭吧。']
  ];
  for(const [id,yes,no] of cases){assert.equal(interpret(id,yes).accepted,true,id+': '+yes);assert.equal(interpret(id,no).accepted,false,id+': '+no);assert.equal(interpret(id,yes+'但是不要这样做').accepted,false);}
});
test('model proposals require exact schema, active intent and independently verified meaning',()=>{
  assert.equal(validScenarioProposal({intent:'order_water',accepted:true},'order_water','请帮我倒一杯热水'),true);
  for(const proposal of [null,[],{intent:'order_water',accepted:'true'},{intent:'invitation',accepted:true},{intent:'order_water',accepted:true,reward:100}])assert.equal(validScenarioProposal(proposal,'order_water','我要一杯热水。'),false);
  assert.equal(validScenarioProposal({intent:'order_water',accepted:true},'order_water','不要热水'),false);
});

test('review16 accepts composed hot-water requests beyond the authored examples',()=>{
  const proposal={intent:'order_water',accepted:true};
  for(const text of ['我想喝一杯热水。','可以给我一杯热水吗？','请倒一杯热水给我。','热水一杯，谢谢。']){
    assert.equal(interpret('order_water',text).accepted,true,text);
    assert.equal(validScenarioProposal(proposal,'order_water',text),true,text);
  }
  // New combinations of request forms and slots, not a whitelist of corpus lines.
  for(const prefix of ['我想喝','我需要','我想点','给我来','帮我拿']){
    for(const serving of ['一杯热水','杯热的水','热水一杯']){
      const text=`老板，${prefix}${serving}就好，谢谢。`;
      assert.equal(interpret('order_water',text).accepted,true,text);
    }
  }
  for(const text of ['您好，师傅，请问您能帮我倒一杯热的水吗？','劳驾，请给我拿杯热水。','一杯热的水就可以，谢谢。']){
    assert.equal(interpret('order_water',text).accepted,true,text);
  }
});

test('review16 keeps negation, wrong slots and unrelated clauses out of hot-water requests',()=>{
  const proposal={intent:'order_water',accepted:true};
  const incorrect=[
    '我不想喝一杯热水。','请不要给我一杯热水。','可以不给我一杯热水吗？',
    '我想喝两杯热水。','能帮我拿一瓶热水吗？','我需要一杯冷水。','我想喝一杯热茶。',
    '一杯水，谢谢。','我想喝热水。','我昨天喝了一杯热水。','我已经喝了一杯热水。',
    '一杯热水多少钱？','这里有一杯热水吗？','请把一杯热水拿走。','你说我想喝一杯热水。',
    '我想喝一杯热水，但是不要给我。','给我一杯热水和一杯茶。',
  ];
  for(const text of incorrect){
    assert.equal(interpret('order_water',text).accepted,false,text);
    assert.equal(validScenarioProposal(proposal,'order_water',text),false,text);
  }
  // A valid order must not survive a contradictory second clause or altered slot.
  for(const request of ['我想喝一杯热水','您能给我一杯热水吗','倒一杯热水给我']){
    for(const suffix of ['但是我要冷水','但不要水','我说错了','再加一杯茶']){
      assert.equal(interpret('order_water',request+suffix).accepted,false,request+suffix);
    }
    for(const replacement of ['两杯热水','一杯冰水','一杯热茶','一碗热水']){
      const text=request.replace('一杯热水',replacement);
      assert.equal(interpret('order_water',text).accepted,false,text);
    }
  }
});

test('review16 accepted natural requests flow through learning, save validation and review',()=>{
  const s=newChapter(),text='我想喝一杯热水。';
  assert.equal(attempt(s,'order_water',text,'audio-asr',0,text).accepted,true);
  assert.equal(s.skills.speaking.order_water,1);
  assert.equal(s.journal.length,1);
  assert.ok(validChapter(s));
  s.day=2;
  assert.equal(review(s,s.journal[0].id,'您可以帮我倒杯热的水吗？'),true);
});
test('seven-day keyboard chapter needs all quests, writing and handwriting, rewards only once',()=>{
  const s=newChapter();
  for(const q of content.quests){while(s.day<q.day)endPeriod(s);for(const id of q.steps)attempt(s,id,utteranceById.get(content.scenarios.find(x=>x.id===id)!.positive[0])!.text,'typed',0);if(q.id==='welcome'){assert.equal(s.endingMode,null);const text=utteranceById.get('invitation-0')!.text;attempt(s,'invitation',text,'typed',0,undefined,'lesson-10');completeCharacter(s,'我','trace');assert.equal(s.endingMode,null);completeCharacter(s,'我','quiz');}}
  assert.equal(s.completed.length,6);assert.equal(s.endingMode,'keyboard');assert.deepEqual(s.skills.speaking,{});const relations=structuredClone(s.relations);attempt(s,'invitation',utteranceById.get('invitation-0')!.text,'typed',0);assert.deepEqual(s.relations,relations);assert.equal(s.completed.length,6);assert.ok(validChapter(s));
});
test('spoken chapter tracks only unchanged ASR and keeps sentence/handwriting separate',()=>{
  const s=newChapter();for(const q of content.quests){while(s.day<q.day)endPeriod(s);for(const id of q.steps){const text=utteranceById.get(content.scenarios.find(x=>x.id===id)!.positive[0])!.text;attempt(s,id,text,'audio-asr',1,text);}}
  assert.equal(s.endingMode,null);attempt(s,'invitation',utteranceById.get('invitation-0')!.text,'typed',0,undefined,'lesson-10');completeCharacter(s,'我','quiz');assert.equal(s.endingMode,'audio');
  const n=s.skills.speaking.invitation;attempt(s,'invitation',utteranceById.get('invitation-0')!.text,'edited-transcript',0,'旧的文字');assert.equal(s.skills.speaking.invitation,n);assert.throws(()=>attempt(s,'invitation','x','audio-asr',0),/bản chép/);assert.throws(()=>attempt(s,'invitation','x','typed',0,undefined,'lesson-1'),/khớp/);
});
test('speaking practice before final quest never labels a keyboard ending as audio',()=>{
  const s=newChapter(),text=utteranceById.get('invitation-0')!.text;
  attempt(s,'invitation',text,'audio-asr',0,text);assert.equal(s.skills.speaking.invitation,1);
  for(const q of content.quests){while(s.day<q.day)endPeriod(s);for(const id of q.steps)attempt(s,id,utteranceById.get(content.scenarios.find(x=>x.id===id)!.positive[0])!.text,'typed',0);}
  attempt(s,'invitation',text,'typed',0,undefined,'lesson-10');completeCharacter(s,'我','quiz');
  assert.equal(s.endingMode,'keyboard');assert.equal(s.endingInvitationSource,'typed');assert.ok(validChapter(s));
  const retry=newChapter();for(const q of content.quests){while(retry.day<q.day)endPeriod(retry);for(const id of q.steps)attempt(retry,id,utteranceById.get(content.scenarios.find(x=>x.id===id)!.positive[0])!.text,'typed',0);}
  attempt(retry,'invitation',text,'audio-asr',0,text);attempt(retry,'invitation',text,'typed',0,undefined,'lesson-10');completeCharacter(retry,'我','quiz');assert.equal(retry.endingMode,'audio');
});
test('seeded events repeat deterministically, at most once per day, never change quest requirements',()=>{
  const a=newChapter(123);a.day=5;a.scene='street';assert.equal(eventForScene(a),null);
  for(const q of content.quests.filter(q=>q.day<=4))for(const id of q.steps)attempt(a,id,utteranceById.get(content.scenarios.find(x=>x.id===id)!.positive[0])!.text,'typed',0);
  const b=structuredClone(a),original=structuredClone(content.quests),seen=[];
  for(let n=0;n<3;n++){const e=eventForScene(a);assert.deepEqual(e,eventForScene(b));if(e){seen.push(e.id);assert.ok(finishEvent(a,e.id));assert.ok(finishEvent(b,e.id));assert.equal(finishEvent(a,e.id),false);}}
  assert.equal(new Set(seen).size,seen.length);assert.equal(seen.length,2);assert.deepEqual(content.quests,original);assert.equal(activeQuests(a)[0].id,'delivery');assert.deepEqual(a.relations,b.relations);assert.ok(validChapter(a));
});
test('activities enforce location and daily cooldown; review remains available after day seven',()=>{
  const s=newChapter();assert.throws(()=>dailyActivity(s,'eat'));s.scene='canteen';assert.equal(dailyActivity(s,'eat'),true);assert.equal(dailyActivity(s,'eat'),false);
  attempt(s,'order_water','我要一杯热水。','typed',0);assert.equal(dueReviews(s).length,0);s.day=2;assert.equal(dueReviews(s).length,1);assert.equal(review(s,'order_water-0','我不要热水。'),false);assert.equal(review(s,'order_water-0','我要一杯热水。'),true);assert.equal(dueReviews(s).length,0);s.day=4;assert.equal(dueReviews(s).length,1);review(s,'order_water-0','我要一杯热水。');s.day=8;assert.equal(dueReviews(s).length,1);assert.ok(validChapter(s));
});
test('save rejects schema corruption and imports preserve world and skills',()=>{
  const s=newChapter();s.scene='garden';s.day=8;s.period=2;s.relations.mentor=2;completeCharacter(s,'我','quiz');const decoded=migrateChapter(JSON.parse(JSON.stringify(s)));assert.deepEqual(decoded,s);
  for(const change of [(x:any)=>x.day=0,(x:any)=>x.period=5,(x:any)=>x.skills.speaking.fake=1,(x:any)=>x.scene='missing',(x:any)=>x.schemaVersion=3,(x:any)=>{x.x=120;x.y=180;},(x:any)=>x.completed=['welcome'],(x:any)=>x.steps.arrival=['parcel'],(x:any)=>x.endingMode='audio']){const x=structuredClone(s);change(x);assert.equal(validChapter(x),false);assert.throws(()=>migrateChapter(x));}
  assert.equal(migrateChapter({schemaVersion:1,rewarded:true,x:200,y:400,hint:0,writing:2,journal:[]}).scene,'canteen');
  const legacy=migrateChapter({rewarded:true,x:200,y:260,hint:0,writing:2,journal:[{text:'我要一杯热水。',source:'typed',hint:0}]});assert.equal(legacy.skills.handwriting['我'],2);assert.equal(legacy.journal.length,1);assert.ok(validChapter(legacy));
});
test('all six regions are connected with legal exits and every required character is distinct',()=>{
  const s=newChapter(),visited=new Set([s.scene]);for(let i=0;i<6;i++){const c=content.scenes.find(c=>c.id===s.scene)!;travel(s,c.exits[1]);visited.add(s.scene);}assert.equal(visited.size,6);assert.throws(()=>travel(s,'no-scene'));assert.equal(new Set(content.characters.map(c=>c.id)).size,20);
});
