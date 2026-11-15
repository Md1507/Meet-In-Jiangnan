import {launchLoggedBrowser} from './browser-logging.mjs';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {captureRequests} from './acceptance-evidence.mjs';

const args = process.argv.slice(2);
const value = (name, fallback) => { const i=args.indexOf(name); return i<0 ? fallback : args[i+1]; };
const browserName=value('--browser','chromium');
const timeout=Number(value('--timeout-ms','150000'));
if(!['chromium','edge','chrome'].includes(browserName) || !Number.isInteger(timeout) || timeout<1000 || timeout>300000) throw Error('Use --browser chromium|edge|chrome and --timeout-ms 1000..300000');
const probeOnly=args.includes('--probe-only'), headed=args.includes('--headed'), asr=args.includes('--asr');
if (probeOnly && asr) throw Error('--probe-only and --asr cannot be combined');
const hashFile = file => new Promise((resolve,reject)=>{const h=createHash('sha256'),s=createReadStream(file);s.on('data',chunk=>h.update(chunk));s.on('error',reject);s.on('end',()=>resolve(h.digest('hex')));});
const manifest=JSON.parse(await readFile('src/ai/model-manifest.json','utf8'));
const selected=asr?manifest.inference.asr:manifest.inference.llm;
const model=manifest.models.find(m=>m.name===selected.model);
const weights=model.files.filter(f=>f.path.endsWith(asr?'_quantized.onnx':'model_q4f16.onnx'));
const corpus=asr?JSON.parse(await readFile('tests/fixtures/fleurs/manifest.json','utf8')):null;
const sample=corpus?.samples[0]??null;
const report={createdAt:new Date().toISOString(),id:randomUUID(),kind:'browser-device-diagnostic',adapter:false,probeOnly,mode:asr?'asr':'dialogue',browserRequested:browserName,headed,timeoutMs:timeout,platform:os.platform(),osRelease:os.release(),cpu:os.cpus()[0]?.model,ramBytes:os.totalmem(),runtime:manifest.runtime,model:{revision:model.revision,dtype:selected.dtype,weights,input:sample??'我要一杯热水。'},audioSource:asr?'FLEURS fixture, not physical microphone':'synthetic oscillator and silence; not speech or physical microphone',network:[],phases:[],limitations:['Fresh temporary browser profile; OS and disk caches may be warm','Diagnostic is not a reference-machine benchmark or human acceptance','No physical microphone or OS IME validation','No GPU enabling flags, permissions changes, external uploads or mock model']};
let server,browser,context,capture; let timer;
try {
 for (const weight of weights) { weight.actualSha256=await hashFile(path.join('public/models',model.name,weight.path)); if(weight.actualSha256!==weight.sha256)throw Error('Model weight SHA-256 mismatch'); }
 if(asr) { report.fixture={dataset:corpus.dataset,revision:corpus.revision,license:corpus.license,actualSha256:await hashFile(path.join('tests/fixtures/fleurs',sample.file))}; if(report.fixture.actualSha256!==sample.sha256)throw Error('Fixture SHA-256 mismatch'); }
 report.sourceHashes={manifest:await hashFile('src/ai/model-manifest.json'),worker:await hashFile('src/ai/model.worker.ts'),manager:await hashFile('src/ai/ModelManager.ts')};
 server=await createServer({configFile:false,server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false,watch:null}}); await server.listen();
 const origin=server.resolvedUrls.local[0].replace(/\/$/,''); report.origin=origin;
 browser=await launchLoggedBrowser(chromium,{headless:!headed,ignoreDefaultArgs:['--enable-unsafe-swiftshader'],...(browserName==='chromium'?{}:{channel:browserName==='edge'?'msedge':'chrome'})});
 report.browserLogs=browser.diagnosticLogs;report.browserLog=browser.diagnosticLogs.file;report.browserVersion=browser.version(); context=await browser.newContext();
 try {const cdp=await browser.newBrowserCDPSession();report.systemInfo=await cdp.send('SystemInfo.getInfo');await cdp.detach();}catch(e){report.systemInfoError=String(e);}
 await context.route('**/*',route=>{const req=route.request(),url=req.url();if(!url.startsWith(origin+'/')&&!url.startsWith('blob:')&&!url.startsWith('data:'))return route.abort();if(!['GET','HEAD'].includes(req.method()))return route.abort();return route.continue();});
 const page=await context.newPage(); const start=Date.now();
 capture=captureRequests(context);report.network=capture.requests;report.captureErrors=capture.errors;
 report.limitations.push('Legacy Vite HTTP diagnostic only; use bench-browser-ai for source-bound HTTPS privacy capture');
 page.on('pageerror',error=>report.phases.push({atMs:Date.now()-start,event:'pageerror',error:String(error)}));
 await page.goto(origin,{timeout:30000,waitUntil:'domcontentloaded'});
 report.capabilities=await Promise.race([page.evaluate(async()=>{
   let gpu={available:!!navigator.gpu};
   try {const a=await navigator.gpu?.requestAdapter();gpu={...gpu,adapter:!!a,info:a?.info?{vendor:a.info.vendor,architecture:a.info.architecture,device:a.info.device,description:a.info.description}:null,features:a?[...a.features]:[],shaderF16:!!a?.features.has('shader-f16')};}catch(e){gpu.error=String(e);}
   const codecs=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].map(mime=>({mime,supported:typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported(mime)}));
   const result={userAgent:navigator.userAgent,gpu,codecs,mediaRecorder:typeof MediaRecorder!=='undefined',audioContext:typeof AudioContext!=='undefined',microphoneRequested:false};
   try {
     const ctx=new AudioContext(), dest=ctx.createMediaStreamDestination(),osc=ctx.createOscillator();osc.connect(dest);osc.start();
     const recorder=new MediaRecorder(dest.stream),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
     const stopped=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=e=>reject(String(e));});
     recorder.start();await new Promise(r=>setTimeout(r,500));recorder.stop();await stopped;osc.stop();dest.stream.getTracks().forEach(t=>t.stop());
     const blob=new Blob(chunks,{type:recorder.mimeType}),decoded=await ctx.decodeAudioData(await blob.arrayBuffer());
     const {toMono16k,hasAudibleSignal}=await import('/src/audio/pcm.ts');const pcm=toMono16k(Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i)),decoded.sampleRate);
     const playback=new Audio();const url=URL.createObjectURL(blob);playback.src=url;let playbackResult;try{await playback.play();playbackResult='play resolved';}catch(e){playbackResult=String(e);}playback.pause();URL.revokeObjectURL(url);
     result.syntheticAudio={mime:recorder.mimeType,bytes:blob.size,decodedRate:decoded.sampleRate,channels:decoded.numberOfChannels,resampledSamples:pcm.length,audible:hasAudibleSignal(pcm),silenceBlocked:!hasAudibleSignal(new Float32Array(16000)),tracksStopped:dest.stream.getTracks().every(t=>t.readyState==='ended'),playback:playbackResult};await ctx.close();
   }catch(e){result.syntheticAudioError=String(e);}return result;
 }),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Capability probe timed out')),timeout);})]);clearTimeout(timer);
 if(!probeOnly){
   await page.exposeFunction('recordPhase',event=>report.phases.push({atMs:Date.now()-start,...event}));
   const work=page.evaluate(async ({asr,sample})=>{let input='我要一杯热水。';
     const {createWorkerTracker}=await import('/scripts/device-evidence-protocol.mjs');
     if(asr){const ctx=new AudioContext();try{const response=await fetch('/tests/fixtures/fleurs/'+encodeURIComponent(sample.file));if(!response.ok)throw Error(`fixture HTTP ${response.status}`);const decoded=await ctx.decodeAudioData(await response.arrayBuffer());const {toMono16k}=await import('/src/audio/pcm.ts');input=toMono16k(Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i)),decoded.sampleRate);}finally{await ctx.close();}}
     return new Promise(resolve=>{
     const worker=new Worker(new URL('/src/ai/model.worker.ts?worker_file&type=module',location.href),{type:'module'}),id=crypto.randomUUID(),session=1;
     let finished=false;const track=createWorkerTracker(id,session);
     worker.onmessage=async e=>{if(finished)return;const phase=track(e.data);if(!phase)return;
       const terminal=phase.event==='result'||phase.event==='error';if(terminal)finished=true;
       if(phase.event!=='progress')await window.recordPhase(phase);
       if(terminal){worker.terminate();resolve(phase.event==='result'?'completed':'error');}};
     worker.onerror=async e=>{if(finished)return;finished=true;await window.recordPhase({event:'worker-error',error:e.message});worker.terminate();resolve('error');};
     window.recordPhase({event:'worker-start'}).then(()=>worker.postMessage({id,session,kind:asr?'transcribe':'evaluate',input}));
   });},{asr,sample});
   const expired=new Promise(resolve=>{timer=setTimeout(()=>resolve('timeout'),timeout);});
   const result=await Promise.race([work,expired]);report.outcome=result;if(result==='timeout')report.phases.push({atMs:Date.now()-start,event:'diagnostic-timeout'});if(result!=='completed')process.exitCode=1;
 }
}catch(e){report.error=String(e);process.exitCode=1;}
finally{
 clearTimeout(timer);await context?.close().catch(()=>{});await capture?.flush();await browser?.close().catch(()=>{});await server?.close().catch(()=>{});
 await mkdir('docs/evidence',{recursive:true});const file=`docs/evidence/${report.createdAt.replace(/[:.]/g,'-')}-${report.id}.json`;
 await writeFile(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(`Evidence: ${file}`);console.log(JSON.stringify({error:report.error,outcome:report.outcome,browser:report.browserVersion,capabilities:report.capabilities,phases:report.phases},null,2));
}
