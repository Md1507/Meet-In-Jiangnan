
// Data readiness is separate from inference quality and human/reference approval.
import {readFileSync,writeFileSync,mkdirSync,realpathSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mvpRevision} from './mvp-evidence.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const nonempty=x=>typeof x==='string'&&!!x.trim();
const norm=x=>typeof x==='string'?x.replace(/[\s\p{P}]/gu,''):'';
export function wavDuration(b){
  if(b.length<44||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE'||b.readUInt32LE(4)+8!==b.length)throw Error('invalid RIFF/WAV length');
  let rate,bytes,fmt;
  for(let o=12;o+8<=b.length;){const tag=b.toString('ascii',o,o+4),n=b.readUInt32LE(o+4);if(o+8+n>b.length)throw Error('truncated WAV');if(tag==='fmt '&&n>=16){const channels=b.readUInt16LE(o+10),hz=b.readUInt32LE(o+12),align=b.readUInt16LE(o+20),bits=b.readUInt16LE(o+22);fmt=b.readUInt16LE(o+8);rate=b.readUInt32LE(o+16);if(![1,3].includes(fmt)||!channels||!hz||!bits||align!==channels*bits/8||rate!==hz*align)throw Error('invalid PCM format');}if(tag==='data'){if(bytes!==undefined)throw Error('duplicate data');bytes=n;}o+=8+n+(n%2);}
  if(!rate||!bytes)throw Error('missing fmt/data');return bytes/rate;
}
export function validateKit(dir,{root=process.cwd(),revision=mvpRevision(root)}={}){
  dir=realpathSync(dir);const issues=[];
  const read=name=>{try{const value=JSON.parse(readFileSync(path.join(dir,name),'utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error('JSON object required');return value;}catch(e){issues.push(`${name}: ${e.message}`);return {};}};
  const file=(name,expected)=>{if(!nonempty(name)||path.isAbsolute(name))throw Error('relative file required');const dest=realpathSync(path.resolve(dir,name)),rel=path.relative(dir,dest);if(!rel||rel.startsWith('..')||path.isAbsolute(rel))throw Error('path escapes kit');const b=readFileSync(dest);if(hash(b)!==expected)throw Error('hash mismatch');return b;};
  const contentBytes=readFileSync(path.join(root,'src/content/mvp.json')),content=JSON.parse(contentBytes),binding=read('binding.json');
  if(binding.content?.sha256!==hash(contentBytes)||binding.revision!==revision)issues.push('binding: content/build revision differs');
  const review=read('content-review.pending.json'),audio=read('audio-collection.pending.json'),text=read('text-corpus.pending.json'),outputs=read('model-outputs.pending.json');
  for(const [name,doc] of [['review',review],['audio',audio],['text',text],['outputs',outputs]])if(doc.revision!==revision)issues.push(`${name}: snapshot differs`);
  const unique=(xs,count,label)=>{const rows=Array.isArray(xs)?xs.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)):[];if(rows.length!==count||rows.some(x=>!nonempty(x.id))||new Set(rows.map(x=>x.id)).size!==count)issues.push(`${label}: ${count} unique IDs required`);return rows;};
  const scenarios=new Set(content.scenarios.map(s=>s.id));
  const texts=unique(text.texts,60,'texts');
  const examples=new Set([...content.utterances.map(u=>norm(u.text)),...content.scenarios.flatMap(s=>[...s.positive,...s.negative]).map(norm),...(Array.isArray(text.promptExamples)?text.promptExamples:[]).filter(nonempty).map(norm)]);
  if(!Array.isArray(text.promptExamples))issues.push('texts: promptExamples declaration required');
  if(text.independence?.kind!=='heldout'||!nonempty(text.independence?.source)||!nonempty(text.independence?.reviewer))issues.push('texts: independence provenance required');
  for(const x of texts){
    if(!nonempty(x.text)||typeof x.expected!=='boolean'||!scenarios.has(x.scenario)||examples.has(norm(x.text??'')))issues.push(`${x.id}: invalid or non-independent text/scenario/label`);
    if(!nonempty(x.rights)||!nonempty(x.labelReviewer))issues.push(`${x.id}: text rights/label reviewer missing`);
  }
  if(new Set(texts.map(x=>norm(x.text??''))).size!==60||texts.filter(x=>x.expected===true).length!==30||texts.filter(x=>x.expected===false).length!==30)issues.push('texts: unique 30 positive/30 negative required');
  const samples=unique(audio.samples,40,'audio');
  for(const [g,n] of [['positive',24],['wrong-intent',8],['silence-noise',8]])if(samples.filter(x=>x.group===g).length!==n)issues.push(`audio: ${g} requires ${n}`);
  if(new Set(samples.filter(x=>x.group==='positive'&&nonempty(x.speakerId)).map(x=>x.speakerId)).size<6)issues.push('audio: six positive speakers required');
  if(new Set(samples.map(x=>x.file)).size!==40||new Set(samples.map(x=>x.sha256)).size!==40)issues.push('audio: duplicate recording file/hash');
  for(const s of samples){
    if(!scenarios.has(s.scenario)||!['positive','wrong-intent','silence-noise'].includes(s.group)||s.expectedAccepted!==(s.group==='positive'))issues.push(`${s.id}: scenario/group/expectedAccepted invalid`);
    if(!nonempty(s.rights)||!nonempty(s.labelReviewer)||!nonempty(s.provenance?.source)||s.provenance?.kind!=='real-recording'||!nonempty(s.speakerId)||(s.group!=='silence-noise'&&!nonempty(s.reference)))issues.push(`${s.id}: rights/reviewer/speaker/transcript/real recording provenance missing`);
    if(/\b(?:fleurs|tts|text[- ]to[- ]speech|espeak(?:-ng)?)\b/i.test([s.provenance?.source,s.file,s.rights].filter(x=>typeof x==='string').join(' ')))issues.push(`${s.id}: TTS/FLEURS is not an acceptance recording`);
    try{const seconds=wavDuration(file(s.file,s.sha256));if(seconds<3||seconds>8||!Number.isFinite(s.seconds)||Math.abs(seconds-s.seconds)>.01)throw Error('duration outside 3–8s or mismatches metadata');}catch(e){issues.push(`${s.id}: ${e.message}`);}
  }
  const utterances=unique(review.utterances,content.utterances.length,'utterances');
  for(const u of content.utterances){const r=utterances.find(x=>x.id===u.id);if(!r||['text','pinyin','meaningVi','context'].some(k=>r[k]!==u[k])||r.audio?.sha256!==u.audio.sha256||!['pending','approved','rejected'].includes(r.verdict))issues.push(`${u.id}: review worksheet differs from content`);}
  const out=unique(outputs.modelOutputs,30,'outputs');
  for(const o of out){if(!nonempty(o.input)||!nonempty(o.output)||!scenarios.has(o.scenario)||!['pending','appropriate','inappropriate'].includes(o.verdict)||o.provenance?.execution!=='browser-worker-real-model'||o.provenance?.revision!==revision)issues.push(`${o.id}: real output/provenance missing`);try{const raw=JSON.parse(file(o.provenance?.file,o.provenance?.sha256));const row=raw.results?.find(x=>x.id===o.id);if(raw.revision!==revision||row?.input!==o.input||row?.output!==o.output)throw Error('output not bound to recorded result');}catch(e){issues.push(`${o.id}: ${e.message}`);}}
  const humanApproved=review.reviewer?.kind==='human'&&nonempty(review.reviewer?.name)&&nonempty(review.reviewer?.qualification)&&utterances.every(x=>x.verdict==='approved'&&nonempty(x.notes))&&out.every(x=>['appropriate','inappropriate'].includes(x.verdict)&&nonempty(x.notes));
  return {kind:'review-kit-readiness',ready:issues.length===0,dataReady:issues.length===0,issues,revision,contentSha256:hash(contentBytes),datasetSha256:hash(Buffer.from(JSON.stringify({text,audio}))),humanApproval:humanApproved?'recorded-not-gate-validated':'pending',quality:'not-evaluated; run unchanged MVP quality/CER gates',legacyGateApproved:false};
}
export function prepareKit(outputDir,{root=process.cwd(),revision=mvpRevision(root)}={}){
  mkdirSync(outputDir,{recursive:false});const bytes=readFileSync(path.join(root,'src/content/mvp.json')),c=JSON.parse(bytes);
  const write=(name,data)=>writeFileSync(path.join(outputDir,name),JSON.stringify({revision,...data},null,2)+'\n',{flag:'wx'});
  write('binding.json',{createdAt:new Date().toISOString(),content:{path:'src/content/mvp.json',sha256:hash(bytes)}});
  write('content-review.pending.json',{reviewer:{kind:'human',name:'',qualification:''},utterances:c.utterances.map(u=>({...u,verdict:'pending',notes:''}))});
  write('text-corpus.pending.json',{independence:{kind:'heldout',source:'',reviewer:''},promptExamples:[],texts:Array.from({length:60},(_,i)=>({id:`text-${i+1}`,scenario:c.scenarios[i%c.scenarios.length].id,text:'',expected:i<30,rights:'',labelReviewer:''}))});
  write('audio-collection.pending.json',{samples:Array.from({length:40},(_,i)=>({id:`recording-${i+1}`,group:i<24?'positive':i<32?'wrong-intent':'silence-noise',scenario:c.scenarios[i%c.scenarios.length].id,speakerId:'',file:'',sha256:'',seconds:null,reference:'',expectedAccepted:i<24,rights:'',labelReviewer:'',provenance:{kind:'real-recording',source:''}}))});
  write('model-outputs.pending.json',{modelOutputs:Array.from({length:30},(_,i)=>({id:`output-${i+1}`,scenario:c.scenarios[i%c.scenarios.length].id,input:'',output:'',verdict:'pending',notes:'',provenance:{execution:'browser-worker-real-model',revision,file:'',sha256:''}}))});
  write('manual-devices.pending.json',{status:'not-tested',operator:'',buildRevision:'',browserVersion:'',os:'',ime:'',microphone:'',saveFixture:'',cases:['ime-candidate-enter','mic-record-playback','mic-denied','mic-unplugged','unsupported-codec'].map(id=>({id,status:'pending',expected:'',actual:'',evidence:''}))});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=process.argv.slice(2),index=args.indexOf('--output-dir');if(index>=0&&(!args[index+1]||args[index+1].startsWith('--')))throw Error('Missing --output-dir');
  if(args.includes('--validate')){const i=args.indexOf('--validate'),dir=path.resolve(args[i+1]??'docs/review-kit'),report=validateKit(dir);if(index>=0){mkdirSync(args[index+1],{recursive:true});writeFileSync(path.join(args[index+1],`readiness-${randomUUID()}.json`),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}console.log(JSON.stringify(report,null,2));if(!report.ready)process.exitCode=1;}
  else{const dir=path.resolve(index>=0?args[index+1]:`docs/review-kit/session-${Date.now()}-${randomUUID()}`);prepareKit(dir);console.log(`Prepared pending worksheets: ${dir}. No approval or quality gate asserted.`);}
}

