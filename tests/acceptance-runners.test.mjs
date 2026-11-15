import {browserLogging,launchLoggedBrowser,launchLoggedServer,waitForNativeLog,readNativeLogs} from '../scripts/browser-logging.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {captureRequests,benchmarkSummary} from '../scripts/acceptance-evidence.mjs';
import {validateCapturedNetwork} from '../scripts/mvp-evidence.mjs';
import {comparePinyin} from '../scripts/reference-pinyin.mjs';

test('capture retains query, duplicate headers, binary body and failure', async () => {
  const context=new EventEmitter(), capture=captureRequests(context);
  const request={url:()=> 'https://example.test/a?secret=canary',method:()=> 'POST',postDataBuffer:()=>Buffer.from([0,255,42]),headersArray:async()=>[{name:'X-Test',value:'one'},{name:'X-Test',value:'two'}],failure:()=>({errorText:'blocked'})};
  context.emit('request',request);context.emit('requestfailed',request);await capture.flush();
  assert.deepEqual(capture.requests[0],{at:capture.requests[0].at,url:'https://example.test/a?secret=canary',method:'POST',status:'failed',failure:'blocked',bodyBytes:3,bodyBase64:'AP8q',headers:[{name:'X-Test',value:'one'},{name:'X-Test',value:'two'}]});
  assert.deepEqual(capture.errors,[]);
});
test('privacy adapter rejects query, payload, duplicate headers and incomplete captures',()=>{
  const origin='https://localhost', exercised=['audio','text','strokes','asr','llm'];
  const req={url:origin+'/',method:'GET',bodyBytes:0,bodyBase64:null,headers:[]};
  const check=r=>validateCapturedNetwork(process.cwd(),origin,exercised,{requests:[r],errors:[]});
  assert.deepEqual(check(req),[]);
  assert.notDeepEqual(check({...req,url:origin+'/?text=secret'}),[]);
  assert.notDeepEqual(check({...req,method:'POST',bodyBytes:1,bodyBase64:'eA=='}),[]);
  assert.notDeepEqual(check({...req,headers:[{name:'Host',value:'localhost'},{name:'host',value:'localhost'}]}),[]);
  assert.notDeepEqual(check({...req,bodyBytes:1,bodyBase64:'bad'}),[]);
  assert.notDeepEqual(validateCapturedNetwork(process.cwd(),origin,exercised,{requests:[req],errors:['missing worker']}),[]);
});
test('capture failures remain visible', async () => {
  const context=new EventEmitter(),capture=captureRequests(context);
  context.emit('request',{url:()=> 'https://example.test/',method:()=> 'GET',postDataBuffer:()=>null,headersArray:async()=>{throw Error('unavailable');}});
  await capture.flush();assert.match(capture.requests[0].captureError,/unavailable/);assert.equal(capture.errors.length,1);
});

test('benchmark excludes cold/warmups and refuses missing, failed or invalid phase samples',()=>{
 const cold={initMs:9000,inferenceMs:9999},warmups=Array.from({length:3},()=>({initMs:500,inferenceMs:8888})),samples=Array.from({length:20},(_,i)=>({initMs:300,inferenceMs:20-i}));
 assert.deepEqual(benchmarkSummary(cold,warmups,samples,18),{status:'measured',p95Ms:19,latencyWithinLimit:false});
 assert.equal(benchmarkSummary(cold,warmups,samples,19).latencyWithinLimit,true);
 for(const [c,w,s] of [[cold,warmups,samples.slice(1)],[cold,warmups.slice(1),samples],[{...cold,error:'init failed'},warmups,samples],[cold,warmups,[...samples.slice(1),{initMs:null,inferenceMs:10}]],[cold,warmups,[...samples.slice(1),{initMs:1,inferenceMs:-1}]]])assert.equal(benchmarkSummary(c,w,s,15000).status,'incomplete');
});
test('pinyin comparison reports segment mismatch and never claims tone verification',()=>{
  const words=[{entries:[{pinyin:'ni3'}]},{entries:[{pinyin:'hao3'}]}];
  assert.equal(comparePinyin('nǐ hǎo',words),'segmental-match-tones-unchecked');
  assert.equal(comparePinyin('nǐ hāo',words),'segmental-match-tones-unchecked');
  assert.equal(comparePinyin('nǐ hěn',words),'mismatch-or-ambiguous-segmentation');
  assert.equal(comparePinyin('nǚ',[{entries:[{pinyin:'nu:3'}]}]),'segmental-match-tones-unchecked');
  assert.equal(comparePinyin('x', [{status:'not-found'}]),'mismatch-or-ambiguous-segmentation');
});

import {chromium} from 'playwright';
import {serveBuilt} from '../scripts/serve-built.mjs';
import {get as httpsGet} from 'node:https';
import {readChapterState} from '../scripts/chapter-state-observer.mjs';
import {grammarCandidates} from '../scripts/reference-grammar.mjs';
import {finishSnapshot,pinnedAssets} from '../scripts/diagnostic-build.mjs';
import {summarizeMemory} from '../scripts/process-memory.mjs';
import {faultTarget,corruptPinnedAsset,verifyIntegrityRejection} from '../scripts/diagnostic-faults.mjs';
import {installSyntheticAudio} from '../scripts/synthetic-chapter-audio.mjs';
import {build} from 'vite';
import {spawnSync} from 'node:child_process';
import {mvpRevision} from '../scripts/mvp-evidence.mjs';
import {prepareKit,validateKit} from '../scripts/prepare-mvp-review.mjs';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');

test('streamed fault disconnects after received bytes and pristine download recovers',{timeout:15000},async()=>{
 const server=await serveBuilt(0),injection=server.interruptDownload('/index.html');
 const download=()=>new Promise((resolve,reject)=>{
  const request=httpsGet(server.url+'/index.html',{rejectUnauthorized:false},response=>{
   const chunks=[];let settled=false;
   const finish=error=>{if(settled)return;settled=true;resolve({body:Buffer.concat(chunks),expected:Number(response.headers['content-length']),complete:response.complete,error});};
   response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>finish(null));response.on('error',error=>finish(String(error)));response.on('aborted',()=>finish('aborted'));
  });request.setTimeout(5000,()=>request.destroy(Error('download timeout')));request.on('error',reject);
 });
 try {
  const broken=await download();assert.ok(broken.body.length>0);assert.ok(broken.body.length<broken.expected);assert.equal(broken.complete,false);
  assert.ok(injection.events.some(e=>e.flushedBytes===broken.body.length&&e.connectionDestroyed));
  injection.remove();const recovered=await download();assert.equal(recovered.complete,true);assert.equal(sha(recovered.body),sha(readFileSync('dist/index.html')));
 } finally {injection.remove();await server.close();}
});

test('snapshot rejects changed revision and pinned bytes independently',()=>{
 const revision=mvpRevision(process.cwd()),asset={path:'src/ai/model-manifest.json',actualSha256:sha(readFileSync('src/ai/model-manifest.json'))};
 assert.equal(finishSnapshot({revision,assets:[asset]}).stable,true);
 assert.equal(finishSnapshot({revision:'0'.repeat(64),assets:[asset]}).stable,false);
 const changed=finishSnapshot({revision,assets:[{...asset,actualSha256:'0'.repeat(64)}]});assert.equal(changed.stable,false);assert.deepEqual(changed.changedAssets,[asset.path]);
});

test('served model/runtime corruption or disappearance fails independently of source revision',()=>{
 const root=mkdtempSync(path.join(tmpdir(),'served-pin-test-')),model=Buffer.from('model'),runtime=Buffer.from('runtime');
 const manifest={models:[{name:'test',files:[{path:'model.onnx',bytes:model.length,sha256:sha(model)}]}],runtime:{files:[{path:'ort.mjs',bytes:runtime.length,sha256:sha(runtime)}]}};
 for(const base of ['public','dist'])for(const [relative,bytes] of [['models/test/model.onnx',model],['runtime/ort.mjs',runtime]]){const f=path.join(root,base,relative);mkdirSync(path.dirname(f),{recursive:true});writeFileSync(f,bytes);}
 const snapshot={revision:'unchanged',assets:pinnedAssets(manifest,root)},options={root,revision:()=>snapshot.revision};
 assert.equal(finishSnapshot(snapshot,options).stable,true);assert.equal(snapshot.assets.length,4);
 for(const [relative,bytes] of [['dist/runtime/ort.mjs',runtime],['dist/models/test/model.onnx',model]]){
   writeFileSync(path.join(root,relative),Buffer.alloc(bytes.length));assert.throws(()=>pinnedAssets(manifest,root),/Pinned asset mismatch/);
   const result=finishSnapshot(snapshot,options);assert.equal(result.finalRevision,'unchanged');assert.equal(result.stable,false);assert.deepEqual(result.changedAssets,[relative]);writeFileSync(path.join(root,relative),bytes);
 }
 const missing={...snapshot,assets:[...snapshot.assets,{path:'dist/models/missing.onnx',actualSha256:sha(model)}]};
 assert.equal(finishSnapshot(missing,options).stable,false);assert.equal(finishSnapshot(missing,options).errors.length,1);
});

test('RSS summary refuses denied, partial, missing-root and invalid samples',()=>{
 const complete={expectedPids:[1,2],processes:[{pid:1,rssBytes:100},{pid:2,rssBytes:200}],rssBytes:300,errors:[]};
 const summary=samples=>summarizeMemory({rootPid:1,samples,errors:[]});
 assert.equal(summary([complete]).status,'measured');assert.equal(summary([complete]).peakBytes,300);
 for(const sample of [{expectedPids:[1,2],processes:[],rssBytes:0,errors:['AccessDenied']},{...complete,processes:[{pid:2,rssBytes:200}],rssBytes:200},{...complete,processes:[{pid:1,rssBytes:100},{pid:1,rssBytes:200}]},{...complete,rssBytes:0}]){
   const allBad=summary([sample]);assert.equal(allBad.status,'incomplete');assert.equal(allBad.peakBytes,null);assert.equal(allBad.baselineBytes,null);
   assert.equal(summary([complete,sample]).status,'incomplete');assert.equal(summary([complete,sample]).partialSamples,1);
 }
 assert.equal(summary([]).peakBytes,null);
});

test('Python sampler retains AccessDenied and emits null RSS when no PID can be read',()=>{
 const deps=mkdtempSync(path.join(tmpdir(),'memory-denied-test-'));
 writeFileSync(path.join(deps,'psutil.py'),`class AccessDenied(Exception): pass\nclass NoSuchProcess(Exception): pass\nclass Process:\n def __init__(self,pid): self.pid=pid\n def children(self,recursive=True): return [Process(2)]\n def memory_info(self): raise AccessDenied('denied')\n`);
 const executable=process.env.BINT_REFERENCE_PYTHON??(process.platform==='win32'?path.join(process.env.LOCALAPPDATA,'Programs/Python/Python312/python.exe'):'python3');
 const r=spawnSync(executable,['scripts/sample-process-memory.py','1',deps],{encoding:'utf8',timeout:1000,windowsHide:true});
 assert.ok(r.stdout?.trim(),String(r.error??r.stderr));const sample=JSON.parse(r.stdout.trim().split('\n')[0]);
 assert.deepEqual(sample.expectedPids,[1,2]);assert.equal(sample.processes.length,0);assert.equal(sample.errors.length,2);assert.equal(sample.rssBytes,null);assert.equal(sample.observedRssBytes,null);
 const result=summarizeMemory({rootPid:1,samples:[sample],errors:[]});assert.equal(result.status,'incomplete');assert.equal(result.peakBytes,null);
});

test('fault targets distinguish model weights, runtime module and actual WASM',()=>{
 const manifest=JSON.parse(readFileSync('src/ai/model-manifest.json'));
 const model=faultTarget(manifest,'model-hash-mismatch'),runtime=faultTarget(manifest,'runtime-hash-mismatch'),wasm=faultTarget(manifest,'wasm-unavailable');
 assert.match(model.path,/^\/models\/whisper-tiny\/.*\.onnx$/);assert.match(runtime.path,/^\/runtime\/.*\.mjs$/);assert.match(wasm.path,/^\/runtime\/.*\.wasm$/);
 const bytes=Buffer.from('test-model'),target={path:'/models/test/model.onnx',bytes:bytes.length,sha256:sha(bytes)},changed=corruptPinnedAsset(bytes,target);
 assert.equal(changed.proof.sameLength,true);assert.notEqual(changed.proof.servedSha256,target.sha256);assert.equal(sha(bytes),target.sha256);assert.throws(()=>corruptPinnedAsset(changed.body,target),/pristine/);
});

test('wrapped model error needs observed native digest of the exact corrupted pinned bytes',()=>{
 const bytes=Buffer.from('pinned model'),target={path:'/models/test/model.onnx',bytes:bytes.length,sha256:sha(bytes)},injected=corruptPinnedAsset(bytes,target),injections=[{proof:injected.proof}];
 const result={error:'ModelFileNotFoundError: '+target.path,events:[{diagnosticIntegrity:{path:target.path,bytes:bytes.length,sha256:injected.proof.servedSha256}}]};
 assert.match(verifyIntegrityRejection(result,injections,target).classification,/wrapped/);
 for(const bad of [{...result,events:[]},{...result,error:'ModelFileNotFoundError: /models/wrong.onnx'},{...result,text:'unexpected inference'},{...result,events:[{diagnosticIntegrity:{path:target.path,bytes:bytes.length,sha256:target.sha256}}]}])assert.throws(()=>verifyIntegrityRejection(bad,injections,target),/proven integrity/);
});

test('browser log files are unique absolute retained paths outside the worktree',()=>{
 const a=browserLogging('regression'),b=browserLogging('regression');assert.notEqual(a.file,b.file);
 for(const log of [a,b]){assert.ok(path.isAbsolute(log.file));assert.ok(path.relative(process.cwd(),log.file).startsWith('..'));assert.equal(log.env.CHROME_LOG_FILE,log.file+'.native.log');assert.equal(readFileSync(log.file).length,0);}
});

test('rejected HTTPS certificate retains native logs outside checkout and preserves debug.log',{timeout:30000},async t=>{
 const cwd=process.cwd(),before=existsSync('debug.log')?sha(readFileSync('debug.log')):null;
 const server=await serveBuilt(0,{fixtures:{'/':{type:'text/html',body:'<!doctype html><title>rejected certificate</title>'}}});let browser,logs;
 try{
   browser=await launchLoggedBrowser(chromium,{headless:true});logs=browser.diagnosticLogs;
   const args=browser.diagnosticLaunchOptions.args;
   assert.deepEqual(args.filter(arg=>arg.startsWith('--log-file=')),[]);
   assert.deepEqual(args.filter(arg=>arg.startsWith('--enable-logging')),['--enable-logging=stderr']);
   assert.equal(logs.file,logs.stderr);
   const page=await browser.newPage();await assert.rejects(()=>page.goto(server.url),/ERR_CERT_AUTHORITY_INVALID/);
   // Only native SSL diagnostics count. The navigation error itself cannot
   // satisfy this condition; wait before shutdown so the logger can emit it.
   await waitForNativeLog(logs,/ssl_client_socket_impl.*handshake failed.*net_error -202/);
 }finally{await browser?.close();await server.close();}
 assert.equal(process.cwd(),cwd);assert.equal(existsSync('debug.log')?sha(readFileSync('debug.log')):null,before);
 assert.ok(path.relative(cwd,logs.nativeFallbackDirectory).startsWith('..'));
 const retained=readNativeLogs(logs);
 assert.match(retained,/ssl_client_socket_impl.*handshake failed.*net_error -202/);
 assert.match(readFileSync(logs.file,'utf8'),/ssl_client_socket_impl.*handshake failed.*net_error -202/);
 assert.equal(logs.collectionState,'closed');
 t.diagnostic(JSON.stringify({logs,debugLogSha256:before,nativeLogSha256:sha(readFileSync(logs.file)),nativeLogBytes:readFileSync(logs.file).length}));
});

test('launch boundary rejects conflicting log flags instead of selecting a second destination',async()=>{
 for(const arg of ['--log-file=discarded.log','--enable-logging=stderr','--disable-logging','--log-level=3']){
   await assert.rejects(()=>launchLoggedServer(chromium,{args:[arg]}),/logging flags are managed/);
 }
});

test('native log observation waits for retained bytes and refuses missing messages',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'native-log-wait-')),file=path.join(dir,'native.log'),stderr=path.join(dir,'host-stderr.log');
 writeFileSync(file,'');writeFileSync(stderr,'');const logs={file,stderr,nativeFallbackDirectory:dir};
 const timer=setTimeout(()=>writeFileSync(file,'delayed native diagnostic\n'),75);
 try{assert.match(await waitForNativeLog(logs,/delayed native diagnostic/,{timeoutMs:1000}),/delayed/);}finally{clearTimeout(timer);}
 await assert.rejects(()=>waitForNativeLog(logs,/absent native diagnostic/,{timeoutMs:50}),/Native log not observed/);
});

test('production LocalRecorder callback/decode runs without a microphone and detects an audio leak canary',{timeout:30000},async()=>{
 const entry='virtual:recorder-regression',resolved='\0'+entry;
 const bundle=await build({configFile:false,publicDir:false,logLevel:'error',plugins:[{name:'recorder-test',resolveId:id=>id===entry?resolved:null,load:id=>id===resolved?"import {LocalRecorder} from '/src/audio/recorder.ts';window.TestRecorder=LocalRecorder;":null}],build:{write:false,minify:false,rollupOptions:{input:entry,output:{format:'iife'}}}});
 const code=bundle.output.find(x=>x.type==='chunk').code;
 const server=await serveBuilt(0,{fixtures:{'/':{type:'text/html',body:'<!doctype html><link rel="icon" href="data:,"><script>'+code+'</script>'}}});let browser;
 try{
  browser=await launchLoggedBrowser(chromium,{headless:true,...(process.platform==='win32'?{channel:'msedge'}:{}),args:['--ignore-certificate-errors']});
  for(const canary of [false,true]){
   const ctx=await browser.newContext({ignoreHTTPSErrors:true});const capture=captureRequests(ctx);await ctx.route('**/*',r=>r.request().method()==='GET'?r.continue():r.abort());
   await ctx.addInitScript(installSyntheticAudio,{canary});const page=await ctx.newPage();await page.goto(server.url);
   const result=await page.evaluate(async()=>{
    const recorder=new window.TestRecorder();let resolve,reject;const done=new Promise((a,b)=>{resolve=a;reject=b;});
    await recorder.start(blob=>{void(async()=>{const ac=new AudioContext();try{const buffer=await ac.decodeAudioData(await blob.arrayBuffer());await window.syntheticAudio.canary;resolve({bytes:blob.size,seconds:buffer.duration,events:window.syntheticAudio.events,tracksStopped:window.syntheticAudio.streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))});}catch(e){reject(String(e));}finally{await ac.close();}})();});
    await new Promise(r=>setTimeout(r,300));recorder.stop();return done;
   });
   const workerEvents=await page.evaluate(async()=>{
    const url=URL.createObjectURL(new Blob(['self.onmessage=()=>self.postMessage({text:"test instrumentation only"})'],{type:'text/javascript'})),worker=new Worker(url);
    await new Promise((resolve,reject)=>{worker.onmessage=resolve;worker.onerror=reject;worker.postMessage({kind:'transcribe',input:new Float32Array(16000)});});worker.terminate();URL.revokeObjectURL(url);return window.syntheticAudio.events;
   });
   assert.ok(workerEvents.some(e=>e.type==='production-transcribe'&&e.pcmType==='Float32Array'&&e.samples===16000));
   assert.ok(result.bytes>0);assert.ok(result.seconds>0);assert.equal(result.tracksStopped,true);assert.ok(result.events.some(x=>x.type==='callback-decode'));
   await ctx.close();await capture.flush();assert.deepEqual(capture.errors,[]);
   // Contract-test coverage labels only; this fixture is not an acceptance report.
   const errors=validateCapturedNetwork(process.cwd(),server.url,['audio','text','strokes','asr','llm'],capture);
   if(canary){const leak=capture.requests.find(x=>x.url.includes('callback-canary'));assert.ok(leak);assert.equal(leak.method,'POST');assert.equal(leak.bodyBytes,32);assert.ok(leak.headers.some(x=>x.name.toLowerCase()==='x-audio-canary'));assert.equal(leak.status,'failed');assert.ok(errors.length);}
   else assert.deepEqual(errors,[],JSON.stringify(capture.requests));
  }
 }finally{await browser?.close();await server.close();}
});

test('prototype headers and duplicate prototype headers never bypass privacy',()=>{
 const origin='https://localhost',r={url:origin+'/',method:'GET',bodyBytes:0,bodyBase64:null};
 for(const headers of [[{name:'__proto__',value:'learner-secret'}],[{name:'__proto__',value:'x'},{name:'__PROTO__',value:'y'}],[{name:'constructor',value:'secret'}]])assert.notDeepEqual(validateCapturedNetwork(process.cwd(),origin,['audio','text','strokes','asr','llm'],{requests:[{...r,headers}],errors:[]}),[]);
});
test('grammar candidates use complete lexical terms and never claim contextual verification',()=>{
 for(const text of ['我的名字是小雨。','你好，我是小雨。','我还在学校。','明天的天气很好。'])assert.equal(grammarCandidates(text).some(x=>/question|interrogative/.test(x.feature)),false,text);
 assert.equal(grammarCandidates('你要什么？')[1].token,'什么');
 assert.ok(grammarCandidates('你喝茶还是水？').some(x=>x.token==='还是'&&x.status==='heuristic-candidate-unverified'));
 assert.ok(grammarCandidates('一杯水').some(x=>x.printedPage===174));
});
test('browser observer cannot create database during slow app startup; snapshots survive close',async()=>{
 const server=await serveBuilt(0,{fixtures:{'/empty':{body:'<!doctype html><title>observer</title>',type:'text/html'}}});let browser;
 try{browser=await launchLoggedBrowser(chromium,{headless:true});const context=await browser.newContext({ignoreHTTPSErrors:true});const page=await context.newPage();await page.goto(server.url+'/empty');
 for(let i=0;i<3;i++){assert.deepEqual(await page.evaluate(readChapterState),{status:'not-created'});await page.waitForTimeout(200);}
 assert.deepEqual(await page.evaluate(()=>indexedDB.databases()),[]);
 await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('jiangnan-chapter',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('state','readwrite');tx.objectStore('state').put({attempts:[{source:'typed',raw:'你好'}]},'current');tx.oncomplete=()=>{db.close();resolve();};};}));
 const before=await page.evaluate(()=>indexedDB.databases()),snapshot=await page.evaluate(readChapterState);assert.equal(snapshot.status,'snapshot');assert.equal(snapshot.value.attempts[0].source,'typed');assert.deepEqual(await page.evaluate(()=>indexedDB.databases()),before);await page.close();assert.equal(snapshot.value.attempts[0].raw,'你好');
 }finally{await browser?.close();await server.close();}
});
test('real HTTPS capture retains main/worker/SW binary and blocked canaries and rejects leaks',{timeout:30000},async()=>{
 const server=await serveBuilt(0,{fixtures:{
 '/canary':{type:'text/html',body:'<!doctype html><title>capture</title>'},
 '/sink':{body:'ok'},
 '/capture-sw.js':{type:'text/javascript',body:`self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('message',e=>{e.waitUntil(fetch('/sink?secret=sw',{method:'POST',headers:{'x-canary':'sw-secret'},body:new Uint8Array([1,255,3])}).then(()=>e.source.postMessage('done')));});`}
 }});let browser;
 try{browser=await launchLoggedBrowser(chromium,{headless:true,args:['--ignore-certificate-errors']});const ctx=await browser.newContext({ignoreHTTPSErrors:true,serviceWorkers:'allow'}),capture=captureRequests(ctx),page=await ctx.newPage();await ctx.route('**/blocked?**',r=>r.abort());await page.goto(server.url+'/canary');
 await page.evaluate(async()=>{
   await fetch('/sink?secret=main',{method:'POST',headers:{'x-canary':'main-secret'},body:new Uint8Array([0,255,42])});
   await fetch('/blocked?secret=blocked',{method:'POST',headers:{'x-canary':'blocked-secret'},body:new Uint8Array([4,5,6])}).catch(()=>{});
   await new Promise((resolve,reject)=>{const url=URL.createObjectURL(new Blob([`fetch(${JSON.stringify(location.origin+'/sink?secret=worker')},{method:'POST',headers:{'x-canary':'worker-secret'},body:new Uint8Array([7,8,255])}).then(()=>self.postMessage('done')).catch(e=>{throw e});`],{type:'text/javascript'})),w=new Worker(url);w.onmessage=()=>{w.terminate();URL.revokeObjectURL(url);resolve();};w.onerror=reject;});
   await navigator.serviceWorker.register('/capture-sw.js');await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
   await new Promise(resolve=>{navigator.serviceWorker.addEventListener('message',resolve,{once:true});navigator.serviceWorker.controller.postMessage('go');});
 });
 await page.waitForTimeout(200);await capture.flush();assert.deepEqual(capture.errors,[]);
 for(const [label,base64] of [['main','AP8q'],['blocked','BAUG'],['worker','Bwj/'],['sw','Af8D']]){const r=capture.requests.find(x=>x.url.endsWith('?secret='+label));assert.ok(r,label);assert.equal(r.bodyBase64,base64,label);assert.ok(r.headers.some(h=>h.name.toLowerCase()==='x-canary'&&h.value===label+'-secret'));if(label==='blocked')assert.equal(r.status,'failed');if(label==='sw')assert.equal(r.initiator,'service-worker');}
 assert.notDeepEqual(validateCapturedNetwork(process.cwd(),server.url,['audio','text','strokes','asr','llm'],capture),[]);
 }finally{await browser?.close();await server.close();}
});
function validSyntheticKit(){
 const parent=mkdtempSync(path.join(tmpdir(),'acceptance-kit-test-')),dir=path.join(parent,'kit'),revision='synthetic-test-only';prepareKit(dir,{revision});
 const read=name=>JSON.parse(readFileSync(path.join(dir,name))),write=(name,v)=>writeFileSync(path.join(dir,name),JSON.stringify(v));
 const texts=read('text-corpus.pending.json');texts.independence={kind:'heldout',source:'SYNTHETIC TEST DATA',reviewer:'test'};texts.texts.forEach((x,i)=>Object.assign(x,{text:'测试独立输入'+i,rights:'SYNTHETIC TEST',labelReviewer:'test'}));write('text-corpus.pending.json',texts);
 const audio=read('audio-collection.pending.json');for(const [i,s] of audio.samples.entries()){const b=Buffer.alloc(44+96000);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(96000,40);b.writeUInt16LE(i+1,44);s.file=`test-${i}.wav`;s.sha256=sha(b);s.seconds=3;s.reference='测试';s.speakerId=`test-speaker-${i%6}`;s.rights='SYNTHETIC TEST';s.labelReviewer='test';s.provenance.source='SYNTHETIC TEST';writeFileSync(path.join(dir,s.file),b);}write('audio-collection.pending.json',audio);
 const outputs=read('model-outputs.pending.json');outputs.modelOutputs.forEach((o,i)=>{o.input='测试输入'+i;o.output='测试输出'+i;});const raw={revision,results:outputs.modelOutputs.map(o=>({id:o.id,input:o.input,output:o.output}))};write('recorded-test.json',raw);const rawHash=sha(readFileSync(path.join(dir,'recorded-test.json')));outputs.modelOutputs.forEach(o=>Object.assign(o.provenance,{file:'recorded-test.json',sha256:rawHash}));write('model-outputs.pending.json',outputs);
 return {dir,revision,read,write};
}
test('readiness supports new sessions and valid data without asserting human or quality approval',()=>{
 const k=validSyntheticKit(),r=validateKit(k.dir,{revision:k.revision});assert.deepEqual(r.issues,[]);assert.equal(r.dataReady,true);assert.equal(r.legacyGateApproved,false);assert.equal(r.humanApproval,'pending');assert.match(r.quality,/not-evaluated/);
 assert.throws(()=>prepareKit(k.dir,{revision:k.revision}),/exist/i);
});
test('readiness rejects reused WAVs, bad labels/scenarios, paths, hashes, binding, missing output and text leakage',()=>{
 const k=validSyntheticKit(),audio=k.read('audio-collection.pending.json');Object.assign(audio.samples[1],{file:audio.samples[0].file,sha256:audio.samples[0].sha256,scenario:'NONEXISTENT',expectedAccepted:false});audio.samples[2].file='../outside.wav';audio.samples[3].sha256='0'.repeat(64);audio.samples[4].rights='';audio.samples[5].seconds=7;k.write('audio-collection.pending.json',audio);
 const text=k.read('text-corpus.pending.json');text.texts[0].text=JSON.parse(readFileSync('src/content/mvp.json')).utterances[0].text;k.write('text-corpus.pending.json',text);
 const out=k.read('model-outputs.pending.json');out.modelOutputs[0].output='fabricated';k.write('model-outputs.pending.json',out);
 const r=validateKit(k.dir,{revision:'wrong-snapshot'});assert.equal(r.ready,false);for(const message of ['duplicate recording','scenario/group','ENOENT','hash mismatch','rights','duration','non-independent','output not bound','binding'])assert.ok(r.issues.some(s=>s.includes(message)),message+' '+JSON.stringify(r.issues));
});

test('readiness reports malformed document and rows without throwing or accepting invalid duration metadata',()=>{
 const k=validSyntheticKit();k.write('content-review.pending.json',null);
 const audio=k.read('audio-collection.pending.json');audio.samples[0]=null;audio.samples[1].seconds=null;k.write('audio-collection.pending.json',audio);
 const text=k.read('text-corpus.pending.json');text.texts[0].text=23;k.write('text-corpus.pending.json',text);
 const r=validateKit(k.dir,{revision:k.revision});assert.equal(r.ready,false);for(const key of ['JSON object required','unique IDs','duration','text/scenario/label'])assert.ok(r.issues.some(x=>x.includes(key)),key);
});

test('readiness rejects missing text rights and declared TTS or FLEURS recordings',()=>{
 const k=validSyntheticKit(),text=k.read('text-corpus.pending.json'),audio=k.read('audio-collection.pending.json');
 text.texts[0].rights='';text.texts[1].labelReviewer='';audio.samples[0].provenance.source='FLEURS';audio.samples[1].provenance.source='TTS';
 k.write('text-corpus.pending.json',text);k.write('audio-collection.pending.json',audio);
 const r=validateKit(k.dir,{revision:k.revision});assert.equal(r.ready,false);
 assert.equal(r.issues.filter(x=>x.includes('text rights/label reviewer missing')).length,2);
 assert.equal(r.issues.filter(x=>x.includes('TTS/FLEURS')).length,2);
});
