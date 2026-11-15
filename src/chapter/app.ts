import {Application,Assets,Graphics,Sprite,Text} from 'pixi.js';
import 'pixi.js/unsafe-eval';
import HanziWriter from 'hanzi-writer';
import { createStrokeGuide } from '../stroke-guide';
import {content,validScenarioProposal,sceneById,scenarioById,utteranceById} from './content.ts';
import {activeQuests,attempt,completeCharacter,dailyActivity,dueReviews,endPeriod,eventForScene,finishEvent,newChapter,review,travel,type ChapterSave,type AttemptSource} from './engine.ts';
import {ChapterStore} from './store.ts';
import {questGuidance,scenarioGuidance} from './guidance.ts';
import {questNarratives,lessonContexts,characterContexts,daySixPreparation} from '../content/chapter-context.ts';
import {LocalRecorder} from '../audio/recorder';
import {toMono16k,hasAudibleSignal} from '../audio/pcm';
import {ModelManager} from '../ai/ModelManager';
import {ambientContent,ambientNpcById} from './ambient.ts';
import {mountAmbientPanel} from './ambient-panel.ts';
import './chapter.css';

const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const assetUrl=(path:string)=>'/'+path.replace(/^public\//,'');

export async function startChapter(){
  const root=document.querySelector<HTMLElement>('#app')!;
  root.className='chapter';
  root.innerHTML=`<header class="chapter-header"><div><span class="eyebrow">GIANG NAM · 2026</span><h1>Hẹn ở Giang Nam</h1><p>Bảy ngày đầu, một nơi dần thành nhà.</p></div><div id="chapter-clock"></div></header>
  <nav aria-label="Sổ tay và hoạt động"><button id="chapter-map">Bản đồ</button><button id="chapter-journal">Sổ tay · Ôn tập</button><button id="chapter-lessons">Viết câu</button><button id="chapter-hanzi">Viết tay</button><button id="chapter-data">Lưu & cài đặt</button></nav>
  <div class="chapter-layout"><section class="world"><div id="chapter-canvas"></div><div class="world-caption"><span id="chapter-place"></span><span>WASD / ↑↓←→ · E tương tác · đi tới cạnh màn hình để sang khu mới · Esc đóng</span></div><p id="chapter-near" role="status"></p></section><aside><section class="paper"><h2>Chuyện hôm nay</h2><div id="chapter-quests"></div><button id="chapter-next">Kết thúc buổi</button></section><section class="paper"><h2>Nhịp sống</h2><div id="chapter-daily"></div><div id="chapter-event"></div></section><p class="draft-note">Bản phát triển · audio mẫu tổng hợp, nội dung đang chờ người rà.</p></aside></div>
  <p id="chapter-status" role="status" aria-live="polite"></p><dialog id="chapter-dialog" aria-labelledby="chapter-title"><div class="chapter-toolbar"><button id="chapter-close">Đóng (Esc)</button><button id="chapter-cancel">Hủy AI</button><button id="chapter-clear">Xóa cache AI</button><span id="chapter-ai-status" role="status">AI tải riêng khi sử dụng.</span></div><div id="chapter-body"></div></dialog>`;
  const el=<T extends HTMLElement>(id:string)=>root.querySelector<T>('#chapter-'+id)!;
  const message=(text:string)=>{el('status').textContent=text;};
  const store=new ChapterStore();let save:ChapterSave=newChapter(),storage=true;
  try{save=await store.open();}catch(error){storage=false;message(String(error)+' Tiến độ phiên này vẫn có thể xuất JSON.');}
  let revision=save.revision,queue=Promise.resolve();
  function persist(){const snapshot=structuredClone(save);queue=queue.then(async()=>{if(!storage)return;snapshot.revision=revision;const result=await store.save(snapshot);revision=result.revision;save.revision=revision;}).catch(error=>{storage=false;message(String(error));});return queue;}
  const app=new Application();await app.init({width:960,height:540,background:'#aac5ac',preference:'webgl',antialias:false});
  app.canvas.tabIndex=0;app.canvas.setAttribute('aria-label','Thế giới Giang Nam; WASD hoặc mũi tên để đi, E tương tác');el('canvas').append(app.canvas);
  const background=new Sprite();background.width=960;background.height=540;app.stage.addChild(background);
  const people: {id:string;x:number;y:number;graphic:Graphics;label:Text}[]=[];
  const person=(color:string)=>new Graphics().rect(-6,-28,12,8).fill('#3c3832').rect(-6,-20,12,10).fill('#deb793').rect(-8,-10,16,18).fill(color).rect(-6,8,5,9).fill('#32444d').rect(1,8,5,9).fill('#32444d');
  // Small, static costume details stay within the existing person bounds and do not affect interaction.
  const npcDetails:Record<string,{role:string;draw:(g:Graphics)=>void}>={
    mentor:{role:'Giáo viên',draw:g=>{g.rect(-5,-8,10,3).fill('#e7dfc6').rect(-2,-5,4,8).fill('#e7dfc6');}},
    roommate:{role:'Bạn cùng phòng',draw:g=>{g.rect(-6,-27,3,13).fill('#3c3832').rect(3,-27,3,13).fill('#3c3832');}},
    officer:{role:'Phụ trách sinh viên',draw:g=>{g.rect(-5,-7,10,3).fill('#dce6dc').rect(-2,-4,4,4).fill('#bfa76d');}},
    seller:{role:'Nhà ăn',draw:g=>{g.rect(-5,-7,10,12).fill('#f2e8d1').rect(-3,-1,6,2).fill('#b67c46');}},
    shopkeeper:{role:'Chủ cửa hàng',draw:g=>{g.rect(-6,-5,12,3).fill('#e8c879').rect(-4,1,8,3).fill('#e8c879');}},
    courier:{role:'Giao hàng',draw:g=>{g.rect(-6,-28,12,4).fill('#e5c46c').rect(3,-6,5,8).fill('#d8b988');}},
  };
  for(const npc of content.npcs){const graphic=person(npc.color),detail=npcDetails[npc.id];detail?.draw(graphic);const label=new Text({text:npc.name+(detail?'\n'+detail.role:''),style:{fontFamily:'Jiangnan, sans-serif',fontSize:16,fill:'#213e3a',stroke:{color:'#f9f4e0',width:3},align:'center',wordWrap:true,wordWrapWidth:180,breakWords:true}});app.stage.addChild(graphic,label);people.push({id:npc.id,x:0,y:0,graphic,label});}
  // Nine ambient residents plus the story NPC form the ten-NPC benchmark scene.
  const ambient=Array.from({length:9},(_,i)=>{const g=person(['#849367','#9c7c63','#648d9d','#b5868f'][i%4]);g.position.set(80+i*100,460);app.stage.addChild(g);return g;});
  const neighbors=ambientContent.npcs.map(npc=>{
    const graphic=ambient[npc.ambientIndex];
    if(npc.id==='guard')graphic.rect(-7,-28,14,4).fill('#354d65').rect(-2,-7,4,4).fill('#e6c770');
    if(npc.id==='elder-c')graphic.rect(-6,-28,12,7).fill('#ece8db');
    const label=new Text({text:npc.name+'\nTrò chuyện · E',style:{fontFamily:'Jiangnan, sans-serif',fontSize:14,fill:'#213e3a',stroke:{color:'#f9f4e0',width:3},align:'center'}});
    app.stage.addChild(label);return {id:npc.id,x:graphic.x,y:460,graphic,label,scene:npc.scene};
  });
  const player=person('#456f9c');app.stage.addChild(player);
  // Read-only canvas diagnostics for checking the actual rendered label bounds.
  (window as unknown as {__chapterLabels:()=>unknown}).__chapterLabels=()=>people.filter(p=>p.label.visible).map(p=>{const b=p.label.getBounds();return {id:p.id,text:p.label.text,x:b.minX,y:b.minY,width:b.width,height:b.height};});
  const keys=new Set<string>(),dialog=el<HTMLDialogElement>('dialog'),body=el('body'),recorder=new LocalRecorder(),model=new ModelManager();
  let session=0,version=0,clearing=false,url='',writer:HanziWriter|null=null,sceneVersion=0,sceneTransitioning=false,panelCleanup=()=>{},panelCancel='';
  function cancelAI(){version++;recorder.cancel();model.cancel();el('ai-status').textContent='Đã hủy AI; bạn có thể thử lại hoặc gõ.';}
  model.onProgress=(file,loaded,total)=>{el('ai-status').textContent=`${file.split('/').at(-1)} · ${(loaded/1048576).toFixed(1)}/${(total/1048576).toFixed(1)} MiB`;};
  el('cancel').onclick=cancelAI;
  el('clear').onclick=async()=>{if(clearing)return;clearing=true;cancelAI();try{for(const name of await caches.keys())if(name.startsWith('jiangnan-models-'))await caches.delete(name);el('ai-status').textContent='Đã xóa cache AI; tiến độ vẫn được giữ.';}catch{el('ai-status').textContent='Không truy cập được cache; có thể tiếp tục bằng gõ.';}finally{clearing=false;}};
  function close(){session++;panelCleanup();panelCleanup=()=>{};cancelAI();writer?.cancelQuiz();writer=null;if(url)URL.revokeObjectURL(url);url='';dialog.close();body.replaceChildren();keys.clear();app.canvas.focus();if(panelCancel)message(panelCancel);panelCancel='';void persist();}
  el('close').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  function panel(title:string,html:string){session++;panelCleanup();panelCleanup=()=>{};panelCancel='';cancelAI();writer?.cancelQuiz();writer=null;if(url)URL.revokeObjectURL(url);url='';keys.clear();body.innerHTML=`<h2 id="chapter-title">${escape(title)}</h2>${html}`;if(!dialog.open)dialog.showModal();}
  function render(){
    el('clock').innerHTML=`<strong>Ngày ${save.day} · ${['Buổi sáng','Buổi chiều','Buổi tối'][save.period]}</strong><span>2026 · ${save.completed.length}/6 nhiệm vụ</span>`;
    const scene=sceneById.get(save.scene)!;el('place').textContent=scene.name+' · '+scene.zh;
    el('quests').replaceChildren();const active=activeQuests(save);
    if(save.endingMode)el('quests').innerHTML=`<h3>Đã đến ngày đón bạn!</h3><p>Bạn đã hoàn tất chương mở đầu. ${save.endingMode==='audio'?'Đã có bản chép lời mời từ bản thu chưa sửa.':'Bạn hoàn thành bằng bàn phím; chưa tính là luyện nói có âm thanh.'}</p><p>Có thể tiếp tục ngày mới để ôn tập.</p>`;
    else if(!active.length)el('quests').textContent='Đã xong việc hôm nay. Khám phá, luyện tập hoặc chuyển buổi; việc lỡ hẹn có thể làm vào ngày sau.';
    for(const quest of active){const guidance=questGuidance(save,quest);const box=document.createElement('div');box.dataset.guidance=guidance.id;box.innerHTML=`<h3>${escape(quest.title)}</h3><p>${quest.steps.map(id=>(save.steps[quest.id]?.includes(id)?'✓ ':'○ ')+escape(scenarioById.get(id)!.label)).join('<br>')}</p><p>${escape(guidance.text)}</p>${quest.id===content.endingQuest?'<p>Cần thêm bài viết lời mời và tự viết chữ 我.</p>':''}`;el('quests').append(box);}
    if(!active.length&&!save.endingMode){const next=content.quests.find(q=>!save.completed.includes(q.id));if(next){const info=questGuidance(save,next);const p=document.createElement('p');p.dataset.guidance=info.id;p.textContent=`${next.title} · ${info.text}`;el('quests').append(p);}}
    if(!save.endingMode&&save.day>=6&&save.completed.includes('delivery')&&!save.completed.includes('welcome')){const prep=document.createElement('div');const description=document.createElement('p');description.textContent=daySixPreparation.text;prep.append(description);const lesson=document.createElement('button');lesson.textContent=(save.skills.sentence['lesson-10']?'✓ ':'')+'Bài viết lời mời';lesson.onclick=()=>{const item=content.sentenceLessons.find(l=>l.id==='lesson-10')!;openScenario(item.scenario,item.id);};const character=document.createElement('button');character.textContent=(save.skills.handwriting['我']?'✓ ':'')+'Tự viết chữ 我';character.onclick=()=>openHanzi('我');prep.append(lesson,character);el('quests').append(prep);}
    el('daily').replaceChildren();for(const activity of content.activities.filter(a=>a.scene===save.scene&&(a.id!=='review'||content.npcs.find(n=>n.id==='mentor')!.schedule[save.period]===save.scene))){const b=document.createElement('button');b.textContent=(save.activities.includes(`${save.day}:${activity.id}`)?'✓ ':'')+activity.label;b.disabled=save.activities.includes(`${save.day}:${activity.id}`);b.onclick=()=>openScenario(activity.scenario,undefined,()=>dailyActivity(save,activity.id),undefined,`Sinh hoạt tự chọn: ${activity.label}.`);el('daily').append(b);}
    el('event').replaceChildren();const event=eventForScene(save);if(event){const b=document.createElement('button');b.className='event-button';b.textContent='Bất ngờ · '+event.label;b.onclick=()=>openScenario(event.scenario,undefined,()=>finishEvent(save,event.id),undefined,`Sự kiện tự chọn: ${event.label}.`);el('event').append(b);}
  }
  async function changeScene(id:string,initial=false){
    if(sceneTransitioning&&!initial)return;
    sceneTransitioning=true;const token=++sceneVersion;keys.clear();el('near').textContent='';
    try{
      if(!initial)travel(save,id);const scene=sceneById.get(save.scene)!;
      try{const texture=await Assets.load(assetUrl(scene.art.path));if(token!==sceneVersion)return;background.texture=texture;background.width=960;background.height=540;}catch{if(token!==sceneVersion)return;message('Không tải được bản đồ. Hãy thử lại khi có mạng hoặc dùng bản đã cache.');}
      const visible=content.npcs.filter(n=>n.schedule[save.period]===save.scene);
      people.forEach(person=>{const i=visible.findIndex(n=>n.id===person.id);person.graphic.visible=person.label.visible=i>=0;person.x=360+i*200;person.y=325;person.graphic.position.set(person.x,person.y);person.label.position.set(person.x-person.label.width/2,person.y-37-person.label.height);});
      neighbors.forEach(n=>{n.label.visible=n.scene===save.scene;n.label.position.set(n.x-n.label.width/2,n.y-37-n.label.height);});
      player.position.set(save.x,save.y);render();if(!initial)app.canvas.focus();void persist();
    } finally {if(token===sceneVersion)sceneTransitioning=false;}
  }
  function npcPanel(id:string){const npc=content.npcs.find(n=>n.id===id)!;const scenarios=content.scenarios.filter(s=>s.npc===id);panel(npc.name,`<p>${id==='mentor'?'Mỗi cuộc gặp là một lần thử. Chọn mức gợi ý và giảm dần khi đã tự tin.':'Chọn việc bạn muốn trao đổi.'}</p><div id="chapter-topics"></div>`);for(const s of scenarios){const button=document.createElement('button');const guidance=scenarioGuidance(save,s.id);button.textContent=s.label+(guidance?({'active':' · Việc đang làm','locked':' · Chưa mở nhiệm vụ','complete':' · Luyện lại','replay':' · Luyện lại bước đã xong'}[guidance.branch]):' · Luyện tập');button.onclick=()=>openScenario(s.id);el('topics').append(button);}if(id==='mentor'){const button=document.createElement('button');button.textContent='Ôn câu đến hạn · '+dueReviews(save).length;button.onclick=openJournal;el('topics').append(button);}}
  function openScenario(id:string,lesson?:string,onSuccess?:()=>unknown,reviewId?:string,context?:string){
    const scenario=scenarioById.get(id)!;const example=utteranceById.get(scenario.positive[0])!;
    panel((lesson?'Viết câu · ':'')+scenario.label,`<p>${escape(scenario.goal)}</p><p class="components">Thành phần cần có: ${escape(scenario.components.join(' · '))}</p><div class="hint-buttons"><button data-level="1">Gợi ý 1 · Nhắc ý</button><button data-level="2">Gợi ý 2 · Từ khóa</button><button data-level="3">Gợi ý 3 · Câu mẫu</button></div><p id="chapter-hint"></p><div id="chapter-sample"><button id="chapter-listen">Nghe mẫu</button><button id="chapter-slow">Nghe chậm</button><span>Audio tổng hợp · chờ rà</span></div><label for="chapter-answer">Câu tiếng Trung (dùng Chinese Pinyin IME của hệ điều hành)</label><textarea id="chapter-answer" maxlength="1000" rows="3" placeholder="Nhập câu tiếng Trung"></textarea><div><button id="chapter-send" class="primary">Gửi câu</button>${lesson?'':'<button id="chapter-record">Thu âm · tối đa 20 giây</button><button id="chapter-stop">Dừng thu</button>'}<button id="chapter-check">Thử AI local</button></div><audio id="chapter-playback" controls hidden></audio><p id="chapter-feedback" role="status"></p>`);
    const guidance=scenarioGuidance(save,id);const narrative=guidance&&questNarratives[guidance.quest.id];const contextLine=document.createElement('p');contextLine.dataset.guidance=guidance?.id??'guidance-default.practice.entry';contextLine.textContent=[context,lesson?lessonContexts[lesson]:reviewId?'Ôn sổ tay.':guidance?`${guidance.quest.title}: ${narrative?.entry??''} ${narrative?.[guidance.branch]??''} ${guidance.text}`:'Luyện tập tự chọn.'].filter(Boolean).join(' ');body.querySelector('h2')!.after(contextLine);
    panelCancel=narrative?.cancel??'Đã đóng hội thoại; tiến độ giữ nguyên. Có thể mở lại để thử tiếp.';
    const current=session,answer=el<HTMLTextAreaElement>('answer'),feedback=el('feedback');let hint=0,raw='',draft=0,composing=false,composed=false;
    const prompt=utteranceById.get(scenario.prompt)!,reply=utteranceById.get(scenario.reply)!;
    const promptBox=document.createElement('div');promptBox.className='npc-line';promptBox.innerHTML=`<p lang="zh-Hans"><strong>${escape(prompt.text)}</strong></p>${save.settings.pinyin?`<p>${escape(prompt.pinyin)}</p>`:''}${save.settings.meaning?`<p>${escape(prompt.meaningVi)}</p>`:''}<button id="chapter-npc-listen">Nghe NPC</button>`;el('sample').before(promptBox);
    const npcAudio=new Audio(assetUrl(prompt.audio.path));npcAudio.volume=save.settings.volume;el('npc-listen').onclick=()=>void npcAudio.play().catch(()=>feedback.textContent='Không phát được lời NPC.');
    const sample=new Audio(assetUrl(example.audio.path));sample.volume=save.settings.volume;
    // Closing a panel must stop its audio as well as inference.
    panelCleanup=()=>{sample.pause();sample.currentTime=0;npcAudio.pause();npcAudio.currentTime=0;};
    el('listen').onclick=()=>{sample.playbackRate=1;void sample.play().catch(()=>feedback.textContent='Không phát được mẫu; hãy thử lại.');};
    el('slow').onclick=()=>{sample.playbackRate=.75;void sample.play().catch(()=>feedback.textContent='Không phát được mẫu; hãy thử lại.');};
    body.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.onclick=()=>{hint=Math.max(hint,Number(b.dataset.level));el('hint').textContent=scenario.hints[Number(b.dataset.level)-1];});
    answer.oninput=()=>{draft++;};answer.addEventListener('compositionstart',()=>{composing=true;});answer.addEventListener('compositionend',()=>{composing=false;composed=true;setTimeout(()=>composed=false,0);});
    const submit=()=>{
      if(composing||composed)return;const text=answer.value;if(!text.trim())return;cancelAI();
      const source:AttemptSource=raw?(text===raw?'audio-asr':'edited-transcript'):'typed';
      const before=new Set(save.completed),currentGuidance=scenarioGuidance(save,id);const result=attempt(save,id,text,source,hint,raw||undefined,lesson);feedback.textContent=result.reason;
      if(result.accepted){const extra=onSuccess?.();if(reviewId)review(save,reviewId,text);const completed=content.quests.filter(q=>!before.has(q.id)&&save.completed.includes(q.id));const outcome=completed.length?`Hoàn thành nhiệm vụ: ${completed.map(q=>q.title).join(', ')}.`:currentGuidance?.branch==='locked'?'Đã luyện tập; nhiệm vụ chưa mở.':currentGuidance?.branch==='complete'||currentGuidance?.branch==='replay'?'Đã luyện lại; không nhận lại thưởng nhiệm vụ.':'Đã ghi nhận lần luyện tập hoặc bước nhiệm vụ.';feedback.textContent=`${reply.text} ${save.settings.pinyin?reply.pinyin:''} ${save.settings.meaning?reply.meaningVi:''} ${outcome} ${context&&extra===true?'Đã hoàn thành hoạt động hoặc sự kiện này.':''} Câu đã vào sổ tay.`;panelCancel='';render();void persist();}
      else {feedback.textContent += ' '+(narrative?.error??'Xem gợi ý và thử lại.');panelCancel=narrative?.cancel??'Đã đóng hội thoại; tiến độ giữ nguyên. Có thể mở lại để thử tiếp.';void persist();}
    };
    el('send').onclick=submit;answer.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!composing&&!composed){e.preventDefault();submit();}};
    el('check').onclick=async()=>{if(clearing||!answer.value.trim())return;cancelAI();const token=version,text=answer.value,changed=draft;feedback.textContent='Đang thử model; bạn vẫn có thể gõ và gửi.';try{const output=await model.evaluate(text,{id,goal:scenario.goal,positive:scenario.positive.map(id=>utteranceById.get(id)!.text),negative:scenario.negative.map(id=>utteranceById.get(id)!.text)});if(current!==session||token!==version||changed!==draft)return;let proposal;try{proposal=JSON.parse(output);}catch{proposal=null;}feedback.textContent=validScenarioProposal(proposal,id,text)?'AI gợi ý đúng ý trong cảnh. Bấm Gửi để xác nhận.':'AI chưa xác nhận được ý phù hợp. Bạn có thể dùng gợi ý rồi gửi lại; tiến độ được kiểm bằng luật của tình huống.';}catch{if(current===session&&token===version)feedback.textContent='AI không khả dụng. Tiếp tục bằng gõ hoặc thử lại.';}};
    if(!lesson){
      el('stop').onclick=()=>recorder.stop();
      el('record').onclick=async()=>{if(clearing)return;cancelAI();const token=version,changed=draft;feedback.textContent='Đang xin quyền micro…';try{await recorder.start(blob=>{void (async()=>{
        if(current!==session||token!==version)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);const playback=el<HTMLAudioElement>('playback');playback.src=url;playback.hidden=false;let context:AudioContext|undefined;
        try{context=new AudioContext();const decoded=await context.decodeAudioData(await blob.arrayBuffer());if(current!==session||token!==version||changed!==draft)return;
          const pcm=toMono16k(Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i)),decoded.sampleRate);if(!hasAudibleSignal(pcm)){feedback.textContent='Bản thu im lặng/quá nhỏ; hãy thu lại.';return;}feedback.textContent='Đang chép lời tại máy…';const text=await model.transcribe(pcm);if(current!==session||token!==version||changed!==draft)return;raw=text;answer.value=text;feedback.textContent='Hãy kiểm tra bản chép; sửa hoặc thu lại nếu cần. Bản chép không phải điểm phát âm.';
        }catch{if(current===session&&token===version)feedback.textContent='Không chép được lời; có thể gõ hoặc thử lại.';}finally{await context?.close();}
      })();});if(current===session&&token===version)feedback.textContent='Đang thu âm… tối đa 20 giây. Bấm Dừng thu khi nói xong.';}catch{if(current===session&&token===version)feedback.textContent='Không dùng được mic. Hãy kiểm quyền/thiết bị hoặc tiếp tục gõ.';}};
    }
    answer.focus();
  }
  function openJournal(){
    const independent=save.attempts.filter(a=>a.accepted&&a.hint===0).length;
    panel('Sổ tay · Ôn tập',`<p>Ôn sau 1, 3, 7 ngày kể từ khi học; bạn có thể tiếp tục sinh hoạt sau ngày 7.</p><p>Nói: ${Object.keys(save.skills.speaking).length} tình huống · Viết câu: ${Object.keys(save.skills.sentence).length}/10 · Viết tay: ${Object.keys(save.skills.handwriting).length}/20 chữ</p><p>${independent} lần truyền đạt đúng mà không dùng gợi ý.</p><div id="chapter-entries"></div>`);
    const due=dueReviews(save),playing:HTMLAudioElement[]=[];
    panelCleanup=()=>playing.forEach(audio=>{audio.pause();audio.currentTime=0;});
    if(!save.journal.length)el('entries').textContent='Câu đầu tiên bạn dùng đúng sẽ xuất hiện ở đây.';
    for(const item of save.journal){
      const source={'typed':'Câu gõ','audio-asr':'Bản chép chưa sửa','edited-transcript':'Bản chép đã sửa'}[item.source];
      const card=document.createElement('article');card.className='journal-card';
      card.innerHTML=`<strong lang="zh-Hans">${escape(item.text)}</strong>${save.settings.pinyin?`<p>${escape(item.pinyin)}</p>`:''}${save.settings.meaning?`<p>${escape(item.meaningVi)}</p>`:''}<p>${escape(item.context)} · ${source} · gợi ý ${item.hint}</p><small>Ôn ngày ${item.dueDays.join(', ')}</small>`;
      const listen=document.createElement('button');listen.textContent='Nghe câu';
      const audio=new Audio(assetUrl(utteranceById.get(item.id)!.audio.path));audio.volume=save.settings.volume;playing.push(audio);
      listen.onclick=()=>{playing.forEach(other=>other.pause());void audio.play().catch(()=>message('Không phát được mẫu; hãy thử lại.'));};card.append(listen);
      const button=document.createElement('button');button.textContent=due.includes(item)?'Đến hạn · Ôn lại':'Luyện lại';button.onclick=()=>{const s=content.scenarios.find(s=>s.positive.includes(item.id))!;openScenario(s.id,undefined,undefined,item.id);};card.append(button);el('entries').append(card);
    }
  }
  function openLessons(){panel('Viết câu qua Pinyin IME','<p>Bật Chinese Pinyin trong cài đặt bàn phím của hệ điều hành. Enter chọn chữ trong IME; sau khi chọn xong mới gửi câu.</p><div id="chapter-lesson-list"></div>');for(const lesson of content.sentenceLessons){const b=document.createElement('button');b.textContent=(save.skills.sentence[lesson.id]?'✓ ':'')+lesson.title;b.onclick=()=>openScenario(lesson.scenario,lesson.id);el('lesson-list').append(b);}}
  function openChat(id:string){
    const npc=ambientNpcById.get(id);if(!npc)return;
    panel(npc.name,'');const current=session;save.chats??={};
    panelCancel='Đã tạm biệt; lượt trò chuyện được giữ để bạn tiếp tục lần sau.';
    el('clear').hidden=true;el('cancel').textContent='Hủy thu / chép lời';
    const cancelChatAudio=()=>{cancelAI();el('ai-status').textContent='Bạn có thể gõ hoặc thu âm; đủ ý là được.';};
    const cleanup=mountAmbientPanel({body,npc,progress:save.chats,settings:save.settings,recorder,model,cancelAI:cancelChatAudio,current:()=>session===current,persist:()=>{void persist();},close});
    panelCleanup=()=>{cleanup();el('clear').hidden=false;el('cancel').textContent='Hủy AI';};
  }
  function openHanzi(char='我'){
    panel('Viết tay · '+char,`<label>Chữ mục tiêu <select id="chapter-character">${content.characters.map(c=>`<option${c.id===char?' selected':''}>${c.character}</option>`).join('')}</select></label><div id="chapter-writer"></div><div><button id="chapter-trace">Tô nét</button><button id="chapter-stroke">Gợi nét tiếp</button><button id="chapter-quiz">Tự viết / Thử lại</button></div><p id="chapter-stroke-feedback" role="status">Tô và gợi nét để làm quen, tự viết để lưu tiến bộ.</p><p>Đã tự viết chữ này ${save.skills.handwriting[char]??0} lần.</p>`);
    const context=document.createElement('p');context.textContent=characterContexts[char]??'';body.querySelector('h2')!.after(context);
    const current=session;let stroke=0;const guide=createStrokeGuide(el('writer'),300,20);panelCleanup=()=>guide.dispose();writer=HanziWriter.create('chapter-writer',char,{width:300,height:300,padding:20,showOutline:true,showCharacter:false,charDataLoader:()=>fetch('/hanzi/'+encodeURIComponent(char)+'.json').then(r=>{if(!r.ok)throw Error('Thiếu dữ liệu chữ');return r.json();}),onLoadCharDataSuccess:data=>guide.setData(data)});
    el<HTMLSelectElement>('character').onchange=e=>openHanzi((e.target as HTMLSelectElement).value);
    el('trace').onclick=()=>{guide.hide();writer?.cancelQuiz();void writer?.animateCharacter();el('stroke-feedback').textContent='Theo dõi thứ tự nét, sau đó chọn Tự viết để thử.';};
    el('stroke').onclick=()=>{guide.setStroke(stroke);void writer?.highlightStroke(stroke);};
    el('quiz').onclick=()=>{stroke=0;guide.setStroke(stroke);writer?.quiz({showHintAfterMisses:2,onMistake:()=>{if(current===session)el('stroke-feedback').textContent='Nét chưa đúng vị trí hoặc thứ tự. Hãy thử lại; có thể dùng Gợi nét.';},onCorrectStroke:()=>{stroke++;guide.setStroke(stroke);if(current===session)el('stroke-feedback').textContent='Đúng nét '+stroke;},onComplete:()=>{guide.hide();if(current!==session)return;completeCharacter(save,char,'quiz');el('stroke-feedback').textContent='Đã tự viết xong '+char+'; tiến bộ viết tay được lưu riêng.';render();void persist();}});};
  }
  function openData(){panel('Lưu & cài đặt',`<p>Bản lưu trên thiết bị, có dự phòng trước lần ghi. Xuất JSON để chuyển máy.</p><button id="chapter-export">Xuất bản lưu JSON</button><label class="import-label">Nhập bản lưu JSON <input id="chapter-import" type="file" accept="application/json,.json"></label><label>Âm lượng mẫu <input id="chapter-volume" type="range" min="0" max="1" step="0.1" value="${save.settings.volume}"></label><label><input id="chapter-show-pinyin" type="checkbox" ${save.settings.pinyin?'checked':''}>Hiện pinyin trong sổ tay</label><label><input id="chapter-show-meaning" type="checkbox" ${save.settings.meaning?'checked':''}>Hiện nghĩa Việt trong sổ tay</label><button id="chapter-offline">Chuẩn bị chơi offline (không gồm AI)</button><p id="chapter-data-feedback" role="status"></p>`);
    el('export').onclick=()=>{const blob=new Blob([store.exportJSON(save)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`giang-nam-ngay-${save.day}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    el<HTMLInputElement>('import').onchange=async e=>{const file=(e.target as HTMLInputElement).files?.[0];if(!file)return;message('Đang nhập bản lưu…');try{if(file.size>2*1024*1024)throw Error('Tệp lớn hơn 2 MiB.');await queue;save=await store.importJSON(await file.text());revision=save.revision;storage=true;close();await changeScene(save.scene,true);message('Đã nhập bản lưu; bản trước được giữ làm dự phòng.');}catch(error){el('data-feedback').textContent=String(error);}};
    el<HTMLInputElement>('volume').oninput=e=>{save.settings.volume=Number((e.target as HTMLInputElement).value);void persist();};
    el<HTMLInputElement>('show-pinyin').onchange=e=>{save.settings.pinyin=(e.target as HTMLInputElement).checked;void persist();};el<HTMLInputElement>('show-meaning').onchange=e=>{save.settings.meaning=(e.target as HTMLInputElement).checked;void persist();};
    el('offline').onclick=async()=>{const current=session;try{if(!('serviceWorker' in navigator))throw Error('Trình duyệt không hỗ trợ cache offline.');const registration=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;const target=registration.active;if(!target)throw Error('Hãy tải lại trang rồi thử.');const channel=new MessageChannel();channel.port1.onmessage=e=>{if(current===session)el('data-feedback').textContent=e.data.ok?'Đã cache bộ chơi. Bạn có thể tải lại offline; AI chỉ có khi đã tải/cached riêng.':'Không cache đủ bộ chơi; chưa sẵn sàng offline.';};target.postMessage({type:'prepare-offline'},[channel.port2]);el('data-feedback').textContent='Đang cache bộ chơi…';}catch(error){if(current===session)el('data-feedback').textContent=String(error);}};
  }
  el('journal').onclick=openJournal;el('lessons').onclick=openLessons;el('hanzi').onclick=()=>openHanzi();el('data').onclick=openData;
  el('map').onclick=()=>{panel('Bản đồ Giang Nam',`<p>Sáu vùng nối thành một vòng: ký túc → cổng trường → thư viện → nhà ăn → phố → vườn → ký túc.</p><ol>${content.scenes.map(s=>`<li>${escape(s.name)} · <span lang="zh-Hans">${s.zh}</span> · ${s.pinyin}${s.id===save.scene?' · Bạn đang ở đây':''}</li>`).join('')}</ol><h3>Mọi người đang ở đâu?</h3><ul>${content.npcs.map(n=>`<li>${escape(n.name)} · ${escape(sceneById.get(n.schedule[save.period])!.name)}</li>`).join('')}</ul><p>Đi tới cạnh trái hoặc phải của màn hình để sang vùng kế tiếp. NPC đứng ở lối đi giữa.</p>`);};
  el('next').onclick=()=>{endPeriod(save);void changeScene(save.scene,true);};
  el('map').addEventListener('click',()=>{
    const heading=document.createElement('h3');heading.textContent='Trò chuyện đời thường · tự chọn';body.append(heading);
    const list=document.createElement('ul');for(const npc of ambientContent.npcs){const item=document.createElement('li');item.textContent=`${npc.name} · ${sceneById.get(npc.scene)!.name} · đứng ở lối đi phía dưới`;list.append(item);}body.append(list);
  });
  const controlWorld=()=>!sceneTransitioning&&!dialog.open&&(document.activeElement===app.canvas||document.activeElement===document.body);
  const nearestNpc=()=>[...people.filter(n=>n.graphic.visible).map(n=>({...n,chat:false})),...neighbors.filter(n=>n.scene===save.scene).map(n=>({...n,chat:true}))].filter(n=>Math.hypot(save.x-n.x,save.y-n.y)<75).sort((a,b)=>Math.hypot(save.x-a.x,save.y-a.y)-Math.hypot(save.x-b.x,save.y-b.y))[0];
  const interact=()=>{const person=nearestNpc();if(person){if(person.chat)openChat(person.id);else npcPanel(person.id);return;}message('Đi tới cạnh màn hình để sang khu tiếp theo hoặc đến gần NPC để trò chuyện.');};
  window.addEventListener('keydown',e=>{if(!controlWorld()){keys.clear();return;}if(e.key.toLowerCase()==='e'&&!e.repeat){e.preventDefault();interact();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(!e.repeat)keys.add(e.key.toLowerCase());});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));document.addEventListener('focusin',()=>{if(!controlWorld())keys.clear();});window.addEventListener('blur',()=>{keys.clear();void persist();});
  app.ticker.add(t=>{if(!controlWorld()){keys.clear();return;}const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),len=Math.hypot(dx,dy)||1,speed=Math.min(t.deltaTime,3)*2.8;
    const blocked=(x:number,y:number)=>x<32||x>928||y<32||y>508||sceneById.get(save.scene)!.colliders.some(([l,top,r,b])=>x+8>l&&x-8<r&&y+16>top&&y-22<b);
    let x=save.x+dx/len*speed,y=save.y+dy/len*speed;const scene=sceneById.get(save.scene)!;const edgeExit=dx<0&&x<32?scene.exits[0]:dx>0&&x>928?scene.exits[1]:undefined;
    if(edgeExit&&!sceneTransitioning){void changeScene(edgeExit);return;}
    if(!blocked(x,save.y))save.x=x;if(!blocked(save.x,y))save.y=y;player.position.set(save.x,save.y);
    const near=nearestNpc();el('near').textContent=near?'E · '+(near.chat?'Trò chuyện với '+ambientNpcById.get(near.id)!.name+' · Tự chọn':'Nói chuyện với '+content.npcs.find(n=>n.id===near.id)!.name):save.x<115||save.x>845?'Đi tới cạnh màn hình để sang '+sceneById.get(save.x<115?scene.exits[0]:scene.exits[1])!.name:'Khám phá khu vực và tìm người trò chuyện.';
    ambient.forEach((g,i)=>{g.y=460+Math.sin(performance.now()/1500+i)*3;});
  });
  window.addEventListener('pagehide',()=>{cancelAI();void persist();});
  if(import.meta.env.DEV)(window as unknown as {__chapterTest?:unknown}).__chapterTest={snapshot:()=>structuredClone(save),npc:(id:string)=>npcPanel(id),chat:(id:string)=>openChat(id),flush:()=>persist(),position:()=>({x:save.x,y:save.y})};
  await changeScene(save.scene,true);app.canvas.focus();
}
