import {runSyntheticChapterAudio} from './synthetic-chapter-audio.mjs';
import {launchLoggedServer} from './browser-logging.mjs';
import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {randomUUID,createHash} from 'node:crypto';
import {serveBuilt} from './serve-built.mjs';
import {buildDiagnostic,finishSnapshot} from './diagnostic-build.mjs';
import {captureRequests,benchmarkSummary} from './acceptance-evidence.mjs';
import {privacyAssessment,faultAssessment,evidenceInventory} from './verify-m4-technical-prep.mjs';
import {measureChapterFrames} from './chapter-frames.mjs';
import {sampleMemory,summarizeMemory} from './process-memory.mjs';
import {runFaults} from './diagnostic-faults.mjs';
const args=process.argv.slice(2),option=(key,fallback)=>{const i=args.indexOf(key);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing '+key);return args[i+1];};
const benchmark=args.includes('--benchmark'),probe=args.includes('--probe-only'),faults=args.includes('--faults');
const offlineOnly=args.includes('--offline-only');
if(offlineOnly&&['--benchmark','--probe-only','--faults','--fps','--asr-only','--dialogue-only'].some(flag=>args.includes(flag)))throw Error('--offline-only runs chapter/save checks without model, fault inference or FPS flags');
const profile=args.includes('--m4-smoke')?{warmups:2,samples:12,asr:18000,llm:14000}:{warmups:3,samples:20,asr:15000,llm:12000};
const repeatReason=option('--repeat-reason',null);
const browserName=option('--browser','edge');if(!['edge','chrome','chromium'].includes(browserName))throw Error('Unknown browser');
const output=path.resolve(option('--output',`docs/evidence/task-01M7C38XW37C4G9BP5073EG01M/${Date.now()}-${randomUUID()}.json`));
const report={kind:'built-production-worker-diagnostic',createdAt:new Date().toISOString(),command:process.argv,profile,repeatReason,question:JSON.stringify({profile,browserName,benchmark,probe,faults,headed:args.includes('--headed'),fps:args.includes('--fps'),asrOnly:args.includes('--asr-only'),dialogueOnly:args.includes('--dialogue-only')}),benchmark:{},errors:[],actions:[],limitations:['Technical diagnostic only; not final MVP acceptance','No physical microphone or OS IME input','Each call creates a production worker; warm browser cache, not resident model','Fresh browser profile; OS cache may be warm','Licensed FLEURS is diagnostic input only; chapter oscillator is synthetic; neither is acceptance corpus']};
let server,browser,browserServer,context,capture,memory;
report.scope=offlineOnly?'offline-save-only':'integrated-routes-and-optional-model-measurements';
if(offlineOnly)report.limitations.push('Model inference, model faults, five-route privacy coverage, FPS and latency benchmark not run in --offline-only');
try{
 report.snapshot=await buildDiagnostic();report.revision=report.snapshot.revision;
 server=await serveBuilt(0);report.origin=server.url;
 report.machine={cpu:os.cpus()[0]?.model,ramBytes:os.totalmem(),os:os.platform()+' '+os.release(),viewport:{width:1280,height:720}};
 if(process.platform==='win32'){try{report.machine.gpuDrivers=JSON.parse(execFileSync('powershell',['-NoProfile','-Command','Get-CimInstance Win32_VideoController -ErrorAction Stop | Select-Object Name,DriverVersion | ConvertTo-Json -Compress'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}));}catch(error){report.machine.gpuDriversUnavailable=String(error);}}
 report.bundles=report.snapshot.productBundles;
 const launch={headless:!args.includes('--headed'),ignoreDefaultArgs:['--enable-unsafe-swiftshader'],args:['--ignore-certificate-errors'],...(browserName==='chromium'?{}:{channel:browserName==='edge'?'msedge':'chrome'})};
 browserServer=await launchLoggedServer(chromium,launch);report.browserLogs=browserServer.logs;report.browserLog=browserServer.logs.file;
 browser=await chromium.connect(browserServer.wsEndpoint());report.browser={requested:browserName,version:browser.version(),launch:{...browserServer.launchOptions,env:{CHROME_LOG_FILE:browserServer.logs.nativeFile}}};
 if(benchmark&&!repeatReason){
   let previous=[];try{previous=readdirSync(path.dirname(output)).filter(n=>n.endsWith('.json')&&!n.endsWith('.inventory.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
   for(const name of previous){let prior;try{prior=JSON.parse(readFileSync(path.join(path.dirname(output),name)));}catch{continue;}
     if(prior.revision===report.revision&&prior.question===report.question&&JSON.stringify(prior.machine)===JSON.stringify(report.machine)&&prior.browser?.version===report.browser.version&&Object.values(prior.benchmark??{}).some(s=>s.cold)){
       report.status='pending';report.skipBenchmark={reason:'Unchanged snapshot, machine, browser and question; no automatic heavy repeat',artifact:path.relative(process.cwd(),path.join(path.dirname(output),name)),sha256:createHash('sha256').update(readFileSync(path.join(path.dirname(output),name))).digest('hex')};throw Error(report.skipBenchmark.reason);
     }
   }
 }
 if(!offlineOnly){memory=await sampleMemory(browserServer.process().pid);report.memory=memory.report;}
 context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1280,height:720},serviceWorkers:'allow'});capture=captureRequests(context);report.requests=capture.requests;report.captureErrors=capture.errors;
 await context.route('**/*',r=>{const u=new URL(r.request().url());return u.origin===server.url&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));
 await page.goto(server.url);await page.waitForSelector('#chapter-canvas canvas');
 await page.click('#chapter-lessons');await page.getByRole('button',{name:'Tự giới thiệu',exact:true}).click();await page.locator('#chapter-answer').fill('我叫小雨。');await page.click('#chapter-send');await page.getByText('Câu đã vào sổ tay.',{exact:false}).waitFor();await page.click('#chapter-close');report.actions.push({path:'text',kind:'synthetic-keyboard',status:'completed'});
 await page.click('#chapter-hanzi');await page.waitForSelector('#chapter-writer svg path',{state:'attached'});await page.click('#chapter-stroke');await page.click('#chapter-close');report.actions.push({path:'strokes',kind:'automated-local-hanzi-replay',status:'completed'});
 if(!offlineOnly){
 await page.goto(server.url+'/diagnostic/index.html');await page.waitForFunction(()=>!!window.diagnostic);
 report.capabilities=await page.evaluate(async()=>{try{const a=await navigator.gpu?.requestAdapter();return {gpu:{adapter:!!a,features:a?[...a.features]:[],info:a?.info?{vendor:a.info.vendor,device:a.info.device,description:a.info.description}:null},microphoneRequested:false};}catch(e){return {gpu:{error:String(e)},microphoneRequested:false};}});
 const manifest=JSON.parse(readFileSync('src/ai/model-manifest.json')),corpus=JSON.parse(readFileSync('tests/fixtures/fleurs/manifest.json'));
 const fixture=corpus.samples[0];report.fixture={...fixture,dataset:corpus.dataset,revision:corpus.revision,license:corpus.license,transform:'decode, mono16k, trim or zero pad to exactly 80000 samples (5s)'};
 const fixtureBytes=readFileSync(path.join('tests/fixtures/fleurs',fixture.file));
 report.fixture.actualSha256=createHash('sha256').update(fixtureBytes).digest('hex');
 if(report.fixture.actualSha256!==fixture.sha256)throw Error('Fixture SHA-256 mismatch');
 const wav=fixtureBytes.toString('base64');
 const workerUrl='/'+report.snapshot.worker.path.slice(5);
 const infer=async(kind)=>page.evaluate(async({kind,wav,workerUrl})=>{
   const {ModelManager,toMono16k}=window.diagnostic;const events=[],networkBefore=performance.getEntriesByType('resource').length;
   let input='我要一杯热水。';if(kind==='asr'){const ac=new AudioContext();try{const b=Uint8Array.from(atob(wav),c=>c.charCodeAt(0));const d=await ac.decodeAudioData(b.buffer),pcm=toMono16k(Array.from({length:d.numberOfChannels},(_,i)=>d.getChannelData(i)),d.sampleRate);input=new Float32Array(80000);input.set(pcm.subarray(0,80000));}finally{await ac.close();}}
   const start=performance.now(),startedAt=performance.timeOrigin+start;const model=new ModelManager(()=>{const w=new Worker(workerUrl,{type:'module'});w.addEventListener('message',e=>events.push({atMs:performance.now()-start,...e.data,id:undefined,session:undefined}));return w;});
   try{const output=kind==='asr'?await model.transcribe(input):await model.evaluate(input,{id:'order_water',goal:'Gọi một cốc nước nóng',positive:['我要一杯热水。','给我一杯热水，谢谢。','来杯热水吧。'],negative:['我不要热水。']});const end=performance.now()-start,running=events.find(e=>e.phase==='running');return {output,backend:model.lastBackend,events,startedAt,endToEndMs:end,initMs:running?.atMs??null,inferenceMs:running?end-running.atMs:null,resourceTimings:performance.getEntriesByType('resource').slice(networkBefore).map(r=>r.toJSON())};}
   catch(error){return {error:String(error),events,backend:model.lastBackend,elapsedMs:performance.now()-start};}finally{model.cancel();}
 },{kind,wav,workerUrl});
 if(!probe)for(const kind of (args.includes('--asr-only')?['asr']:args.includes('--dialogue-only')?['llm']:['asr','llm'])){
   const firstMemorySample=memory.report.samples.length;
   const section=report.benchmark[kind]={dtype:manifest.inference[kind].dtype,model:manifest.inference[kind].model,modelRevision:manifest.models.find(m=>m.name===manifest.inference[kind].model).revision,...(kind==='asr'?{audioSeconds:5}:{maxNewTokens:64}),cold:null,warmups:[],samples:[],status:'incomplete'};
   // Cold = fresh model cache, separate from the explicitly reported profile.
   await page.evaluate(async()=>{for(const k of await caches.keys())if(k.startsWith('jiangnan-models-'))await caches.delete(k);});
   const before=capture.requests.length;section.cold=await infer(kind);await capture.flush();
   const transfers=capture.requests.slice(before).filter(r=>/\/(runtime|models)\//.test(r.url));section.cold.network=transfers.map(r=>({url:r.url,at:r.at,finishedAt:r.finishedAt,status:r.status}));
   section.cold.timingMethod='Cold network span = first request start to last finished request for runtime/model. Init-to-running includes transfer/hash/cache/compile; residual = init minus network span, not pure compilation. Timings overlap; OS cache may be warm.';
   const ends=transfers.map(r=>Date.parse(r.finishedAt)).filter(Number.isFinite),starts=transfers.map(r=>Date.parse(r.at));
   section.cold.downloadSpanMs=ends.length&&starts.length?Math.max(...ends)-Math.min(...starts):null;
   section.cold.initResidualMs=Number.isFinite(section.cold.initMs)&&Number.isFinite(section.cold.downloadSpanMs)?Math.max(0,section.cold.initMs-section.cold.downloadSpanMs):null;
   if(!section.cold.error&&benchmark){for(let i=0;i<profile.warmups+profile.samples;i++){const result=await infer(kind);(i<profile.warmups?section.warmups:section.samples).push(result);console.log(JSON.stringify({kind,iteration:i,error:result.error,inferenceMs:result.inferenceMs,backend:result.backend}));if(result.error)break;}}
   if(section.cold.error)report.errors.push(kind+': '+section.cold.error);
   if(benchmark)Object.assign(section,benchmarkSummary(section.cold,section.warmups,section.samples,profile[kind],profile));else if(!section.cold.error)section.status='smoke-completed';
   report.actions.push({path:kind,kind:'licensed-fixture-or-typed-real-production-model',status:section.cold.error?'failed':'completed',attempted:true});
   const lastMemorySample=memory.report.samples.length,modelMemory=memory.report.samples.slice(firstMemorySample,lastMemorySample);
   const summary=summarizeMemory({rootPid:memory.report.rootPid,samples:modelMemory,errors:[...memory.report.errors]});
   section.memory={firstSample:firstMemorySample,lastSampleExclusive:lastMemorySample,status:summary.status,validSamples:summary.validSamples,partialSamples:summary.partialSamples,baselineRssBytes:summary.baselineBytes,peakRssBytes:summary.peakBytes,method:'Complete browser process-tree sampled RSS only; partial readings make status incomplete. Shared pages can be double counted; excludes dedicated VRAM'};
 }
 if(!probe){report.chapterAudio=await runSyntheticChapterAudio(page,server.url);report.actions.push({path:'audio',kind:report.chapterAudio.kind,status:report.chapterAudio.completed?'completed':'failed',attempted:true});if(!report.chapterAudio.completed)report.errors.push('Production chapter synthetic audio route incomplete');}
 if(args.includes('--fps')&&!probe){
   await page.goto(server.url);await page.waitForSelector('#chapter-canvas canvas');await page.evaluate(()=>import('/diagnostic/entry.js'));
   report.frames=await measureChapterFrames(page,{infer:()=>infer(args.includes('--asr-only')?'asr':'llm')});
 }
 }
 if(faults||offlineOnly){report.faultMatrix=await runFaults(browser,server.url,'/'+report.snapshot.worker.path.slice(5),{context,page,server,offline:true,modelFaults:!offlineOnly});if(!offlineOnly)report.requiredFaults=faultAssessment(report.faultMatrix);}
}catch(e){if(!report.skipBenchmark)report.error=String(e);process.exitCode=1;}
finally{
 if(context)await context.close();await capture?.flush();if(memory)await memory.stop();await browser?.close();await browserServer?.close();await server?.close();
 if(report.snapshot)report.sourceCheck=finishSnapshot(report.snapshot);
 const coverage=Object.fromEntries(report.actions.map(x=>[x.path,{attempted:true,exercised:x.status==='completed'}]));
 report.privacy={...privacyAssessment(process.cwd(),report.origin,coverage,capture??{requests:[],errors:['capture unavailable']}),coverageKind:'Automated synthetic/fixture routes; attempted is not exercised',serviceWorkerCoverage:'Context capture allows service workers; independent canary regression is not product route evidence'};
 if(report.error||report.errors.length||!report.sourceCheck?.stable||(offlineOnly?report.privacy.security.length:report.privacy.errors.length)||(!offlineOnly&&report.memory?.status!=='measured')||(benchmark&&Object.values(report.benchmark).some(s=>s.status!=='measured'||!s.latencyWithinLimit))||report.faultMatrix?.some(x=>['failed','inconclusive'].includes(x.status)))process.exitCode=1;
 if(!report.bundles?.withinLimits||report.requiredFaults?.some(x=>x.status!=='passed')||report.frames&&(report.frames.status!=='measured'||report.frames.inferenceStatus!=='measured'||report.frames.medianFps<50))process.exitCode=1;
 report.exitCode=process.exitCode??0;mkdirSync(path.dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log('Evidence: '+output);console.log(JSON.stringify({exitCode:report.exitCode,error:report.error,errors:report.errors,privacy:report.privacy,memory:{status:report.memory?.status,peakBytes:report.memory?.peakBytes,samples:report.memory?.samples.length},sourceCheck:report.sourceCheck}));
 if(report.snapshot){const inventory=evidenceInventory(process.cwd(),[{path:path.relative(process.cwd(),output)}],{revision:report.snapshot.revision,head:report.snapshot.head,manifestSha256:report.snapshot.manifestSha256});writeFileSync(output+'.inventory.json',JSON.stringify({kind:'m4-evidence-links',inventory},null,2)+'\n',{flag:'wx'});}
}
