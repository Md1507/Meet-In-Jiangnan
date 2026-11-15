import { env, pipeline } from '@huggingface/transformers';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = fileURLToPath(new URL('../public/models/', import.meta.url));
console.log(JSON.stringify({platform:os.platform(), cpu:os.cpus()[0]?.model, ram:os.totalmem(), node:process.version, backend:'onnxruntime-node CPU', model:'whisper-tiny', revision:'ff4177021cc41f7db950912b73ea4fdf7d01d8e7', dtype:'q8'}));
const start=performance.now();
try {
  const asr=await pipeline('automatic-speech-recognition','whisper-tiny',{device:'cpu',dtype:'q8'});
  const load_ms=Math.round(performance.now()-start), input=new Float32Array(16000);
  const t=performance.now();
  const result=await asr(input,{language:'chinese',task:'transcribe',max_new_tokens:16});
  console.log(JSON.stringify({input:'one second synthetic silence; not speech or accuracy evidence',load_ms,result,inference_ms:Math.round(performance.now()-t),memory:process.memoryUsage()}));
} catch(error) { console.error('Real model attempt failed:',error); process.exitCode=1; }
