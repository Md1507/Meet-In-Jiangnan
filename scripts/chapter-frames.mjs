import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export function frameSummary(frameMs) {
  if(!frameMs.length||frameMs.some(x=>!Number.isFinite(x)||x<=0))return {durationMs:0,medianFps:null,averageFps:null};
  const sorted=frameMs.map(ms=>1000/ms).sort((a,b)=>a-b),mid=Math.floor(sorted.length/2),durationMs=frameMs.reduce((a,b)=>a+b,0);
  return {durationMs,medianFps:sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2,averageFps:frameMs.length*1000/durationMs};
}

// Same rAF timestamps as the existing benchmark; no clock mocking or product patch.
// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js
export async function measureChapterFrames(page,{infer}={}) {
  const source=readFileSync('src/chapter/app.ts','utf8');
  const ambientCount=Number(source.match(/const ambient=Array\.from\(\{length:(\d+)\}/)?.[1]);
  const sourceBound=Number.isInteger(ambientCount)&&source.includes('app.stage.addChild(g);return g;')&&source.includes('ambient.forEach((g,i)=>{g.y=');
  await page.waitForFunction(()=>!!document.querySelector('#chapter-place')?.textContent&&typeof window.__chapterLabels==='function');
  await page.locator('#chapter-canvas canvas').focus();
  const frames=page.evaluate(()=>new Promise(resolve=>{
    const frameMs=[],frameAt=[],workload=[];let start,last,lastSample=-Infinity,raf;
    const finish=reason=>{clearTimeout(timeout);cancelAnimationFrame(raf);resolve({frameMs,frameAt,workload,reason});};
    const sample=now=>{const canvas=document.querySelector('#chapter-canvas canvas'),rect=canvas?.getBoundingClientRect();workload.push({at:performance.timeOrigin+now,visible:document.visibilityState==='visible'&&!!rect&&rect.width>0&&rect.height>0,focused:document.activeElement===canvas,dialogOpen:!!document.querySelector('#chapter-dialog[open]'),storyNpcCount:typeof window.__chapterLabels==='function'?window.__chapterLabels().length:null});};
    const tick=now=>{start??=now;if(last!==undefined){frameMs.push(now-last);frameAt.push(performance.timeOrigin+now);}last=now;if(now-lastSample>=1000){sample(now);lastSample=now;}if(now-start>=60000){sample(now);finish(null);}else raf=requestAnimationFrame(tick);};
    const timeout=setTimeout(()=>finish('Frame window did not complete within 90 seconds'),90000);raf=requestAnimationFrame(tick);
  }));
  // One real inference, on the same foreground chapter page. No extra warm loops.
  const [sample,inference]=await Promise.all([frames,infer?infer().catch(error=>({error:String(error)})):null]);
  const summary=frameSummary(sample.frameMs),validLoad=sourceBound&&sample.workload.length>=60&&sample.workload.every(s=>s.visible&&s.focused&&!s.dialogOpen&&Number.isInteger(s.storyNpcCount)&&s.storyNpcCount+ambientCount>=10);
  const running=inference?.events?.find(e=>e.phase==='running');
  const inferenceStart=Number.isFinite(inference?.startedAt)&&Number.isFinite(running?.atMs)?inference.startedAt+running.atMs:null;
  const inferenceEnd=Number.isFinite(inference?.endToEndMs)&&Number.isFinite(inference?.startedAt)?inference.startedAt+inference.endToEndMs:null;
  const during=sample.frameMs.filter((ms,i)=>inferenceStart!==null&&inferenceEnd!==null&&sample.frameAt[i]-ms>=inferenceStart&&sample.frameAt[i]<=inferenceEnd);
  return {...sample,...summary,status:!sample.reason&&summary.durationMs>=60000&&validLoad?'measured':'pending',inferenceStatus:!inference?.error&&during.length?'measured':'pending',duringInference:frameSummary(during),inference,viewport:page.viewportSize(),workloadBinding:{sourceSha256:createHash('sha256').update(source).digest('hex'),ambientCount:sourceBound?ambientCount:null,minimumStoryNpcs:sample.workload.length?Math.min(...sample.workload.map(x=>x.storyNpcCount??0)):null,requiredNpcCount:10,method:'Source-bound ambient count plus existing read-only live story-label observer each second; no direct GPU draw count'},limitations:['rAF cadence, not GPU presentation timestamps','No reference-machine acceptance; machine configuration and inference overlap must be reviewed']};
}
