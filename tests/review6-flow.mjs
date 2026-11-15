import {launchLoggedBrowser} from '../scripts/browser-logging.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await launchLoggedBrowser(chromium,{headless:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.addInitScript(()=>{
    const s=window.__fixTest={recordings:[],decodes:[],pending:[],evaluations:[],closed:0,cancels:0,cacheWaiters:[],delayCache:false};
    window.__gameTestAdapter={
      recorder:{cancel(){},stop(){},async start(callback){s.recordings.push(callback);}},
      model:{cancel(){s.cancels++;},transcribe(){return new Promise(resolve=>s.pending.push(resolve));},evaluate(){return new Promise(resolve=>s.evaluations.push(resolve));}}
    };
    window.AudioContext=class {
      async decodeAudioData(){return new Promise(resolve=>s.decodes.push(()=>resolve({numberOfChannels:1,sampleRate:16000,getChannelData:()=>new Float32Array(8000).fill(.1)})));}
      async close(){s.closed++;}
    };
    const keys=caches.keys.bind(caches);
    caches.keys=()=>s.delayCache?new Promise(resolve=>s.cacheWaiters.push(resolve)):keys();
  });
  const page=await context.newPage();await page.goto('http://127.0.0.1:4173');await page.waitForSelector('canvas');
  const position=()=>page.evaluate(()=>window.__gameTestAdapter.position());
  for(const [key,button] of [['d','#cancel-model'],['w','#clear-model-cache'],['ArrowRight','#cancel-model']]){
    await page.locator('canvas').focus();
    const before=await position();await page.keyboard.down(key);await page.waitForTimeout(150);
    assert.notDeepEqual(await position(),before,`${key} must move before UI focus`);
    await page.click(button);const stopped=await position();await page.waitForTimeout(150);
    assert.deepEqual(await position(),stopped,`${key} moved while ${button} had focus`);
    await page.locator('canvas').focus();await page.keyboard.down(key);await page.waitForTimeout(150);
    assert.deepEqual(await position(),stopped,`${key} resumed on repeat after returning to canvas`);
    await page.keyboard.up(key);await page.keyboard.down(key);await page.waitForTimeout(150);
    assert.notDeepEqual(await position(),stopped,`${key} did not move on a fresh press`);
    await page.keyboard.up(key);
  }
  await page.reload();await page.waitForSelector('canvas');
  await page.keyboard.down('a');await page.waitForTimeout(1750);await page.keyboard.up('a');
  await page.keyboard.down('w');await page.waitForTimeout(620);await page.keyboard.up('w');
  await page.keyboard.press('e');await page.waitForSelector('#answer');
  const hit=()=>page.evaluate(()=>{const b=document.querySelector('#cancel-model'),r=b.getBoundingClientRect(),target=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {visible:r.y>=0&&r.bottom<=innerHeight,hit:target===b||b.contains(target)};});
  assert.deepEqual(await hit(),{visible:true,hit:true});
  await page.click('#record');await page.evaluate(()=>window.__fixTest.recordings[0](new Blob(['audio'])));
  await page.waitForFunction(()=>window.__fixTest.decodes.length===1);
  await page.click('#cancel-model');await page.evaluate(()=>window.__fixTest.decodes[0]());
  await page.waitForFunction(()=>window.__fixTest.closed===1);
  assert.equal(await page.evaluate(()=>window.__fixTest.pending.length),0);
  assert.equal(await page.locator('#answer').inputValue(),'');
  assert.match(await page.locator('#model-status').innerText(),/Đã hủy/);

  await page.locator('#answer').fill('我要一杯热水。');await page.click('#record');
  await page.evaluate(()=>window.__fixTest.recordings[1](new Blob(['audio'])));
  await page.waitForFunction(()=>window.__fixTest.decodes.length===2);
  await page.evaluate(()=>window.__fixTest.delayCache=true);await page.click('#clear-model-cache');
  await page.waitForFunction(()=>window.__fixTest.cacheWaiters.length===1);
  await page.click('#record');await page.click('#ai-check');
  assert.equal(await page.evaluate(()=>window.__fixTest.recordings.length),2);
  assert.equal(await page.evaluate(()=>window.__fixTest.evaluations.length),0);
  await page.evaluate(()=>window.__fixTest.decodes[1]());await page.waitForFunction(()=>window.__fixTest.closed===2);
  assert.equal(await page.evaluate(()=>window.__fixTest.pending.length),0);
  await page.evaluate(()=>{window.__fixTest.delayCache=false;window.__fixTest.cacheWaiters[0]([]);});
  await page.waitForFunction(()=>document.querySelector('#model-status').textContent.includes('Đã xóa'));

  await page.click('#record');await page.evaluate(()=>window.__fixTest.recordings[2](new Blob(['fresh'])));
  await page.waitForFunction(()=>window.__fixTest.decodes.length===3);
  await page.evaluate(()=>window.__fixTest.decodes[2]());await page.waitForFunction(()=>window.__fixTest.pending.length===1);
  await page.click('#cancel-model');await page.evaluate(()=>window.__fixTest.pending[0]('给我一杯热水，谢谢。'));
  await page.waitForFunction(()=>window.__fixTest.closed===3);
  assert.equal(await page.locator('#answer').inputValue(),'我要一杯热水。');
  await page.click('#ai-check');await page.waitForFunction(()=>window.__fixTest.evaluations.length===1);
  await page.click('#cancel-model');await page.evaluate(()=>window.__fixTest.evaluations[0]('{"intent":"order_water","slots":{"amount":1,"drink":"water","temperature":"hot"}}'));
  await page.waitForTimeout(50);assert.doesNotMatch(await page.locator('#feedback').innerText(),/AI đề xuất đúng/);
  await page.click('#record');await page.evaluate(()=>window.__fixTest.recordings[3](new Blob(['retry'])));
  await page.waitForFunction(()=>window.__fixTest.decodes.length===4);await page.evaluate(()=>window.__fixTest.decodes[3]());
  await page.waitForFunction(()=>window.__fixTest.pending.length===2);await page.evaluate(()=>window.__fixTest.pending[1]('来一杯热水。'));
  await page.waitForFunction(()=>document.querySelector('#answer').value==='来一杯热水。');

  const phrases=[['我要一杯热水。','Wǒ yào yì bēi rèshuǐ.'],['给我一杯热水。','Gěi wǒ yì bēi rèshuǐ.'],['给我一杯热水，谢谢。','Gěi wǒ yì bēi rèshuǐ, xièxie.'],['来杯热水。','Lái bēi rèshuǐ.'],['来杯热水吧。','Lái bēi rèshuǐ ba.'],['来一杯热水。','Lái yì bēi rèshuǐ.'],['来一杯热水吧。','Lái yì bēi rèshuǐ ba.']];
  await page.evaluate(async phrases=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('jiangnan-m1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    await new Promise((resolve,reject)=>{const tx=db.transaction('save','readwrite');tx.objectStore('save').put({x:220,y:260,rewarded:true,hint:0,writing:0,journal:phrases.map(([text])=>({text,source:'typed',hint:0}))},'current');tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();
  },phrases);
  const journal=await context.newPage();await journal.goto('http://127.0.0.1:4173');await journal.waitForSelector('canvas');await journal.keyboard.press('e');await journal.waitForSelector('#journal li');
  assert.equal(await journal.locator('#journal li').count(),7);
  for(let i=0;i<phrases.length;i++)assert.ok((await journal.locator('#journal li').nth(i).innerText()).startsWith(`${phrases[i][0]} · ${phrases[i][1]} ·`));
  await journal.evaluate(()=>{const d=document.querySelector('#dialog');d.scrollTop=d.scrollHeight;});
  const stickyHit=await journal.evaluate(()=>{const b=document.querySelector('#cancel-model'),r=b.getBoundingClientRect();return r.y>=0&&r.bottom<innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b;});
  assert.equal(stickyHit,true);await journal.click('#cancel-model');assert.match(await journal.locator('#model-status').innerText(),/Đã hủy/);
  assert.equal(await journal.locator('#dialog').isVisible(),true);
  console.log('Review6 browser regressions: cancel/clear during decode, stale ASR/LLM, retry, pointer/sticky controls and seven journal variants PASS. Adapter, not real inference.');
}finally{await browser.close();}
