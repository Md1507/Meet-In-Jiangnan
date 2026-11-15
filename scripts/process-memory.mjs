import {spawn} from 'node:child_process';
import path from 'node:path';
export function summarizeMemory(report) {
  const valid=s=>Array.isArray(s.expectedPids)&&s.expectedPids.length>0&&new Set(s.expectedPids).size===s.expectedPids.length&&
    s.expectedPids.includes(report.rootPid)&&Array.isArray(s.processes)&&s.processes.length===s.expectedPids.length&&
    new Set(s.processes.map(p=>p.pid)).size===s.expectedPids.length&&s.processes.every(p=>s.expectedPids.includes(p.pid)&&Number.isSafeInteger(p.rssBytes)&&p.rssBytes>0)&&
    !s.errors?.length&&Number.isSafeInteger(s.rssBytes)&&s.rssBytes===s.processes.reduce((n,p)=>n+p.rssBytes,0);
  const complete=report.samples.filter(valid);
  report.partialSamples=report.samples.length-complete.length;
  report.validSamples=complete.length;
  report.baselineBytes=report.samples.length&&valid(report.samples[0])?report.samples[0].rssBytes:null;
  report.peakBytes=complete.length?Math.max(...complete.map(s=>s.rssBytes)):null;
  report.status=complete.length&&!report.partialSamples&&!report.errors.length?'measured':'incomplete';
  return report;
}
export async function sampleMemory(pid) {
  const deps=process.env.BINT_REFERENCE_PYTHON_DEPS??path.resolve('../../downloads/01M7A5E5VAK7KM5VWYPMF6T3GC/reference/python-deps');
  const report={status:'starting',rootPid:pid,counter:'psutil memory_info().rss',unit:'bytes',intervalMs:100,method:'Sum browser root and recursive children at each sample; peak of sums',limitations:['RSS can double count shared pages','Sampled peak can miss spikes','GPU process host RSS included; dedicated GPU VRAM excluded'],samples:[],errors:[]};
  const executable=process.env.BINT_REFERENCE_PYTHON??(process.platform==='win32'?path.join(process.env.LOCALAPPDATA,'Programs/Python/Python312/python.exe'):'python3');
  report.executable=executable;report.dependencies=deps;
  const child=spawn(executable,['scripts/sample-process-memory.py',String(pid),deps],{windowsHide:true});
  let pending=''; child.stdout.on('data',data=>{pending+=data;let end;while((end=pending.indexOf('\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+1);try{const sample=JSON.parse(line);if(sample.error)report.errors.push(sample.error);else report.samples.push(sample);}catch(e){report.errors.push(String(e));}}});
  child.stderr.on('data',b=>report.errors.push(String(b)));child.on('error',e=>report.errors.push(String(e)));
  let stopping=false;
  const closed=new Promise(resolve=>child.on('close',(code,signal)=>{report.samplerExit={code,signal,requestedStop:stopping};if(!stopping)report.errors.push('Sampler exited before stop: '+code+'/'+signal);resolve();}));
  await new Promise(resolve=>setTimeout(resolve,300));
  return {report,async stop(){stopping=true;child.kill();await closed;return summarizeMemory(report);}};
}
