import {spawnSync} from 'node:child_process';
export function run(command,args,options={}) {
  const result=spawnSync(command,args,{stdio:'inherit',...options,shell:process.platform==='win32' && command.toLowerCase().endsWith('npm.cmd')});
  return {status:result.status??1,error:result.error};
}
