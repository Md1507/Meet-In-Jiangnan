import { env, pipeline } from '@huggingface/transformers';
import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
const corpus=JSON.parse(await readFile(new URL('../tests/fixtures/intent-water-heldout.json',import.meta.url),'utf8'));
if(corpus.positive.length!==30||corpus.negative.length!==30||new Set([...corpus.positive,...corpus.negative]).size!==60)throw Error('Expected 60 distinct labelled diagnostic sentences');
env.allowRemoteModels=false;env.allowLocalModels=true;env.localModelPath=fileURLToPath(new URL('../public/models/',import.meta.url));
const started=performance.now();
const model=await pipeline('text-generation','Qwen3-0.6B-ONNX',{dtype:'q4f16',device:'cpu'});
const coldInitMs=Math.round(performance.now()-started),results=[];
for(const [expected,texts] of [[true,corpus.positive],[false,corpus.negative]])for(const text of texts){
  const start=performance.now();
  const result=await model([
    {role:'system',content:'Return only JSON with intent and slots. For ordering one hot water use {"intent":"order_water","slots":{"amount":1,"drink":"water","temperature":"hot"}}. Otherwise use {"intent":"unknown","slots":{}}. /no_think'},
    {role:'user',content:text}
  ],{max_new_tokens:64,do_sample:false,return_full_text:false,tokenizer_encode_kwargs:{enable_thinking:false}});
  const generated=result[0]?.generated_text;
  const output=typeof generated==='string'?generated:String(generated?.at(-1)?.content??'');
  let value;try{value=JSON.parse(output);}catch{}
  const accepted=!!value&&Object.keys(value).sort().join(',')==='intent,slots'&&value.intent==='order_water'&&!!value.slots&&
    Object.keys(value.slots).sort().join(',')==='amount,drink,temperature'&&value.slots.amount===1&&value.slots.drink==='water'&&value.slots.temperature==='hot';
  results.push({text,expected,accepted,output,inferenceMs:Math.round(performance.now()-start)});
  console.log(`${results.length}/60 ${expected===accepted?'correct':'WRONG'} ${results.at(-1).inferenceMs}ms`);
}
const truePositive=results.filter(r=>r.expected&&r.accepted).length,falsePositive=results.filter(r=>!r.expected&&r.accepted).length;
const timings=results.slice(3).map(r=>r.inferenceMs).sort((a,b)=>a-b);
const report={createdAt:new Date().toISOString(),annotationStatus:corpus.annotationStatus,
  limitations:['Labels have not been human-reviewed','Node CPU, not browser/reference machine','One scenario, not 12-scene evaluation','Measures raw Qwen schema output; game additionally applies deterministic guard'],
  cpu:os.cpus()[0]?.model,ram:os.totalmem(),node:process.version,
  model:{name:'Qwen3-0.6B-ONNX',revision:'79346d370dfae34801d26993fda9ae2372900fd0',dtype:'q4f16',backend:'onnxruntime-node CPU'},
  generation:{max_new_tokens:64,enable_thinking:false},coldInitMs,truePositive,falsePositive,correct:truePositive+30-falsePositive,
  diagnosticThresholdPassed:truePositive>=27&&falsePositive<=2&&truePositive+30-falsePositive>=54,
  p95Ms:timings[Math.ceil(timings.length*.95)-1],memory:process.memoryUsage(),results};
await writeFile(new URL('../docs/m0-intent-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({truePositive,falsePositive,correct:report.correct,p95Ms:report.p95Ms,diagnosticThresholdPassed:report.diagnosticThresholdPassed}));
await model.dispose();
