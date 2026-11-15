import {launchLoggedBrowser} from './browser-logging.mjs';
import {buildDiagnostic,finishSnapshot} from './diagnostic-build.mjs';
import {runFaults,runOfflineQuest} from './diagnostic-faults.mjs';
import {chromium,firefox,webkit} from 'playwright';
import {writeFileSync,mkdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {serveBuilt} from './serve-built.mjs';
import {validateCapturedNetwork} from './mvp-evidence.mjs';
import {captureRequests} from './acceptance-evidence.mjs';
import {measureChapterFrames} from './chapter-frames.mjs';
const outputIndex=process.argv.indexOf('--output-dir');
if(outputIndex>=0&&(!process.argv[outputIndex+1]||process.argv[outputIndex+1].startsWith('--')))throw Error('Missing --output-dir');
const outputDir=path.resolve(outputIndex>=0?process.argv[outputIndex+1]:'docs/evidence/task-01M7C38XW37C4G9BP5073EG01M');
const snapshot=await buildDiagnostic(); const server=await serveBuilt(0),framesMode=process.argv.includes('--fps'),cross=process.argv.includes('--cross-browser');
const report={schemaVersion:1,kind:'chapter-built-diagnostic',command:process.argv,revision:snapshot.revision,snapshot,recordedAt:new Date().toISOString(),origin:server.url,machine:{cpu:os.cpus()[0]?.model,ramGiB:os.totalmem()/1024**3,os:os.platform()+' '+os.release()},limitations:['Self-signed local HTTPS test, not public deployment','Automated browser, no physical microphone/OS IME','Language/audio human review pending','Not a complete referenceMachine gate or real-AI quality benchmark'],runs:[]};
if(process.platform==='win32'){try{report.machine.gpuDrivers=JSON.parse(execFileSync('powershell',['-NoProfile','-Command','Get-CimInstance Win32_VideoController -ErrorAction Stop | Select-Object Name,DriverVersion | ConvertTo-Json -Compress'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}catch(error){report.machine.gpuDriversUnavailable=String(error);report.limitations.push('GPU driver metadata unavailable');}}
try{
  for(const [name,type] of cross?[['chromium',chromium],['firefox',firefox],['webkit',webkit]]:[['chromium',chromium]]){
    let browser;
    const run={browser:name,requests:[],errors:[]};report.runs.push(run);
    try{
      const args=name==='chromium'?['--ignore-certificate-errors','--enable-gpu','--use-angle=d3d11']:[];
      browser=await launchLoggedBrowser(type,{headless:true,args});run.browserLogs=browser.diagnosticLogs;run.browserLog=browser.diagnosticLogs.file;run.browserVersion=browser.version();run.launchArgs=browser.diagnosticLaunchOptions.args;
      const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1280,height:720}}),page=await context.newPage();
      const capture=captureRequests(context);run.requests=capture.requests;run.captureErrors=capture.errors;run.flushCapture=()=>capture.flush();
      run.captureLimitations=['Context request events do not establish service worker coverage'];
      page.on('pageerror',e=>run.errors.push(String(e)));
      page.on('console',m=>{if(m.type()==='error')run.errors.push(m.text());});
      await page.goto(server.url);await page.waitForSelector('#chapter-canvas canvas');await page.waitForTimeout(1500);
      run.secureContext=await page.evaluate(()=>isSecureContext);
      await page.click('#chapter-map');run.map=await page.locator('#chapter-body').innerText();await page.click('#chapter-close');
      await page.click('#chapter-lessons');await page.getByRole('button',{name:'Tự giới thiệu',exact:false}).click();await page.locator('#chapter-answer').fill('我叫小雨。');await page.click('#chapter-send');await page.getByText('Câu đã vào sổ tay.',{exact:false}).waitFor();await page.click('#chapter-close');
      run.typedLesson=true;
      await page.click('#chapter-hanzi');await page.waitForSelector('#chapter-writer svg path',{state:'attached'});await page.click('#chapter-stroke');await page.click('#chapter-close');run.localHanzi=true;
      run.webgl=await page.evaluate(()=>{const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2');if(!gl)return null;const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?{vendor:gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),renderer:gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}:{renderer:gl.getParameter(gl.RENDERER)};});
      if(framesMode&&name==='chromium'){
        run.frames=await measureChapterFrames(page);run.frameMs=run.frames.frameMs;run.medianFps=run.frames.medianFps;run.durationMs=run.frames.durationMs;run.workload=run.frames.workloadBinding;
        run.limitations=['No concurrent inference in this chapter-only run; use bench-browser-ai --fps for inference overlap'];
      }
      if(name==='chromium'){
        run.offline=await runOfflineQuest(page,context);run.offlineLesson=run.offline.offlineLesson;run.offlineQuest=run.offline.offlineQuest;
      }
      if(process.argv.includes('--faults')&&name==='chromium'){run.executedFaults=await runFaults(browser,server.url,'/'+snapshot.worker.path.slice(5),{context,page,server});if(run.executedFaults.some(x=>['failed','inconclusive'].includes(x.status)))process.exitCode=1;}
      run.passed=run.secureContext&&run.typedLesson&&run.localHanzi&&!run.errors.length&&(name!=='chromium'||run.offlineQuest)&&(!framesMode||name!=='chromium'||run.frames?.status==='measured'&&run.medianFps>=50)&&!run.executedFaults?.some(x=>['failed','inconclusive'].includes(x.status));
      if(!run.passed)process.exitCode=1;
      console.log(JSON.stringify({browser:name,passed:run.passed,offline:run.offlineLesson,medianFps:run.medianFps,errors:run.errors}));
    }catch(error){run.error=String(error);process.exitCode=1;console.log(name+': '+error);}
    finally{await browser?.close();await run.flushCapture?.();delete run.flushCapture;run.privacy={status:'incomplete',exercised:['text','strokes'],errors:validateCapturedNetwork(process.cwd(),server.url,['text','strokes'],{requests:run.requests,errors:run.captureErrors??['capture unavailable']}),limitations:['Audio, ASR, LLM and service-worker request coverage not established']};
      run.faultMatrix=['six-region-art','hanzi-pinyin-1280x720','hanzi-pinyin-1920x1080','save-import-export','corrupt-save-rollback','offline-quest','gpu-device-lost','wasm-unavailable','download-interrupted','cache-quota','model-hash-mismatch','firefox-text-smoke','safari-text-smoke','shader-f16','mic-denied','mic-unplugged','unsupported-codec'].map(id=>id==='offline-quest'&&run.offlineQuest?{id,status:'passed',executionKind:'automated-browser-offline',trigger:'Playwright context offline after cache',expected:'quest progresses offline',actual:'quest progresses offline',limitations:'Synthetic input, not physical device'}:run.executedFaults?.find(x=>x.id===id)??{id,status:'not-run',executionKind:'not-run',reason:process.argv.includes('--faults')?'Browser failed before fault runner':'Enable --faults for browser injections; physical cases require an operator'});
    }
  }
}finally{
  report.faultMatrix=structuredClone(report.runs.find(x=>x.browser==='chromium')?.faultMatrix??[]);
  const firefoxRun=report.runs.find(x=>x.browser==='firefox'),firefoxCase=report.faultMatrix.find(x=>x.id==='firefox-text-smoke');
  if(firefoxRun&&firefoxCase)Object.assign(firefoxCase,{status:firefoxRun.passed?'passed':'failed',executionKind:'automated-browser',trigger:'Launch installed Firefox and navigate HTTPS chapter',expected:'Typed lesson and local Hanzi render',actual:firefoxRun.error??{typedLesson:firefoxRun.typedLesson,localHanzi:firefoxRun.localHanzi},reason:undefined});
  report.sourceCheck=finishSnapshot(snapshot);if(!report.sourceCheck.stable)process.exitCode=1;report.exitCode=process.exitCode??0;
  try{mkdirSync(outputDir,{recursive:true});const file=path.join(outputDir,`${report.recordedAt.replace(/[:.]/g,'-')}-${randomUUID()}.json`);writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(`Evidence: ${file}`);}finally{await server.close();}
}
