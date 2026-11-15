import {chromium,firefox,webkit} from 'playwright';
import {createInterface} from 'node:readline';

// Invoked only by browser-logging.mjs in a fresh external working directory.
const input=createInterface({input:process.stdin});let server,config;
let stopped=false;
const close=async()=>{stopped=true;await server?.close();};
input.once('close',()=>void close());
input.once('line',async line=>{
 try{
  config=JSON.parse(line);const type={chromium,firefox,webkit}[config.type];
  if(!type)throw Error('Unsupported browser type');
  server=await type.launchServer(config.options);
  // launchServer consumes process output internally. Retain subsequent raw
  // native stderr too. Startup/other helper messages may use the retained
  // native file or cwd/debug.log; the caller records these separate sources.
  server.process().stderr?.on('data',bytes=>process.stderr.write(bytes));
  if(stopped){await close();return;}
  process.stdout.write(JSON.stringify({endpoint:server.wsEndpoint(),pid:server.process().pid})+'\n');
 }catch(e){process.stdout.write(JSON.stringify({error:String(e)})+'\n');input.close();process.exitCode=1;}
});
