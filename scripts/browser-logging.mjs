import {mkdirSync,writeFileSync,createWriteStream,readFileSync,readdirSync,existsSync} from 'node:fs';
import {finished} from 'node:stream/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Native Chromium may append debug.log even without --enable-logging.
// Supply a per-launch absolute destination outside the checkout; retain logs.
function newLog(label) {
  const directory=path.join(tmpdir(),'jiangnan-browser-logs');
  mkdirSync(directory,{recursive:true});
  const file=path.join(directory,`${label.replace(/[^a-z0-9_-]/gi,'_')}-${Date.now()}-${randomUUID()}.log`);
  writeFileSync(file,'',{flag:'wx'});
  return file;
}

export function browserLogging(label='browser',environment=process.env) {
  const file=newLog(label);
  // Explicitly enable native stderr, which the host forwards without replacing
  // messages. Windows helpers may also use CHROME_LOG_FILE or cwd/debug.log;
  // those are additional retained sources, never the reported primary sink.
  return {file,args:['--enable-logging=stderr','--log-level=0'],env:{...environment,CHROME_LOG_FILE:file+'.native.log'}};
}

export function readNativeLogs(logs) {
  const files=[logs.file,...(logs.nativeFile&&existsSync(logs.nativeFile)?[logs.nativeFile]:[]),...readdirSync(logs.nativeFallbackDirectory).filter(name=>name.endsWith('.log')).map(name=>path.join(logs.nativeFallbackDirectory,name))];
  return [...new Set(files)].map(file=>readFileSync(file,'utf8')).join('\n');
}

// Observe the actual native message while the browser is alive, rather than
// assuming that a navigation rejection means an asynchronous logger flushed.
export async function waitForNativeLog(logs,pattern,{timeoutMs=10000}={}) {
  const deadline=Date.now()+timeoutMs;
  do {
    const retained=readNativeLogs(logs);
    if(new RegExp(pattern.source,pattern.flags).test(retained))return retained;
    if(Date.now()>=deadline)throw Error(`Native log not observed within ${timeoutMs}ms: ${logs.file}; ${logs.stderr}`);
    await delay(25);
  }while(true);
}

// Isolate native helpers too: some Windows Chromium children still use a
// cwd-relative debug.log despite the launch environment and --log-file.
// Only the browser host changes cwd; builds and callers remain in the checkout.
export async function launchLoggedServer(type,options={}) {
  // Configuration belongs to this launch boundary. Reject conflicting caller
  // flags instead of silently selecting one of several destinations.
  if((options.args??[]).some(arg=>/^--(?:enable-logging|disable-logging|log-file|log-level)(?:=|$)/.test(arg)))throw Error('Browser logging flags are managed by launchLoggedServer');
  const {env,...safeOptions}=options;
  const log=browserLogging(type.name(),{...process.env,...env}),directory=path.join(path.dirname(log.file),path.basename(log.file,'.log'));
  mkdirSync(directory);
  const launchOptions={...safeOptions,args:[...(safeOptions.args??[]),...(type.name()==='chromium'?log.args:[])]};
  // Retain stderr independently of the structured stdout protocol and wait for
  // its writable stream to finish before close() makes logs available to read.
  const stderr=log.file,stream=createWriteStream(stderr,{flags:'a'});
  const stderrFinished=finished(stream);stderrFinished.catch(()=>{});
  const child=spawn(process.execPath,[fileURLToPath(new URL('./browser-host.mjs',import.meta.url))],{
    cwd:directory,env:log.env,windowsHide:true,stdio:['pipe','pipe','pipe']
  });
  child.stderr.pipe(stream);
  let buffered='',ready=false;
  const closed=new Promise(resolve=>child.once('close',resolve));
  const endpoint=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{child.kill();reject(Error('Browser host launch timed out; '+stderr));},60000);
    const failed=e=>{clearTimeout(timer);reject(e);};child.once('error',failed);
    child.once('close',code=>{if(!ready)failed(Error('Browser host exited '+code+'; '+stderr));});
    child.stdout.on('data',bytes=>{
      buffered+=bytes;let newline;
      while((newline=buffered.indexOf('\n'))>=0){const line=buffered.slice(0,newline);buffered=buffered.slice(newline+1);
        try{const value=JSON.parse(line);if(value.error){failed(Error(value.error));child.stdin.end();}else if(value.endpoint){ready=true;clearTimeout(timer);resolve(value);}}
        catch(e){failed(Error('Invalid browser host protocol: '+String(e)));child.kill();}
      }
    });
    child.stdin.on('error',failed);
    child.stdin.write(JSON.stringify({type:type.name(),options:launchOptions})+'\n');
  });
  const logs={file:stderr,nativeFile:type.name()==='chromium'?log.env.CHROME_LOG_FILE:null,nativeFallbackDirectory:directory,stderr,collectionState:'running'};
  return {launchOptions,logs,wsEndpoint:()=>endpoint.endpoint,process:()=>({pid:endpoint.pid}),async close(){child.stdin.end();await closed;await stderrFinished;logs.collectionState='closed';}};
}

export async function launchLoggedBrowser(type,options={}) {
  const server=await launchLoggedServer(type,options);
  try{
    const browser=await type.connect(server.wsEndpoint()),close=browser.close.bind(browser);
    browser.close=async()=>{try{await close();}finally{await server.close();}};
    browser.diagnosticLogs=server.logs;
    browser.diagnosticLaunchOptions=server.launchOptions;
    return browser;
  }catch(e){await server.close();throw e;}
}
