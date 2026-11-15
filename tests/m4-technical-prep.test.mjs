import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privacyAssessment, faultAssessment,evidenceInventory} from '../scripts/verify-m4-technical-prep.mjs';
import {frameSummary} from '../scripts/chapter-frames.mjs';
import {sameProgress,faultTarget,openNearbyChapterTopic} from '../scripts/diagnostic-faults.mjs';
import {benchmarkSummary} from '../scripts/acceptance-evidence.mjs';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {resolveOpenSSL,createLocalCertificate} from '../scripts/serve-built.mjs';
import {productBundles} from '../scripts/diagnostic-build.mjs';
import {validateCapturedNetwork} from '../scripts/mvp-evidence.mjs';

test('browser service-worker metadata and empty referrer do not permit learner payloads or unknown resources',()=>{
 const origin='https://localhost',routes=['audio','text','strokes','asr','llm'];
 const request={url:origin+'/sw.js',method:'GET',bodyBytes:0,bodyBase64:null,headers:[{name:'Service-Worker',value:'script'},{name:'Referer',value:''}]};
 const check=r=>validateCapturedNetwork(process.cwd(),origin,routes,{requests:[r],errors:[]});
 assert.deepEqual(check(request),[]);
 for(const changed of [
  {...request,headers:[{name:'Service-Worker',value:'script; learner=secret'}]},
  {...request,headers:[{name:'Referer',value:origin+'/?text=secret'}]},
  {...request,headers:[{name:'Referer',value:'https://outside.example/'}]},
  {...request,url:origin+'/sw.js?text=secret'},
  {...request,url:origin+'/not-a-built-asset'},
  {...request,method:'POST',bodyBytes:1,bodyBase64:'YQ=='}
 ])assert.notDeepEqual(check(changed),[]);
});

test('product bundle accounting verifies the offline files and excludes diagnostic duplicates without changing limits',t=>{
 const root=mkdtempSync(path.join(tmpdir(),'m4-bundles-'));
 t.after(()=>{assert.equal(path.dirname(root),path.resolve(tmpdir()));assert.ok(path.basename(root).startsWith('m4-bundles-'));rmSync(root,{recursive:true,force:true});});
 for(const dir of ['src/ai','dist/assets','dist/diagnostic/assets'])mkdirSync(path.join(root,dir),{recursive:true});
 const page=Buffer.from('game'),offline={files:[{url:'/index.html',bytes:page.length,sha256:createHash('sha256').update(page).digest('hex')}]};
 writeFileSync(path.join(root,'dist/index.html'),page);
 writeFileSync(path.join(root,'dist/offline-assets.json'),JSON.stringify(offline));
 writeFileSync(path.join(root,'dist/assets/model.worker-test.js'),'ai');
 writeFileSync(path.join(root,'dist/diagnostic/assets/ort.wasm'),Buffer.alloc(1024));
 writeFileSync(path.join(root,'src/ai/model-manifest.json'),JSON.stringify({models:[{files:[{bytes:10}]}],runtime:{files:[{bytes:5}]}}));
 const result=productBundles(root);
 assert.equal(result.playBytes,page.length+Buffer.byteLength(JSON.stringify(offline)));
 assert.equal(result.aiBytes,17);assert.equal(result.withinLimits,true);
 assert.equal(result.playLimitBytes,30*1024*1024);assert.equal(result.aiLimitBytes,800*1024*1024);
 writeFileSync(path.join(root,'dist/index.html'),'broken');assert.throws(()=>productBundles(root),/Offline asset changed/);
 writeFileSync(path.join(root,'dist/index.html'),page);offline.files[0].bytes++;
 writeFileSync(path.join(root,'dist/offline-assets.json'),JSON.stringify(offline));assert.throws(()=>productBundles(root),/Offline asset changed/);
 offline.files[0].url='/../outside';writeFileSync(path.join(root,'dist/offline-assets.json'),JSON.stringify(offline));assert.throws(()=>productBundles(root),/outside dist/);
});

test('OpenSSL resolves from Git on Windows without PATH changes, with explicit overrides and PATH taking priority',()=>{
 const environment={Path:'C:\\Node',ProgramFiles:'C:\\Program Files',LOCALAPPDATA:'C:\\Users\\Test\\AppData\\Local'};
 const bundled='C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe',custom='D:\\TLS tools\\openssl.exe';
 const exists=file=>[bundled,custom].includes(file);
 assert.equal(resolveOpenSSL({environment,platform:'win32',exists}),bundled);
 assert.equal(resolveOpenSSL({environment:{...environment,Path:'"D:\\TLS tools";C:\\Node'},platform:'win32',exists}),custom);
 assert.equal(resolveOpenSSL({environment:{...environment,BINT_OPENSSL:custom},platform:'win32',exists}),custom);
 assert.throws(()=>resolveOpenSSL({environment:{...environment,BINT_OPENSSL:'missing.exe'},platform:'win32',exists}),/BINT_OPENSSL/);
 assert.throws(()=>resolveOpenSSL({environment,platform:'win32',exists:()=>false}),/BINT_OPENSSL/);
 assert.equal(resolveOpenSSL({environment:{PATH:'/usr/bin'},platform:'linux',exists:file=>file==='/usr/bin/openssl'}),'/usr/bin/openssl');
});

test('certificate launch errors retain the executable and actual error even when stderr is absent',t=>{
 const directory=mkdtempSync(path.join(tmpdir(),'m4-cert test-'));
 t.after(()=>{assert.equal(path.dirname(directory),path.resolve(tmpdir()));assert.ok(path.basename(directory).startsWith('m4-cert test-'));rmSync(directory,{recursive:true,force:true});});
 const executable='C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe';
 assert.throws(()=>createLocalCertificate(directory,{executable,run:()=>({status:null,error:Error('spawn ENOENT')})}),error=>error.message.includes(executable)&&error.message.includes('ENOENT')&&!error.message.includes('undefined'));
 assert.throws(()=>createLocalCertificate(directory,{executable,run:()=>({status:1,stderr:'config failed'})}),/config failed/);
 assert.throws(()=>createLocalCertificate(directory,{executable,run:()=>({status:7})}),/exit 7/);
});

test('missing exercise remains pending, and attempted does not imply exercised',()=>{
 const capture={requests:[{url:'https://localhost/',method:'GET',bodyBytes:0,bodyBase64:null,headers:[]}],errors:[]};
 const result=privacyAssessment(process.cwd(),'https://localhost',{text:{attempted:true,exercised:true},audio:{attempted:true,exercised:false}},capture);
 assert.notEqual(result.status,'prepared');assert.ok(result.missing.includes('audio'));assert.ok(result.attempted.includes('audio'));assert.ok(!result.exercised.includes('audio'));
});
test('upload and capture errors cannot become prepared',()=>{
 const coverage=Object.fromEntries(['audio','text','strokes','asr','llm'].map(id=>[id,{attempted:true,exercised:true}]));
 const capture={requests:[{url:'https://outside.example/upload?q=secret',method:'POST',bodyBytes:1,bodyBase64:'YQ==',headers:[]}],errors:[]};
 assert.equal(privacyAssessment(process.cwd(),'https://localhost',coverage,capture).status,'rejected');
 capture.errors.push('capture failed');assert.equal(privacyAssessment(process.cwd(),'https://localhost',coverage,capture).status,'rejected');
});
test('unrun and inadequately documented faults are never passed',()=>{
 const rows=faultAssessment([{id:'gpu-device-lost',status:'passed'}]);
 assert.equal(rows[0].status,'inconclusive');assert.equal(rows[1].status,'not-run');
});

test('inventory detects stale revision, changed bytes, missing provenance and missing report without rewriting history',t=>{
 const root=mkdtempSync(path.join(tmpdir(),'m4-inventory-'));t.after(()=>{assert.equal(path.dirname(root),path.resolve(tmpdir()));assert.ok(path.basename(root).startsWith('m4-inventory-'));rmSync(root,{recursive:true,force:true});});
 const report={revision:'build-a',snapshot:{head:'commit-a',manifestSha256:'manifest-a'},command:['node','runner'],machine:{cpu:'fixture'},browser:{version:'fixture'},createdAt:'2026-11-14T00:00:00Z'},current={revision:'build-a',head:'commit-a',manifestSha256:'manifest-a'};
 const bytes=JSON.stringify(report),file=path.join(root,'report.json');writeFileSync(file,bytes);
 const ref={path:'report.json',sha256:createHash('sha256').update(bytes).digest('hex')};
 assert.equal(evidenceInventory(root,[ref],current)[0].status,'current');
 assert.equal(evidenceInventory(root,[ref],{...current,revision:'build-b'})[0].status,'stale');
 assert.equal(evidenceInventory(root,[ref],{...current,manifestSha256:'changed'})[0].status,'stale');
 assert.equal(readFileSync(file,'utf8'),bytes);
 for(const inconsistent of [
  {...report,snapshot:{...report.snapshot,revision:'old-build'}},
  {...report,buildSourceRevision:'old-build'},
  {...report,sourceCommit:'old-commit'},
  {...report,head:'old-commit'},
  {...report,manifestSha256:'old-manifest'},
  {...report,hashes:{'src/ai/model-manifest.json':'old-manifest'}}
 ]){
  const historical=JSON.stringify(inconsistent);writeFileSync(file,historical);
  const result=evidenceInventory(root,[{path:'report.json'}],current)[0];
  assert.equal(result.status,'stale');assert.ok(result.issues.some(issue=>issue.startsWith('conflicting ')));
  assert.equal(readFileSync(file,'utf8'),historical);
 }
 writeFileSync(file,bytes);
 assert.equal(evidenceInventory(root,[ref],{...current,revision:null})[0].status,'pending');
 writeFileSync(file,JSON.stringify({...report,machine:undefined}));
 assert.equal(evidenceInventory(root,[ref],current)[0].status,'stale');
 assert.equal(evidenceInventory(root,[{path:'report.json'}],current)[0].status,'pending');
 assert.equal(evidenceInventory(root,[{path:'absent.json'}],current)[0].status,'missing');
 assert.equal(evidenceInventory(root,[{path:'../outside.json'}],current)[0].status,'invalid');
});

test('FPS retains long frames and reports average separately from the acceptance median',()=>{
 const frames=[10,10,10,1000],result=frameSummary(frames);
 assert.equal(result.durationMs,1030);assert.equal(result.medianFps,100);assert.equal(result.averageFps,4000/1030);
 assert.equal(frameSummary([16,0,16]).medianFps,null);assert.equal(frameSummary([]).medianFps,null);
});

test('progress comparison detects lost quest, journal and skills while allowing persistence revision changes',()=>{
 const before={revision:1,completed:['arrival'],journal:[{id:'learned'}],skills:{speaking:{greeting:1}}};
 assert.ok(sameProgress(before,{...before,revision:2}));
 for(const changed of [{...before,completed:[]},{...before,journal:[]},{...before,skills:{speaking:{}}},null])assert.equal(sameProgress(before,changed),false);
 const manifest={inference:{asr:{model:'test'}},models:[{name:'test',files:[{path:'model.onnx'}]}],runtime:{files:[{path:'runtime.mjs'},{path:'runtime.wasm'}]}};
 assert.equal(faultTarget(manifest,'wasm-hash-mismatch').path,'/runtime/runtime.wasm');
});

test('NPC approach waits for proximity and releases movement on timeout without sending an interaction',async()=>{
 const makePage=({near=false,timeout=false}={})=>{
  const calls=[];
  return {calls,locator:selector=>({focus:async()=>calls.push('focus'),textContent:async()=>near?'E · Nói chuyện với NPC':'Khám phá khu vực'}),
   keyboard:{down:async key=>calls.push('down:'+key),up:async key=>calls.push('up:'+key),press:async key=>calls.push('press:'+key)},
   waitForFunction:async()=>{calls.push('wait-proximity');if(timeout)throw Error('proximity timeout');},
   getByRole:(role,{name,exact})=>({click:async()=>{assert.equal(exact,false);calls.push('topic:'+name);}})};
 };
 const page=makePage();await openNearbyChapterTopic(page,'Nhận phòng');
 assert.deepEqual(page.calls,['focus','down:a','wait-proximity','up:a','press:e','topic:Nhận phòng']);
 const stalled=makePage({timeout:true});await assert.rejects(openNearbyChapterTopic(stalled,'Nhận phòng'),/proximity timeout/);
 assert.deepEqual(stalled.calls,['focus','down:a','wait-proximity','up:a']);
 const nearby=makePage({near:true});await openNearbyChapterTopic(nearby,'Nhận phòng');
 assert.deepEqual(nearby.calls,['focus','press:e','topic:Nhận phòng']);
});

test('M4 smoke supports exactly 2 warmups and 12 valid measured samples without changing legacy defaults',()=>{
 const sample={initMs:1,inferenceMs:18000},warmups=[sample,sample],samples=Array(12).fill(sample);
 assert.equal(benchmarkSummary(sample,warmups,samples,18000,{warmups:2,samples:12}).latencyWithinLimit,true);
 assert.equal(benchmarkSummary(sample,warmups,samples,14000,{warmups:2,samples:12}).latencyWithinLimit,false);
 assert.equal(benchmarkSummary(sample,warmups,samples,18000).status,'incomplete');
 assert.equal(benchmarkSummary(sample,warmups,samples.slice(1),18000,{warmups:2,samples:12}).status,'incomplete');
});
