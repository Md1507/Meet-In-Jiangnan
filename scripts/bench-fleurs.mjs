import { env, pipeline } from '@huggingface/transformers';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const fixtureRoot=new URL('../tests/fixtures/fleurs/',import.meta.url);
const corpus=JSON.parse(await readFile(new URL('manifest.json',fixtureRoot),'utf8'));
env.allowRemoteModels=false;env.allowLocalModels=true;
env.localModelPath=fileURLToPath(new URL('../public/models/',import.meta.url));
function pcm(wav){
  let offset=12,format,channels,rate,bits,data;
  while(offset+8<=wav.length){
    const name=wav.toString('ascii',offset,offset+4),size=wav.readUInt32LE(offset+4),start=offset+8;
    if(name==='fmt '){format=wav.readUInt16LE(start);channels=wav.readUInt16LE(start+2);rate=wav.readUInt32LE(start+4);bits=wav.readUInt16LE(start+14);}
    if(name==='data')data=wav.subarray(start,start+size);
    offset=start+size+(size%2);
  }
  if(channels!==1||rate!==16000||!data)throw Error('Expected mono 16kHz WAV');
  const result=new Float32Array(data.length/(bits/8));
  for(let i=0;i<result.length;i++){
    if(format===3&&bits===32)result[i]=data.readFloatLE(i*4);
    else if(format===1&&bits===16)result[i]=data.readInt16LE(i*2)/32768;
    else throw Error(`Unsupported WAV ${format}/${bits}`);
  }
  return result;
}
const normalize=s=>s.normalize('NFKC').replace(/[\p{P}\p{Z}\s]/gu,'').toLowerCase();
function edits(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const next=[i+1];for(let j=0;j<b.length;j++)next.push(Math.min(next[j]+1,row[j+1]+1,row[j]+Number(a[i]!==b[j])));row=next;}return row[b.length];}
const started=performance.now();
const asr=await pipeline('automatic-speech-recognition','whisper-tiny',{device:'cpu',dtype:'q8'});
const coldInitMs=Math.round(performance.now()-started), results=[];
for(const sample of corpus.samples){
  const bytes=await readFile(new URL(sample.file,fixtureRoot));
  if(createHash('sha256').update(bytes).digest('hex')!==sample.sha256)throw Error(`Corrupt audio ${sample.file}`);
  const audio=pcm(bytes),t=performance.now();
  const output=await asr(audio,{language:'chinese',task:'transcribe',max_new_tokens:128});
  const reference=normalize(sample.text),transcript=String(output.text),actual=normalize(transcript);
  results.push({file:sample.file,reference:sample.text,transcript,seconds:sample.seconds,
    inferenceMs:Math.round(performance.now()-t),edits:edits(reference,actual),characters:reference.length});
  console.log(`${results.length}/${corpus.samples.length} ${results.at(-1).inferenceMs}ms ${transcript}`);
}
const timings=results.slice(3).map(r=>r.inferenceMs).sort((a,b)=>a-b);
const report={createdAt:new Date().toISOString(),kind:'public-speech-asr-smoke',
  limitations:['Node CPU, not browser or reference-machine benchmark','General read speech, not game intent labels',
    'Speaker IDs unavailable; six distinct speakers not established','Not human-reviewed game audio or pronunciation scoring'],
  source:{dataset:corpus.dataset,revision:corpus.revision,license:corpus.license,attribution:corpus.attribution},
  hardware:{platform:os.platform(),cpu:os.cpus()[0]?.model,ram:os.totalmem(),node:process.version},
  model:{name:'whisper-tiny',dtype:'q8',revision:'ff4177021cc41f7db950912b73ea4fdf7d01d8e7',backend:'onnxruntime-node CPU'},
  coldInitMs,warmupCount:3,warmCount:timings.length,p95Ms:timings[Math.ceil(timings.length*.95)-1],
  cer:results.reduce((n,r)=>n+r.edits,0)/results.reduce((n,r)=>n+r.characters,0),
  memory:{processRssSnapshot:process.memoryUsage().rss,processMaxRssBytes:process.resourceUsage().maxRSS*1024},results};
await writeFile(new URL('../docs/m0-fleurs-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:results.length,coldInitMs,p95Ms:report.p95Ms,cer:report.cer,memory:report.memory}));
await asr.dispose();
