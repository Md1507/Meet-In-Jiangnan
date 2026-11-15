import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gateNames, mvpRevision, validateMvp } from '../scripts/mvp-evidence.mjs';

// Entirely synthetic, isolated contract fixtures. These are NOT MVP evidence,
// real recordings, inference, human approval, or performance measurements.
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(),'mvp-evidence-test-'));
  const write = (name,value) => { const dest=path.join(root,name); mkdirSync(path.dirname(dest),{recursive:true}); writeFileSync(dest,Buffer.isBuffer(value)||typeof value==='string'?value:JSON.stringify(value)); };
  const read = name => JSON.parse(readFileSync(path.join(root,name),'utf8'));
  const ref = name => ({path:name,sha256:createHash('sha256').update(readFileSync(path.join(root,name))).digest('hex')});
  const ids = (prefix,count) => Array.from({length:count},(_,i)=>`${prefix}${i}`);
  write('package.json',{}); write('package-lock.json',{}); write('index.html','test');
  write('src/main.ts','// synthetic fixture'); write('scripts/fixture.mjs','// synthetic'); write('dist/index.html','test');
  write('public/art.svg','synthetic art'); write('public/license.txt','synthetic license');
  write('public/strokes.json',{strokes:['M0 0L1 1'],medians:[[[0,0],[1,1]]]});
  const wav=Buffer.alloc(44+96000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);
  wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(96000,40);write('public/sample.wav',wav);
  const manifest={inference:{asr:{model:'whisper-tiny',dtype:'q8',backends:['wasm']},llm:{model:'Qwen3-0.6B-ONNX',dtype:'q4f16',backends:['wasm','webgpu']}},models:[{name:'whisper-tiny',revision:'whisper-test',files:[{path:'model.onnx',bytes:100}]},{name:'Qwen3-0.6B-ONNX',revision:'qwen-test',files:[{path:'model.onnx',bytes:100}]}],runtime:{files:[{path:'ort.wasm',bytes:100}]}};
  write('src/ai/model-manifest.json',manifest);
  const license=ref('public/license.txt'), audio=ref('public/sample.wav');
  const content={schemaVersion:1,year:2026,days:7,startScene:'s0',endingQuest:'q5',
    scenes:ids('s',6).map((id,i)=>({id,exits:[`s${(i+1)%6}`],art:ref('public/art.svg'),license})),
    npcs:ids('n',6).map((id,i)=>({id,scene:`s${i}`,role:i?'resident':'mentor'})),
    quests:ids('q',6).map((id,i)=>({id,day:i===5?7:i+1,npc:`n${i}`,scenario:`d${i}`,requires:i?[`q${i-1}`]:[]})),
    activities:ids('a',4).map(id=>({id,scene:'s0',condition:'daytime'})),events:ids('e',4).map(id=>({id,scene:'s1',condition:'seeded'})),
    utterances:ids('u',48).map((id,i)=>({id,text:`你好${i}`,pinyin:'Nǐ hǎo.',meaningVi:'Xin chào',context:'Test',audio,license})),
    scenarios:ids('d',12).map((id,i)=>({id,npc:`n${i%6}`,positive:[`u${i*4}`,`u${i*4+1}`,`u${i*4+2}`],negative:[`u${i*4+3}`]})),
    sentenceLessons:ids('l',10).map((id,i)=>({id,scenario:`d${i}`})),
    characters:ids('h',20).map((id,i)=>({id,character:String.fromCodePoint(0x4e00+i),data:ref('public/strokes.json'),license}))};
  write('src/content/mvp.json',content);
  const dataset={promptExamples:['example'],texts:ids('t',60).map((id,i)=>({id,text:`独立测试${i}`,expected:i<30})),
    audio:ids('r',40).map((id,i)=>{const name=`docs/audio/${id}.wav`;const bytes=Buffer.from(wav);bytes[44]=i;write(name,bytes);return {id,file:ref(name),license,label:i<24?'positive':i<32?'negative':'noise',speaker:`speaker${i%6}`,text:i<32?'你好':''};})};
  write('docs/dataset.json',dataset);
  write('docs/network.json',{origin:'https://game.test',exercised:['audio','text','strokes'],requests:[{url:'https://game.test/index.html',method:'GET',bodyBytes:0,headers:{accept:'text/html'}}]});
  const revision=mvpRevision(root), reports={};
  for (const kind of gateNames) reports[kind]={schemaVersion:1,kind,revision,recordedAt:'2026-11-13T00:00:00Z'};
  Object.assign(reports.corpus60Text40Audio,{dataset:ref('docs/dataset.json'),execution:'browser-worker-real-model',cer:0,
    textResults:dataset.texts.map(x=>({id:x.id,accepted:x.expected,output:'synthetic'})),audioResults:dataset.audio.map(x=>({id:x.id,accepted:x.label==='positive',transcript:x.text}))});
  const latency={warmups:3,samplesMs:Array(20).fill(1000),coldDownloadMs:1,coldInitMs:1,backend:'synthetic',dtype:'q8',modelRevision:'test'};
  Object.assign(reports.referenceMachine,{machine:{os:'test',cpu:'test',gpu:'test',driver:'test',browser:'test',browserVersion:'test',memoryMethod:'test',ramGiB:16},peakMemoryMiB:100,
    viewport:{width:1280,height:720},npcCount:10,frameMs:Array(3600).fill(1000/60),asr:{...latency,audioSeconds:5,model:'whisper-tiny',modelRevision:'whisper-test',backend:'wasm'},llm:{...latency,maxNewTokens:64,model:'Qwen3-0.6B-ONNX',modelRevision:'qwen-test',backend:'webgpu',dtype:'q4f16'}});
  Object.assign(reports.realImeAndMic,{method:'manual-real-devices',tester:'Synthetic test person',browser:'test',ime:'test',microphone:'test'});
  Object.assign(reports.m2,{days:[1,2,3,4,5,6,7],endingQuest:'q5',scenarioResults:Object.fromEntries(content.scenarios.map(s=>[s.id,[...s.positive.map(id=>({id,accepted:true})),...s.negative.map(id=>({id,accepted:false}))]]))});
  for (const key of ['scenes','npcs','quests','activities','events']) reports.m2[key]=content[key].map(x=>x.id);
  Object.assign(reports.m3,{sentenceLessons:content.sentenceLessons.map(x=>x.id),characters:content.characters.map(x=>x.id),reviewDays:[1,3,7],hintLevels:[1,2,3],skills:['speaking','sentence','handwriting']});
  reports.m4.network=ref('docs/network.json');
  const cases={realImeAndMic:['ime-candidate-enter','mic-record-playback','mic-denied','mic-unplugged','unsupported-codec'],
    m2:['chapter-complete','event-seed-repeat','event-once-per-day','events-never-block-story','reward-once'],
    m3:['trace','stroke-hint','free-write-retry','stroke-order-feedback','separate-progress-reload','review-schedule'],
    m4:['six-region-art','hanzi-pinyin-1280x720','hanzi-pinyin-1920x1080','save-import-export','corrupt-save-rollback','offline-quest','gpu-device-lost','wasm-unavailable','download-interrupted','cache-quota','model-hash-mismatch','firefox-text-smoke','safari-text-smoke']};
  for(const [key,values] of Object.entries(cases)) reports[key].cases=values.map(id=>{
    const name=`docs/logs/${id}.json`;write(name,{schemaVersion:1,kind:'mvp-case',caseId:id,revision,steps:[{action:'synthetic check',expected:1,actual:1}]});
    return {id,status:'passed',observed:'synthetic',log:ref(name)};
  });
  const config={schemaVersion:1,content:ref('src/content/mvp.json')};
  for(const key of gateNames){config[key]={evidence:`docs/${key}.json`};write(config[key].evidence,reports[key]);}
  write('docs/mvp-gates.json',config);
  const refresh=()=>{const revision=mvpRevision(root);for(const [key,r] of Object.entries(reports)){r.revision=revision;for(const c of r.cases??[]){const data=read(c.log.path);data.revision=revision;write(c.log.path,data);c.log=ref(c.log.path);}write(config[key].evidence,r);}};
  return {root,write,read,ref,config,reports,content,dataset,refresh,close:()=>rmSync(root,{recursive:true,force:true})};
}
function scenario(name, run) {test(name,()=>{const f=fixture();try{run(f);}finally{f.close();}});}
const rejects=(f,pattern)=>assert.match(validateMvp(f.root).join('\n'),pattern);

scenario('accepts a complete isolated synthetic contract (not real acceptance evidence)',f=>assert.deepEqual(validateMvp(f.root),[]));
scenario('accepts the reduced MVP boundary and still rejects weaker evidence',f=>{
  const corpus=f.reports.corpus60Text40Audio;
  corpus.textResults.forEach((x,i)=>x.accepted=i<24||(i>=30&&i<33));
  corpus.audioResults.forEach((x,i)=>x.accepted=i<16||(i>=24&&i<26));
  f.dataset.audio.forEach((x,i)=>x.speaker=`speaker${i%3}`);
  f.write('docs/dataset.json',f.dataset);corpus.dataset=f.ref('docs/dataset.json');
  f.write('docs/corpus60Text40Audio.json',corpus);
  const machine=f.reports.referenceMachine;
  for(const [key,limit] of [['asr',18000],['llm',14000]])Object.assign(machine[key],{warmups:2,samplesMs:Array(12).fill(limit)});
  f.write('docs/referenceMachine.json',machine);
  const devices=f.reports.realImeAndMic;
  devices.cases=devices.cases.filter(x=>['ime-candidate-enter','mic-record-playback','mic-denied'].includes(x.id));
  f.write('docs/realImeAndMic.json',devices);
  const m4=f.reports.m4;
  m4.cases=m4.cases.filter(x=>!['hanzi-pinyin-1920x1080','cache-quota','firefox-text-smoke','safari-text-smoke'].includes(x.id));
  f.write('docs/m4.json',m4);
  assert.deepEqual(validateMvp(f.root),[]);
  corpus.textResults[33].accepted=true;f.write('docs/corpus60Text40Audio.json',corpus);rejects(f,/text quality/);
  corpus.textResults[33].accepted=false;
  corpus.audioResults[26].accepted=true;f.write('docs/corpus60Text40Audio.json',corpus);rejects(f,/audio intent quality/);
  corpus.audioResults[26].accepted=false;f.write('docs/corpus60Text40Audio.json',corpus);
  machine.asr.samplesMs=machine.asr.samplesMs.slice(0,2);f.write('docs/referenceMachine.json',machine);rejects(f,/asr.samplesMs/);machine.asr.samplesMs.push(18000);f.write('docs/referenceMachine.json',machine);
  devices.cases=devices.cases.filter(x=>x.id!=='mic-denied');f.write('docs/realImeAndMic.json',devices);rejects(f,/phục hồi mic/);
  m4.cases=m4.cases.filter(x=>x.id!=='offline-quest');f.write('docs/m4.json',m4);rejects(f,/offline-quest/);
});
scenario('rejects original seven passed flags and directory exploit',f=>{
  f.write('docs/mvp-gates.json',Object.fromEntries(gateNames.map(key=>[key,{passed:true,evidence:'docs'}])));rejects(f,/schemaVersion/);
  f.config.m2={passed:true,evidence:'docs'};f.write('docs/mvp-gates.json',f.config);rejects(f,/tệp thường/);
});
scenario('rejects empty/malformed/arbitrary reports and wrong report kinds',f=>{
  for(const value of ['', '{', {passed:true}, {...f.reports.m2,kind:'m3'}]){f.write('docs/m2.json',value);rejects(f,/m2:/);}
});
scenario('requires every gate and a matching build revision',f=>{
  delete f.config.m3;f.write('docs/mvp-gates.json',f.config);rejects(f,/m3:/);
  f.write('src/main.ts','// source changed');rejects(f,/report cũ/);
});
scenario('ignores temporary manual diagnostic output when binding a production report',f=>{
  const before=mvpRevision(f.root);
  f.write('dist/diagnostic/entry.js','temporary helper output');
  assert.equal(mvpRevision(f.root),before);
  assert.deepEqual(validateMvp(f.root),[]);
});
scenario('rejects insufficient content and dangling/cyclic references',f=>{
  for(const mutate of [c=>c.scenes.pop(),c=>c.scenes[0].exits=['missing'],c=>c.quests[0].requires=['q0'],c=>c.sentenceLessons.pop(),c=>c.characters.pop(),c=>delete c.utterances[0].audio]){
    const c=structuredClone(f.content);mutate(c);f.write('src/content/mvp.json',c);f.config.content=f.ref('src/content/mvp.json');f.write('docs/mvp-gates.json',f.config);rejects(f,/content\/config:/);
  }
});
scenario('recomputes corpus quality instead of trusting claimed aggregate success',f=>{
  const r=f.reports.corpus60Text40Audio;r.passed=true;r.correct=60;r.textResults.forEach(x=>x.accepted=true);f.write('docs/corpus60Text40Audio.json',r);rejects(f,/FP=30/);
});
scenario('requires audio thresholds, valid WAV, hashes and recomputed CER',f=>{
  const r=f.reports.corpus60Text40Audio;
  r.audioResults[39].accepted=true;f.write('docs/corpus60Text40Audio.json',r);rejects(f,/audio intent quality/);
  r.audioResults[39].accepted=false;r.cer=.3;f.write('docs/corpus60Text40Audio.json',r);rejects(f,/CER/);
  f.write('public/sample.wav','broken');rejects(f,/artifact đã đổi/);
});
scenario('rejects incomplete/overlapping corpus and fewer than three speakers',f=>{
  const r=f.reports.corpus60Text40Audio;
  for(const mutate of [d=>d.texts.pop(),d=>d.texts[0].text=f.content.utterances[0].text,d=>d.audio.forEach(x=>x.speaker='one')]){
    const d=structuredClone(f.dataset);mutate(d);f.write('docs/dataset.json',d);r.dataset=f.ref('docs/dataset.json');f.write('docs/corpus60Text40Audio.json',r);rejects(f,/corpus60Text40Audio:/);
  }
});
scenario('recomputes FPS, measurement duration and model p95',f=>{
  for(const mutate of [r=>r.frameMs=Array(1800).fill(1000/30),r=>r.frameMs=[16],r=>r.asr.samplesMs=Array(3).fill(19000),r=>r.llm.samplesMs=Array(3).fill(15000),r=>r.npcCount=5]){
    const r=structuredClone(f.reports.referenceMachine);mutate(r);f.write('docs/referenceMachine.json',r);rejects(f,/referenceMachine:/);
  }
});
scenario('rejects adapter evidence for real devices',f=>{
  f.reports.realImeAndMic.method='adapter';f.write('docs/realImeAndMic.json',f.reports.realImeAndMic);rejects(f,/realImeAndMic:/);
});
scenario('requires M2/M3 runtime coverage and case logs with matching assertions',f=>{
  f.reports.m2.scenes.pop();f.write('docs/m2.json',f.reports.m2);rejects(f,/coverage scenes/);
  f.reports.m3.characters.pop();f.write('docs/m3.json',f.reports.m3);rejects(f,/10 bài\/20 chữ/);
  const r=f.reports.m4,log=r.cases[0].log.path,data=f.read(log);data.steps[0].actual=0;f.write(log,data);r.cases[0].log=f.ref(log);f.write('docs/m4.json',r);rejects(f,/assertion chưa đạt/);
});
scenario('rejects network upload, external requests and missing data routes',f=>{
  const initial=f.read('docs/network.json');
  for(const mutate of [r=>r.requests[0].method='POST',r=>r.requests[0].url='https://external.test',r=>r.exercised=['audio']]){
    const r=structuredClone(initial);mutate(r);f.write('docs/network.json',r);f.reports.m4.network=f.ref('docs/network.json');f.write('docs/m4.json',f.reports.m4);rejects(f,/m4:/);
  }
});
scenario('rejects changed build and missing report files',f=>{
  f.write('dist/index.html','new build');rejects(f,/report cũ/);
  f.config.m4.evidence='docs/missing.json';f.write('docs/mvp-gates.json',f.config);rejects(f,/m4:/);
});
scenario('checks actual package sizes, not reported size claims',f=>{
  f.write('dist/oversize.bin',Buffer.alloc(30*1024*1024));f.refresh();rejects(f,/gói chơi đầu vượt 30 MiB/);
  rmSync(path.join(f.root,'dist/oversize.bin'));const m=f.read('src/ai/model-manifest.json');m.models[0].files[0].bytes=801*1024*1024;f.write('src/ai/model-manifest.json',m);f.refresh();rejects(f,/gói AI vượt 800 MiB/);
});
scenario('review7 rejects same-origin query/path/header leaks and allows only built static resources',f=>{
  const baseline=f.read('docs/network.json');
  for(const mutate of [n=>n.requests[0].url+='?text=你好',n=>n.requests[0].url='https://game.test/collect/你好',n=>n.requests[0].headers['x-answer']='你好',n=>n.requests[0].headers.referer='https://game.test/?text=你好',n=>delete n.requests[0].headers]){
    const n=structuredClone(baseline);mutate(n);f.write('docs/network.json',n);f.reports.m4.network=f.ref('docs/network.json');f.write('docs/m4.json',f.reports.m4);rejects(f,/network/);
  }
});
scenario('review7 rejects model/revision/dtype/backend mismatches',f=>{
  for(const field of ['model','modelRevision','dtype','backend'])for(const kind of ['asr','llm']){
    const r=structuredClone(f.reports.referenceMachine);r[kind][field]='wrong';f.write('docs/referenceMachine.json',r);rejects(f,/khác manifest/);
  }
});
scenario('review8 rejects learner payloads in permitted header values',f=>{
  const baseline=f.read('docs/network.json');
  const text='我要一杯热水',encoded=encodeURIComponent(text);
  const headers=[
    {accept:'text/plain; learner='+encoded},
    {'if-none-match':'"learner-'+encodeURIComponent('我不要热水')+'"'},
    {'if-modified-since':text},
    {'accept-language':'en-US,'+encoded},
    {'accept-encoding':'gzip, '+encoded},
    {'user-agent':'Mozilla/5.0 '+encoded},
    {'sec-ch-ua':'"Chromium";v="157", "'+encoded+'";v="1"'},
    {host:'game.test;'+encoded}, {origin:'https://game.test/'+encoded},
    {range:'bytes=0-;learner='+encoded}, {'cache-control':'no-cache;'+encoded},
    {priority:'u=1, i;'+encoded}, {Accept:'text/html;'+encoded},
    {accept:'text/html',Accept:'text/html'}, {accept:'text/html\r\nx-answer: '+text},
  ];
  for(const value of headers){
    const n=structuredClone(baseline);n.requests[0].headers=value;f.write('docs/network.json',n);
    f.reports.m4.network=f.ref('docs/network.json');f.write('docs/m4.json',f.reports.m4);rejects(f,/m4: network/);
  }
});
scenario('review8 accepts normal static desktop browser headers and model downloads',f=>{
  const n=f.read('docs/network.json');
  const common={accept:'*/*','accept-encoding':'gzip, deflate, br, zstd','accept-language':'en-US,en;q=0.9',
    host:'game.test',origin:'https://game.test',referer:'https://game.test/index.html',
    'cache-control':'no-cache',pragma:'no-cache','sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty'};
  const agents=[
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  ];
  for(const agent of agents)n.requests.push({url:'https://game.test/models/whisper-tiny/model.onnx',method:'GET',bodyBytes:0,headers:{...common,'user-agent':agent}});
  n.requests[0].headers={...common,Accept:'text/html'};delete n.requests[0].headers.accept;
  Object.assign(n.requests[1].headers,{'sec-ch-ua':'"Not_A Brand";v="99", "Chromium";v="157", "Microsoft Edge";v="157"',
    'sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"'});
  n.requests.push({url:'https://game.test/runtime/ort.wasm',method:'HEAD',bodyBytes:0,headers:{accept:'*/*'}});
  n.requests.push({url:'https://game.test/index.html',method:'GET',bodyBytes:0,headers:{accept:'*/*',range:'bytes=0-'}});
  f.write('docs/network.json',n);f.reports.m4.network=f.ref('docs/network.json');f.write('docs/m4.json',f.reports.m4);
  assert.deepEqual(validateMvp(f.root),[]);
});
