import {run} from './game-dev-spawn.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync,existsSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='docs/playtest/01M7AWMZ6C065JP5EHAZABVRFS',runId=randomUUID(),records=[];
const sha=data=>createHash('sha256').update(data).digest('hex');
function walk(dir){if(!existsSync(dir))return [];if(statSync(dir).isFile())return [dir];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
function hashes(paths){return Object.fromEntries(paths.flatMap(walk).sort().map(p=>[p,sha(readFileSync(p))]));}
const npm=process.platform==='win32'?'npm.cmd':'npm';
const steps=[[process.execPath,['tests/game-dev-spawn.test.mjs']],[npm,['run','typecheck']],[npm,['run','build']],[npm,['run','test:content']],[process.execPath,['--experimental-strip-types','tests/chapter.test.ts']],[process.execPath,['--experimental-strip-types','scripts/game-dev-fixtures.mjs']],[process.execPath,['--experimental-strip-types','tests/game-dev-content.test.mjs']],[process.execPath,['tests/game-dev-flow.mjs']]];
process.env.GAME_DEV_RUN_ID=runId;
console.log(`Game-dev runId ${runId}`);
let code=0;
for(const [command,args] of steps){console.log(`\n> ${command} ${args.join(' ')}`);const result=run(command,args);records.push({command,args,exitCode:result.status,error:result.error?.message});if(result.status!==0){code=result.status;break;}}
const source=hashes(['src/chapter','src/content','src/main.ts','public/art','public/audio','public/licenses','scripts/game-dev-verify.mjs','scripts/game-dev-spawn.mjs','scripts/game-dev-fixtures.mjs','tests/game-dev-content.test.mjs','tests/game-dev-flow.mjs','tests/game-dev-spawn.test.mjs','tests/chapter.test.ts','scripts/check-content.mjs','package.json','package-lock.json']);
const build=hashes(['dist']),fixtures=hashes([`${dir}/saves`]),evidence=hashes([`${dir}/evidence/${runId}`]);
const git=args=>{try{return execFileSync('git',args,{encoding:'utf8'}).trim();}catch{return 'unavailable';}};
const manifest={runId,createdAt:new Date().toISOString(),head:git(['rev-parse','HEAD']),branch:git(['branch','--show-current']),dirty:git(['status','--short']),sourceDigest:sha(JSON.stringify(source)),source,buildDigest:sha(JSON.stringify(build)),build,fixtures,evidence,records,exitCode:code,limitations:'Automated browser checks do not establish OS IME, real microphone, language review, user playtest or source MVP acceptance.'};
writeFileSync(`${dir}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(`Manifest ${dir}/manifest.json; exit ${code}. Real IME/mic, language review and human playtest remain pending.`);process.exitCode=code;
