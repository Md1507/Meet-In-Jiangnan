import { env, pipeline } from '@huggingface/transformers';
import { performance } from 'node:perf_hooks';
import os from 'node:os';
env.allowRemoteModels=false;env.allowLocalModels=true;env.localModelPath=new URL('../public/models/',import.meta.url).pathname.replace(/^\/(?:([A-Za-z]):)/,'$1:');
console.log(JSON.stringify({platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0]?.model,ram:os.totalmem(),node:process.version,backend:'onnxruntime-node CPU',model:'Qwen3-0.6B-ONNX',revision:'79346d370dfae34801d26993fda9ae2372900fd0',dtype:'q4f16'}));
const start=performance.now();
try {const model=await pipeline('text-generation','Qwen3-0.6B-ONNX',{dtype:'q4f16',device:'cpu'});console.log(`load_ms=${Math.round(performance.now()-start)}`);const input='Say hello.';const t=performance.now();const result=await model(input,{max_new_tokens:8,do_sample:false,return_full_text:false});console.log(JSON.stringify({input,result,inference_ms:Math.round(performance.now()-t),memory:process.memoryUsage()}));}catch(error){console.error('Real model attempt failed:',error);process.exitCode=1;}
