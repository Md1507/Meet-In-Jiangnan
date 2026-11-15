import {launchLoggedBrowser} from '../scripts/browser-logging.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import HanziWriter from 'hanzi-writer';
const content=JSON.parse(readFileSync('src/content/mvp.json','utf8'));
const browser=await launchLoggedBrowser(chromium,{headless:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:4173');await page.waitForSelector('#chapter-canvas canvas');
  const snapshot=()=>page.evaluate(()=>window.__chapterTest.snapshot());
  const close=async()=>{await page.click('#chapter-close');await page.waitForFunction(()=>!document.querySelector('#chapter-dialog').open);};
  const walkToScene=async(key,target)=>{await page.locator('#chapter-canvas canvas').focus();await page.keyboard.down(key);try{await page.waitForFunction(name=>document.querySelector('#chapter-place').textContent.includes(name),target.name,{timeout:8000});}finally{await page.keyboard.up(key);}};
  // A slow destination texture must not allow movement or E against the old scene.
  await page.waitForFunction(()=>document.querySelector('#chapter-place').textContent.length>0);
  assert.equal(await page.locator('#chapter-exits').count(),0);
  const starting=await snapshot(),origin=content.scenes.find(s=>s.id===starting.scene),destination=content.scenes.find(s=>s.id===origin.exits[1]);
  const assetPath='/'+destination.art.path.replace(/^public\//,'');
  let releaseAsset;const assetReady=new Promise(resolve=>releaseAsset=resolve);
  await page.route('**'+assetPath,async route=>{await assetReady;await route.continue();});
  const requested=page.waitForRequest(request=>new URL(request.url()).pathname===assetPath);
  await page.keyboard.down('ArrowRight');
  try{
    await requested;const loading=await snapshot();assert.equal(loading.scene,destination.id);
    await page.keyboard.down('w');await page.keyboard.press('e');await page.waitForTimeout(300);
    const held=await snapshot();assert.equal(held.x,loading.x);assert.equal(held.y,loading.y);assert.equal(held.scene,loading.scene);assert.equal(await page.locator('#chapter-dialog[open]').count(),0);
  }finally{releaseAsset();await page.keyboard.up('w');await page.keyboard.up('ArrowRight');}
  await page.waitForFunction(name=>document.querySelector('#chapter-place').textContent.includes(name),destination.name);
  await page.waitForTimeout(200);assert.equal((await snapshot()).x,destination.spawn.x);
  await walkToScene('ArrowLeft',origin);
  await page.keyboard.down('a');await page.waitForTimeout(1200);await page.keyboard.up('a');
  await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');
  assert.ok((await snapshot()).y>=300,'buildings block walking');
  await page.keyboard.down('d');await page.waitForTimeout(600);await page.keyboard.up('d');await page.keyboard.press('e');
  await page.waitForSelector('#chapter-dialog[open]');assert.match(await page.locator('#chapter-title').innerText(),/Zhōu/);await close();
  async function submitScenario(id,text,lesson){
    if(lesson){await page.click('#chapter-lessons');await page.getByRole('button',{name:lesson.title,exact:false}).click();}
    else{const s=content.scenarios.find(s=>s.id===id);await page.evaluate(id=>window.__chapterTest.npc(id),s.npc);await page.getByRole('button',{name:s.label,exact:false}).click();}
    await page.locator('#chapter-answer').fill(text);
    for(const level of [1,2,3]){await page.locator(`[data-level="${level}"]`).click();assert.ok((await page.locator('#chapter-hint').innerText()).length>0);}
    const before=await snapshot();await page.locator('#chapter-answer').dispatchEvent('compositionstart');await page.locator('#chapter-answer').dispatchEvent('keydown',{key:'Enter',code:'Enter',isComposing:true,bubbles:true,cancelable:true});assert.equal((await snapshot()).attempts.length,before.attempts.length);await page.locator('#chapter-answer').dispatchEvent('compositionend');await page.waitForTimeout(10);
    await page.click('#chapter-send');await page.getByText('Câu đã vào sổ tay.',{exact:false}).waitFor();await close();
  }
  for(const quest of content.quests){
    while((await snapshot()).day<quest.day)await page.click('#chapter-next');
    for(const id of quest.steps){const s=content.scenarios.find(s=>s.id===id),u=content.utterances.find(u=>u.id===s.positive[0]);await submitScenario(id,u.text);}
  }
  assert.equal((await snapshot()).completed.length,5);assert.equal((await snapshot()).endingMode,null);
  for(const lesson of content.sentenceLessons){const s=content.scenarios.find(s=>s.id===lesson.scenario),u=content.utterances.find(u=>u.id===s.positive[0]);await submitScenario(s.id,u.text,lesson);}
  // Real Hanzi Writer: replay authored medians through pointer events, no quiz adapter.
  await page.click('#chapter-hanzi');await page.click('#chapter-quiz');
  const wrong=await page.locator('#chapter-writer').boundingBox();
  await page.mouse.move(wrong.x+8,wrong.y+8);await page.mouse.down();await page.mouse.move(wrong.x+55,wrong.y+8);await page.mouse.up();
  await page.getByText('Nét chưa đúng vị trí hoặc thứ tự.',{exact:false}).waitFor();
  await page.click('#chapter-quiz');
  const data=JSON.parse(readFileSync('public/hanzi/我.json','utf8'));
  const transform=HanziWriter.getScalingTransform(300,300,20);
  const box=await page.locator('#chapter-writer').boundingBox();
  for(const median of data.medians){
    for(let i=0;i<median.length;i++){const [x,y]=median[i];await page.mouse.move(box.x+1+transform.x+x*transform.scale,box.y+1+300-transform.y-y*transform.scale);if(i===0)await page.mouse.down();}
    await page.mouse.up();await page.waitForTimeout(60);
  }
  await page.getByText('Đã tự viết xong 我',{exact:false}).waitFor();await close();
  const finished=await snapshot();assert.equal(finished.completed.length,6);assert.equal(finished.endingMode,'keyboard');assert.equal(Object.keys(finished.skills.sentence).length,10);assert.deepEqual(finished.skills.speaking,{});assert.equal(finished.skills.handwriting['我'],1);
  // Every local character dataset must work with the actual quiz, not just parse.
  for(const character of content.characters.filter(c=>c.id!=='我')){
    await page.click('#chapter-hanzi');await page.selectOption('#chapter-character',character.id);
    await page.waitForSelector('#chapter-writer svg path',{state:'attached'});
    await page.click('#chapter-trace');await page.click('#chapter-quiz');
    await page.click('#chapter-stroke');await page.click('#chapter-quiz');
    const medians=JSON.parse(readFileSync('public/hanzi/'+character.id+'.json','utf8')).medians;
    const bounds=await page.locator('#chapter-writer').boundingBox();
    for(const median of medians){for(let i=0;i<median.length;i++){const [x,y]=median[i];await page.mouse.move(bounds.x+1+transform.x+x*transform.scale,bounds.y+1+300-transform.y-y*transform.scale);if(i===0)await page.mouse.down();}await page.mouse.up();await page.waitForTimeout(60);}
    await page.getByText('Đã tự viết xong '+character.id,{exact:false}).waitFor();await close();
  }
  assert.equal(Object.keys((await snapshot()).skills.handwriting).length,20);
  const seen=new Set([finished.scene]);for(let i=0;i<6;i++){const state=await snapshot(),scene=content.scenes.find(s=>s.id===state.scene),target=content.scenes.find(s=>s.id===scene.exits[1]);await walkToScene('ArrowRight',target);assert.equal((await snapshot()).scene,scene.exits[1]);seen.add((await snapshot()).scene);}assert.equal(seen.size,6);
  await page.evaluate(()=>window.__chapterTest.flush());const beforeReload=await snapshot();await page.reload();await page.waitForSelector('#chapter-canvas canvas');const afterReload=await snapshot();for(const key of ['scene','x','y','day','period','completed','relations','skills','events','activities'])assert.deepEqual(afterReload[key],beforeReload[key]);
  await page.click('#chapter-journal');assert.ok(await page.locator('.journal-card').count()>=10);await close();
  await page.click('#chapter-data');await page.locator('#chapter-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":99}')});await page.getByText('Bản lưu không đúng schema',{exact:false}).waitFor();assert.deepEqual((await snapshot()).skills,afterReload.skills);await close();
  // Actual IndexedDB backup recovery and concurrent stale snapshot protection.
  const persistence=await page.evaluate(async()=>{
    const {ChapterStore}=await import('/src/chapter/store.ts');const a=new ChapterStore(),b=new ChapterStore();const x=await a.open(),y=await b.open();x.settings.volume=.4;await a.save(x);let conflict=false;try{await b.save(y);}catch{conflict=true;}
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('jiangnan-chapter');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put({broken:true},'current');tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();const recovered=await new ChapterStore().open();return {conflict,valid:recovered.schemaVersion===2,completed:recovered.completed.length};
  });assert.deepEqual(persistence,{conflict:true,valid:true,completed:6});
  assert.deepEqual(errors,[]);console.log('Chapter UI PASS: real movement/collision/E, automatic screen-edge travel with slow-asset input lock, seven-day keyboard story, 10 lessons/IME guard, all20 real Hanzi Writer pointer quizzes/trace/hint/retry, six regions, journal, save/reload/import/rollback/conflict. Not physical IME/mic or human language review.');
}finally{await browser.close();}
