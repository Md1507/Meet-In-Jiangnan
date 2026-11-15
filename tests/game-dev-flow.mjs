import {chromium} from 'playwright';
import {preview} from 'vite';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const dir='docs/playtest/01M7AWMZ6C065JP5EHAZABVRFS';
const runId=process.env.GAME_DEV_RUN_ID || 'manual';
const evidence=`${dir}/evidence/${runId}`;mkdirSync(evidence,{recursive:true});
const chapterContent=JSON.parse(readFileSync('src/content/mvp.json'));
const scenePaths=chapterContent.scenes.map(s=>'/'+s.art.path.replace(/^public\//,''));
const results=[];
const server=await preview({preview:{host:'127.0.0.1',port:0,strictPort:true}});
let browser;
try{
 const address=server.httpServer.address(),url=`http://127.0.0.1:${address.port}`;
 const originalCwd=process.cwd();try{process.chdir(tmpdir());browser=await chromium.launch({headless:true,env:{...process.env,CHROME_LOG_FILE:path.join(tmpdir(),`game-dev-chromium-${runId}.log`)}});}finally{process.chdir(originalCwd);}console.log('Chromium '+browser.version());
 for(const viewport of [{width:1280,height:720},{width:1920,height:1080}]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],failed=[],loaded=new Set();
  page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)failed.push(r.url()+' '+r.status());if(r.status()===200)loaded.add(new URL(r.url()).pathname);});
  await page.goto(url);await page.locator('#chapter-canvas canvas').waitFor();await page.evaluate(()=>document.fonts.ready);
  const state=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('jiangnan-chapter');r.onsuccess=()=>{const db=r.result,tx=db.transaction('state'),q=tx.objectStore('state').get('current');q.onsuccess=()=>resolve(q.result);tx.oncomplete=()=>db.close();};r.onerror=()=>reject(r.error);}));
  const walkUntil=async(key,selector,text)=>{await page.locator('#chapter-canvas canvas').focus();await page.keyboard.down(key);try{await page.waitForFunction(({selector,text})=>document.querySelector(selector).textContent.includes(text),{selector,text},{timeout:8000});}finally{await page.keyboard.up(key);}};
  const importSave=async name=>{await page.click('#chapter-data');await page.locator('#chapter-import').setInputFiles(`${dir}/saves/${name}.json`);if(name==='invalid-schema'){await page.locator('#chapter-data-feedback').getByText(/không đúng schema/i).waitFor();return;}await page.locator('#chapter-dialog').waitFor({state:'hidden'});await page.getByText('Đã nhập bản lưu',{exact:false}).waitFor();};
  for(const name of ['new-game','canteen-before','canteen-after','day6-preparation','day7-ending-ready']){await importSave(name);const expected=JSON.parse(readFileSync(`${dir}/saves/${name}.json`));const actual=await state();assert.equal(actual.day,expected.day);assert.deepEqual(actual.completed,expected.completed);}
  await importSave('invalid-schema');const kept=await state();assert.equal(kept.day,7);await page.keyboard.press('Escape');
  const utterance=id=>chapterContent.utterances.find(u=>u.id===id).text;
  const openQuest=async(q,branch,step=q.steps[0])=>{
   await importSave(`${q.id}-${step===q.steps[0]?'':step+'-'}${branch}`);
   const current=await state(),scenario=chapterContent.scenarios.find(s=>s.id===step);
   const present=chapterContent.npcs.filter(n=>n.schedule[current.period]===current.scene);
   const index=present.findIndex(n=>n.id===scenario.npc);assert.ok(index>=0,`${q.id} NPC scheduled here`);
   await walkUntil(index===0?'a':'d','#chapter-near','E · Nói chuyện với '+present[index].name);
   await page.keyboard.press('e');await page.locator('#chapter-dialog[open]').waitFor();
   assert.equal(await page.locator('#chapter-title').innerText(),present[index].name);
   const topic=page.locator('#chapter-topics button').filter({hasText:scenario.label}).first();
   assert.match(await topic.innerText(),branch==='locked'?/Chưa mở/:branch==='complete'?/Luyện lại/:/Việc đang làm/);
   await topic.click();assert.ok((await page.locator('#chapter-body').innerText()).includes(q.title));
   return scenario;
  };
  const submit=async text=>{await page.locator('#chapter-answer').fill(text);await page.click('#chapter-send');};
  // Exercise the optional canteen activity and event independently of quest rewards.
  for(const [selector,key] of [['#chapter-daily button','activities'],['#chapter-event button','events']]){
   await importSave('canteen-after');const before=await state();await page.locator(selector).click();
   assert.match(await page.locator('#chapter-body').innerText(),key==='activities'?/Sinh hoạt tự chọn/ : /Sự kiện tự chọn/);
   await submit(utterance(chapterContent.scenarios.find(s=>s.id==='order_water').negative[0]));
   assert.deepEqual((await state())[key],before[key]);await page.keyboard.press('Escape');
   await page.locator(selector).click();await submit(utterance(chapterContent.scenarios.find(s=>s.id==='order_water').positive[0]));
   await page.locator('#chapter-feedback').getByText('Đã hoàn thành hoạt động hoặc sự kiện này.',{exact:false}).waitFor();
   await page.keyboard.press('Escape');await page.reload();await page.locator('#chapter-canvas canvas').waitFor();
   const after=await state();assert.ok(after[key].includes(`2:${key==='activities'?'eat':'soldout'}`));
   assert.deepEqual(after.completed,before.completed);assert.deepEqual(after.skills.speaking,before.skills.speaking);
   assert.equal(after.relations.seller,(before.relations.seller??0)+(key==='events'?1:0));
   if(key==='activities')assert.ok(await page.locator(selector).isDisabled());else assert.equal(await page.locator(selector).count(),0);
  }
  const questBranches=[];
  for(const q of chapterContent.quests){
   console.log(`Checking ${viewport.width} ${q.id}`);
   if(q.steps.length>1){
    await importSave(`${q.id}-partial-replay`);
    const before=await state(),first=chapterContent.scenarios.find(s=>s.id===q.steps[0]);
    const present=chapterContent.npcs.filter(n=>n.schedule[before.period]===before.scene);
    const index=present.findIndex(n=>n.id===first.npc);assert.ok(index>=0);
    await walkUntil(index===0?'a':'d','#chapter-near','E · Nói chuyện với '+present[index].name);await page.keyboard.press('e');
    const topic=page.locator('#chapter-topics button').filter({hasText:first.label}).first();
    assert.match(await topic.innerText(),/Luyện lại bước đã xong/);await topic.click();
    const guidance=await page.locator(`[data-guidance="guidance-default.${q.id}.replay"]`).innerText();
    assert.match(guidance,/Tiếp theo:/);assert.ok(guidance.includes(chapterContent.scenarios.find(s=>s.id===q.steps[1]).label));
    for(const level of [3,1,2]){await page.locator(`[data-level="${level}"]`).click();assert.equal(await page.locator('#chapter-hint').innerText(),first.hints[level-1]);}
    await submit(utterance(first.positive[0]));await page.locator('#chapter-feedback').getByText('không nhận lại thưởng',{exact:false}).waitFor();await page.keyboard.press('Escape');
    assert.deepEqual((await state()).steps,before.steps);assert.deepEqual((await state()).relations,before.relations);
   }
   if(q.day>1){const s=await openQuest(q,'locked');await submit(utterance(s.positive[0]));await page.locator('#chapter-feedback').getByText('nhiệm vụ chưa mở',{exact:false}).waitFor();await page.keyboard.press('Escape');assert.ok(!(await state()).completed.includes(q.id));}
   let s=await openQuest(q,'active');const before=await state();await submit(utterance(s.negative[0]));assert.match(await page.locator('#chapter-feedback').innerText(),/thử lại/i);await page.keyboard.press('Escape');assert.deepEqual((await state()).steps[q.id]??[],before.steps[q.id]??[]);
   // Reopen without replacing the save to exercise cancellation and recovery.
   await page.keyboard.press('e');await page.locator('#chapter-topics button').filter({hasText:s.label}).first().click();await submit(utterance(s.positive[0]));await page.locator('#chapter-feedback').getByText('Hoàn thành nhiệm vụ',{exact:false}).waitFor();await page.keyboard.press('Escape');
   let after=await state();assert.ok(after.completed.includes(q.id));assert.equal(after.relations[q.npc],(before.relations[q.npc]??0)+1);assert.deepEqual(after.skills.speaking,before.skills.speaking);if(q.id==='welcome'){assert.equal(after.endingMode,'keyboard');assert.match(await page.locator('#chapter-quests').innerText(),/hoàn tất chương mở đầu/i);}
   await page.reload();await page.locator('#chapter-canvas canvas').waitFor();after=await state();assert.ok(after.completed.includes(q.id));
   s=await openQuest(q,'complete');const complete=await state();await submit(utterance(s.positive[0]));await page.locator('#chapter-feedback').getByText('không nhận lại thưởng',{exact:false}).waitFor();await page.keyboard.press('Escape');assert.equal((await state()).relations[q.npc],complete.relations[q.npc]);
   for(const step of q.steps.slice(1)){s=await openQuest(q,'active',step);await submit(utterance(s.positive[0]));await page.locator('#chapter-feedback').getByText('Hoàn thành nhiệm vụ',{exact:false}).waitFor();await page.keyboard.press('Escape');assert.ok((await state()).completed.includes(q.id));}
   questBranches.push({id:q.id,locked:q.day>1?'tested':'unreachable: open on day 1',active:true,wrong:true,cancel:true,success:true,reload:true,replay:true,partialReplay:q.steps.length>1?'tested':'single-step quest'});
  }
  await importSave('new-game');
  for(let day=1;day<=7;day++){
   assert.match(await page.locator('#chapter-clock').innerText(),new RegExp(`Ngày ${day}\\b`));
   assert.ok((await page.locator('#chapter-quests').innerText()).trim(),'day retains an objective or continuation');
   if(day<7)for(let p=0;p<3;p++){await page.click('#chapter-next');await page.waitForTimeout(100);}
  }
  for(const q of chapterContent.quests){await importSave(`${q.id}-active`);assert.match(await page.locator('#chapter-quests').innerText(),new RegExp(q.title));assert.match(await page.locator('#chapter-clock').innerText(),new RegExp(`Ngày ${q.day}\\b`));}
  await importSave('day6-preparation');assert.match(await page.locator('#chapter-quests').innerText(),/chuẩn bị lời mời/i);await page.getByRole('button',{name:'Bài viết lời mời'}).click();assert.match(await page.locator('#chapter-title').innerText(),/Viết câu/);const invite=chapterContent.scenarios.find(s=>s.id==='invitation');await submit(utterance(invite.positive[0]));await page.locator('#chapter-feedback').getByText('Câu đã vào sổ tay.',{exact:false}).waitFor();await page.keyboard.press('Escape');assert.ok((await state()).skills.sentence['lesson-10']);await page.getByRole('button',{name:'Tự viết chữ 我'}).click();assert.match(await page.locator('#chapter-title').innerText(),/我/);await page.click('#chapter-trace');assert.match(await page.locator('#chapter-stroke-feedback').innerText(),/thứ tự nét/);await page.click('#chapter-quiz');await page.keyboard.press('Escape');assert.equal((await state()).skills.handwriting['我'],undefined);
  await importSave('canteen-before');await walkUntil('a','#chapter-near','E · Nói chuyện với '+chapterContent.npcs.find(n=>n.id==='seller').name);await page.keyboard.press('e');await page.locator('#chapter-dialog[open]').waitFor();assert.match(await page.locator('#chapter-title').innerText(),/Wáng|Vương/);
  await page.locator('#chapter-topics button').filter({hasText:'nước'}).first().click();
  const input=page.locator('#chapter-answer');await input.fill('我不要热水。');await page.click('#chapter-send');assert.ok(!(await state()).completed.includes('breakfast'));
  const promptLayout=await page.locator('.npc-line').evaluate(el=>({text:el.innerText,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  assert.match(promptLayout.text,/[\u3400-\u9fff]/);assert.match(promptLayout.text,/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i);assert.ok(promptLayout.scrollWidth<=promptLayout.clientWidth+1);
  await page.screenshot({path:`${evidence}/dialog-${viewport.width}x${viewport.height}.png`});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#chapter-canvas canvas').evaluate(e=>document.activeElement===e),true);
  const stopped=await state();await page.keyboard.press('e');await page.locator('#chapter-topics button').filter({hasText:'nước'}).first().click();await input.focus();await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');await input.fill('我想喝一杯热水。');await page.click('#chapter-send');await page.getByText('Câu đã vào sổ tay.',{exact:false}).waitFor();await page.keyboard.press('Escape');await page.reload();await page.locator('#chapter-canvas canvas').waitFor();let saved=await state();assert.equal(saved.x,stopped.x);assert.equal(saved.y,stopped.y);assert.ok(saved.completed.includes('breakfast'));assert.equal(saved.relations.seller,1);assert.deepEqual(saved.skills.speaking,{});
  await page.keyboard.press('e');await page.locator('#chapter-topics button').filter({hasText:'nước'}).first().click();await input.fill('我想喝一杯热水。');await page.click('#chapter-send');await page.locator('#chapter-feedback').getByText('không nhận lại thưởng',{exact:false}).waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(300);saved=await state();assert.equal(saved.relations.seller,1);
  await page.click('#chapter-map');await page.evaluate(()=>document.fonts.ready);const layout=await page.locator('#chapter-dialog').evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,font:document.fonts.check('16px Jiangnan')}));assert.ok(layout.font);assert.ok(layout.scrollWidth<=layout.clientWidth+1,'dialog horizontal overflow');
  await page.screenshot({path:`${evidence}/map-${viewport.width}x${viewport.height}.png`});await page.keyboard.press('Escape');
  // Cross every edge in both directions with the actual world input. Reaching
  // the screen edge changes scene automatically; no exit button or E is used.
  await importSave('new-game');
  assert.equal(await page.locator('#chapter-exits').count(),0);
  for(const [key,index] of [['ArrowRight',1],['a',0]]){
   for(let i=0;i<6;i++){
    const before=await state(),scene=chapterContent.scenes.find(s=>s.id===before.scene);
    await walkUntil(key,'#chapter-place',chapterContent.scenes.find(s=>s.id===scene.exits[index]).name);
    await page.waitForTimeout(200);const after=await state(),dest=chapterContent.scenes.find(s=>s.id===after.scene);
    assert.equal(after.scene,scene.exits[index]);assert.equal(after.x,dest.spawn.x);assert.equal(after.y,dest.spawn.y);
    assert.ok(dest.colliders.every(([l,t,r,b])=>!(after.x+8>l&&after.x-8<r&&after.y+16>t&&after.y-22<b)));
   }
  }
  await page.locator('#chapter-canvas canvas').focus();await page.keyboard.down('d');await page.waitForTimeout(250);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(200);const blurred=await state();await page.waitForTimeout(350);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(100);const still=await state();assert.equal(still.x,blurred.x);assert.equal(still.y,blurred.y);await page.keyboard.up('d');
  const labelGroups=[];
  for(let period=0;period<3;period++){
   if(period){await page.click('#chapter-next');await page.waitForTimeout(350);}
   for(let i=0;i<6;i++){
    const before=await state(),scene=chapterContent.scenes.find(s=>s.id===before.scene),target=chapterContent.scenes.find(s=>s.id===scene.exits[1]);
    await walkUntil('ArrowRight','#chapter-place',target.name);await page.waitForTimeout(350);
    const labels=await page.evaluate(()=>window.__chapterLabels());
    const current=await state();
    assert.equal(current.period,period);
    assert.deepEqual(labels.map(l=>l.id).sort(),chapterContent.npcs.filter(n=>n.schedule[period]===current.scene).map(n=>n.id).sort());
    for(const label of labels)assert.ok(label.text.startsWith(chapterContent.npcs.find(n=>n.id===label.id).name),'full NPC name retained');
    for(const label of labels){assert.match(label.text,/\n/);assert.ok(label.width<=190,`label too wide: ${JSON.stringify(label)}`);assert.ok(label.x>=0&&label.x+label.width<=960&&label.y>=0,'label inside canvas');}
    for(let a=0;a<labels.length;a++)for(let b=a+1;b<labels.length;b++){const x=labels[a],y=labels[b];assert.ok(x.x+x.width<=y.x||y.x+y.width<=x.x||x.y+x.height<=y.y||y.y+y.height<=x.y,`overlapping labels: ${JSON.stringify(labels)}`);}
    labelGroups.push({period,scene:i,labels});
    await page.screenshot({path:`${evidence}/scene-${period}-${i+1}-${viewport.width}x${viewport.height}.png`});
   }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);for(const path of scenePaths)assert.ok(loaded.has(path),'scene asset loaded: '+path);results.push({viewport,scenePaths,errors,failed,layout,labelGroups,questBranches});await context.close();console.log(`UI passed ${viewport.width}x${viewport.height}`);
 }
 writeFileSync(`${evidence}/browser.json`,JSON.stringify({runId,browser:browser.version(),results},null,2)+'\n');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}

