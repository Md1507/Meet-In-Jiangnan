import {createServer} from 'node:https';
import {readFileSync,writeFileSync,statSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ico':'image/x-icon','.otf':'font/otf','.wav':'audio/wav','.wasm':'application/wasm','.txt':'text/plain; charset=utf-8'};
export function resolveOpenSSL({environment=process.env,platform=process.platform,exists=existsSync}={}) {
  if(environment.BINT_OPENSSL){
    if(!exists(environment.BINT_OPENSSL))throw Error('BINT_OPENSSL không tồn tại: '+environment.BINT_OPENSSL);
    return environment.BINT_OPENSSL;
  }
  const windows=platform==='win32',paths=windows?path.win32:path.posix;
  const searchPath=Object.entries(environment).find(([key])=>key.toLowerCase()==='path')?.[1]??'';
  const candidates=searchPath.split(windows?';':':').filter(Boolean).map(dir=>paths.join(dir.replace(/^"|"$/g,''),windows?'openssl.exe':'openssl'));
  // Git Bash supplies these directories; ordinary PowerShell often does not.
  if(windows)for(const base of [environment.ProgramFiles,environment['ProgramFiles(x86)'],environment.LOCALAPPDATA&&paths.join(environment.LOCALAPPDATA,'Programs')].filter(Boolean))
    for(const bin of ['mingw64/bin','mingw32/bin','usr/bin'])candidates.push(paths.join(base,'Git',bin,'openssl.exe'));
  const executable=candidates.find(exists);
  if(!executable)throw Error('Không tìm thấy OpenSSL trong PATH hoặc Git for Windows; đặt BINT_OPENSSL tới openssl.exe có sẵn.');
  return executable;
}
export function createLocalCertificate(directory,{executable=resolveOpenSSL(),run=spawnSync}={}) {
  const key=path.join(directory,'key.pem'),cert=path.join(directory,'cert.pem');
  const config=path.join(directory,'openssl.cnf');writeFileSync(config,'[req]\ndistinguished_name=dn\n[dn]\n');
  const result=run(executable,['req','-x509','-newkey','rsa:2048','-nodes','-config',config,'-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{encoding:'utf8',windowsHide:true,env:{...process.env,OPENSSL_CONF:config}});
  if(result.error||result.status!==0)throw Error(`Không tạo được chứng thư HTTPS bằng ${executable}: ${result.error?.message||result.stderr?.trim()||'exit '+result.status}`);
  return {key,cert};
}
export async function serveBuilt(port=4189,{fixtures={}}={}){
  const interruptions=new Map();
  const directory=mkdtempSync(path.join(tmpdir(),'jiangnan-local-https-'));
  const cleanup=()=>{const resolved=path.resolve(directory);if(path.dirname(resolved)!==path.resolve(tmpdir())||!path.basename(resolved).startsWith('jiangnan-local-https-'))throw Error('Unexpected cleanup');rmSync(resolved,{recursive:true,force:true});};
  let key,cert;
  try{({key,cert}=createLocalCertificate(directory));}catch(error){cleanup();throw error;}
  const server=createServer({key:readFileSync(key),cert:readFileSync(cert)},(request,response)=>{
    try{
      const url=new URL(request.url,'https://localhost');
      if(Object.hasOwn(fixtures,url.pathname)){const f=fixtures[url.pathname];response.setHeader('Content-Type',f.type??'text/plain');response.setHeader('Cross-Origin-Resource-Policy','same-origin');response.end(f.body);return;}
      if(!['GET','HEAD'].includes(request.method)||(url.search && !(['/', '/legacy-spike/index.html'].includes(url.pathname) && url.search==='?spike')))throw Error('Only static GET/HEAD');
      const base=path.resolve('dist'),dest=path.resolve(base,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)),relative=path.relative(base,dest);
      if(relative.startsWith('..')||path.isAbsolute(relative)||!statSync(dest).isFile())throw Error('Not found');
      response.setHeader('Content-Type',types[path.extname(dest)]??'application/octet-stream');
      response.setHeader('Cross-Origin-Opener-Policy','same-origin');response.setHeader('Cross-Origin-Embedder-Policy','require-corp');
      // ORT reads verified local WASM via a blob URL made by the production worker.
      // Permit that local in-memory transport, without permitting remote origins.
      response.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' blob: 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:; connect-src 'self' blob:; media-src 'self' blob:");
      response.setHeader('Cache-Control','no-cache');
      const interruption=interruptions.get(url.pathname);
      if(interruption&&request.method==='GET'){
        const bytes=readFileSync(dest),chunk=bytes.subarray(0,Math.min(65536,bytes.length-1));
        if(!chunk.length)throw Error('Asset too small for partial download');
        const event={path:url.pathname,expectedBytes:bytes.length,flushedBytes:0,connectionDestroyed:false};interruption.events.push(event);
        response.setHeader('Content-Length',bytes.length);response.flushHeaders();
        // write callback proves a body chunk was flushed before disconnecting.
        // https://nodejs.org/api/http.html#responsewritechunk-encoding-callback
        response.write(chunk,error=>{if(error){event.error=String(error);return;}event.flushedBytes=chunk.length;setTimeout(()=>{event.connectionDestroyed=true;response.destroy();},200);});return;
      }
      response.end(request.method==='HEAD'?undefined:readFileSync(dest));
    }catch{response.writeHead(404);response.end('Static asset not found');}
  });
  try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});}catch(error){cleanup();throw error;}
  return {url:`https://127.0.0.1:${server.address().port}`,interruptDownload:pathname=>{const injection={events:[],remove:()=>interruptions.delete(pathname)};interruptions.set(pathname,injection);return injection;},close:async()=>{await new Promise(resolve=>server.close(resolve));cleanup();}};
}
