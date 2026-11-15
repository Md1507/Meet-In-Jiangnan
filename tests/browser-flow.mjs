import {launchLoggedBrowser} from '../scripts/browser-logging.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await launchLoggedBrowser(chromium,{headless:true});
const context=await browser.newContext({viewport:{width:1280,height:720}});
try {
 const page=await context.newPage();
 await page.addInitScript(() => {
   const control = { recordings: [], pending: [], denied: false, cancels: 0 };
   window.__testControl = control;
   window.__gameTestAdapter = {
     recorder: { cancel() {}, stop() {}, async start(callback) { if(control.denied) throw Error('denied'); control.recordings.push(callback); } },
     model: { cancel() { control.cancels++; }, transcribe() { return new Promise((resolve,reject) => control.pending.push({resolve,reject})); }, evaluate() { return Promise.reject(Error('unavailable')); } }
   };
   window.AudioContext = class { async decodeAudioData() { return {numberOfChannels:1,sampleRate:16000,getChannelData:()=>new Float32Array(8000).fill(0.1)}; } async close() {} };
 });
 await page.goto('http://127.0.0.1:4173'); await page.waitForSelector('canvas');
 const position=()=>page.evaluate(()=>window.__gameTestAdapter.position());
 const readSave=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('jiangnan-m1',1);request.onsuccess=()=>{const r=request.result.transaction('save').objectStore('save').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);};request.onerror=()=>reject(request.error);}));
 await page.keyboard.down('w'); await page.waitForTimeout(500); await page.keyboard.up('w');
 assert.ok((await position()).y>=335,'bàn chặn nhân vật');
 await page.keyboard.down('a'); await page.waitForTimeout(1750); await page.keyboard.up('a');
 await page.keyboard.down('w'); await page.waitForTimeout(620); await page.keyboard.up('w');
 await page.keyboard.press('e'); await page.waitForSelector('#answer');
 const atSeller=await position();
 await page.locator('#answer').focus(); await page.keyboard.down('a'); await page.waitForTimeout(200); await page.keyboard.up('a');
 assert.deepEqual(await position(),atSeller,'UI focus khóa di chuyển');
 await page.click('#record'); await page.evaluate(() => window.__testControl.recordings[0](new Blob(['audio'])));
 await page.waitForFunction(() => window.__testControl.pending.length===1);
 await page.click('#close'); await page.keyboard.press('e'); await page.waitForSelector('#answer');
 await page.evaluate(() => window.__testControl.pending[0].resolve('cũ sau đóng'));
 await page.waitForTimeout(100); assert.equal(await page.locator('#answer').inputValue(),'');
 await page.click('#record'); await page.evaluate(() => window.__testControl.recordings[1](new Blob(['audio'])));
 await page.waitForFunction(() => window.__testControl.pending.length===2);
 await page.locator('#answer').fill('bản nháp mới');
 await page.evaluate(() => window.__testControl.pending[1].resolve('cũ sau sửa'));
 await page.waitForTimeout(100); assert.equal(await page.locator('#answer').inputValue(),'bản nháp mới');
 await page.click('#record'); await page.evaluate(() => window.__testControl.recordings[2](new Blob(['audio'])));
 await page.waitForFunction(() => window.__testControl.pending.length===3);
 await page.evaluate(() => window.__testControl.pending[2].resolve('  我要一杯热水。  '));
 await page.waitForFunction(() => document.querySelector('#answer').value==='  我要一杯热水。  ');
 await page.click('#record');
 // Synthetic composition does not activate the OS IME: a physical Playwright
 // Enter would insert a newline in the textarea instead of selecting a candidate.
 await page.locator('#answer').dispatchEvent('compositionstart');
 await page.locator('#answer').dispatchEvent('keydown',{key:'Enter',code:'Enter',isComposing:true,bubbles:true,cancelable:true});
 assert.equal(await page.locator('#answer').inputValue(),'  我要一杯热水。  ');
 assert.equal(await page.locator('#journal li').count(),0); await page.locator('#answer').dispatchEvent('compositionend');
 // Simulate an older checkpoint while the player is still at the NPC.
 await page.evaluate(async()=>{const {SaveStore}=await import('/src/storage/save.ts');const store=new SaveStore();const s=await store.open();s.x=480;s.y=360;await store.put(s);});
 await page.click('#send'); await page.getByText('Đúng rồi!', {exact:false}).waitFor();
 const readAttempts=()=>page.evaluate(async()=>{
   const {SaveStore}=await import('/src/storage/save.ts');const store=new SaveStore();await store.open();
   return new Promise((resolve,reject)=>{const req=store.db.transaction('save').objectStore('save').get('attempts');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
 });
 let attempts=await readAttempts();assert.equal(attempts[0].source,'audio-asr');assert.equal(attempts[0].rawTranscript,'  我要一杯热水。  ');
 const checkpoint=await readSave();assert.equal(checkpoint.x,atSeller.x);assert.equal(checkpoint.y,atSeller.y);assert.equal(checkpoint.rewarded,true);
 await page.reload(); await page.waitForSelector('canvas'); assert.deepEqual(await position(),atSeller); await page.keyboard.press('e'); await page.waitForSelector('#answer');
 await page.click('#record'); await page.evaluate(() => window.__testControl.recordings[0](new Blob(['audio'])));
 await page.waitForFunction(() => window.__testControl.pending.length===1);
 await page.evaluate(() => window.__testControl.pending[0].resolve('  我要一杯热水。  '));
 await page.waitForFunction(() => document.querySelector('#answer').value==='  我要一杯热水。  ');
 await page.locator('#answer').fill('给我一杯热水，谢谢。');await page.click('#send');
 await page.getByText('Bạn đã nhận phần thưởng', {exact:false}).waitFor();
 attempts=await readAttempts();assert.equal(attempts.at(-1).source,'edited-transcript');assert.equal(attempts.at(-1).rawTranscript,'  我要一杯热水。  ');
 await page.click('#cancel-model'); assert.match(await page.locator('#model-status').innerText(),/Đã hủy/); assert.ok(await page.evaluate(()=>window.__testControl.cancels>0));
 await page.click('#ai-check'); await page.getByText('Model không khả dụng', {exact:false}).waitFor();
 await page.click('#close'); await page.keyboard.press('e'); await page.waitForSelector('#answer');
 await page.evaluate(() => window.__testControl.recordings[0](new Blob(['late']))); assert.equal(await page.locator('#answer').inputValue(),'');
 await page.evaluate(() => {window.__testControl.denied=true;}); await page.click('#record'); await page.getByText('Không dùng được mic', {exact:false}).waitFor();
 await page.locator('#answer').fill('我不要热水。'); await page.click('#send');
 await page.getByText('Chưa đúng: hãy thử gọi một cốc nước nóng.', {exact:true}).waitFor();
 await page.locator('#answer').fill('我要一杯热水。'); await page.click('#send'); await page.getByText('Bạn đã nhận phần thưởng', {exact:false}).waitFor();
 attempts=await readAttempts();assert.equal(attempts.at(-1).source,'typed');assert.equal(attempts.at(-1).rawTranscript,undefined);
 await page.click('#send'); await page.getByText('Bạn đã nhận phần thưởng', {exact:false}).waitFor();
 await page.click('#close'); await page.waitForTimeout(300); await page.reload(); await page.waitForSelector('canvas'); await page.keyboard.press('e'); await page.waitForSelector('#answer'); assert.equal(await page.locator('#journal li').count(),1);
 // Concurrent reward transactions retain one journal entry and merge monotonic progress.
 const merged=await page.evaluate(async()=>{const {SaveStore}=await import('/src/storage/save.ts');const a=new SaveStore(),b=new SaveStore();const [x,y]=await Promise.all([a.open(),b.open()]);x.hint=3;y.writing=2;const entry={text:'来杯热水吧。',source:'typed',hint:0};await Promise.all([a.reward(entry,x),b.reward(entry,y)]);return a.open();});
 assert.equal(merged.journal.length,1);assert.equal(merged.hint,3);assert.equal(merged.writing,2);
 // Move a saved position near the mentor, then exercise all three hint buttons.
 await page.evaluate(async()=>{const {SaveStore}=await import('/src/storage/save.ts');const store=new SaveStore();const s=await store.open();s.x=735;s.y=235;await store.put(s);});
 const mentor=await context.newPage();await mentor.goto('http://127.0.0.1:4173/?spike=1');await mentor.waitForSelector('canvas');await mentor.keyboard.press('e');await mentor.getByRole('heading',{name:'Mentor'}).waitFor();
 for (const [level,expected] of [[1,'Hãy gọi'],[2,'rèshuǐ'],[3,'Wǒ yào']]) {await mentor.click(`[data-hint="${level}"]`);assert.match(await mentor.locator('#hint').innerText(),new RegExp(expected));}
 console.log('Browser fixed adapter: audio wiring, stale recording, IME, model/mic failure, typed quest, reward once and reload. Adapter is not inference.');
} finally {await context.close();await browser.close();}
