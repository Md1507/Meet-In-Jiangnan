import {createHash} from 'node:crypto';
import {readFileSync,realpathSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mvpRevision, validateCapturedNetwork} from './mvp-evidence.mjs';
import {captureRequests} from './acceptance-evidence.mjs';
import {faultTarget, runFaults} from './diagnostic-faults.mjs';
import {prepareKit, validateKit} from './prepare-mvp-review.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const routes = ['audio','text','strokes','asr','llm'];
// Route evidence is supplied by the caller, never inferred from an attempt.
export function privacyAssessment(root, origin, coverage, capture) {
  const exercised = routes.filter(id => coverage?.[id]?.attempted === true && coverage[id].exercised === true);
  let errors;
  try { errors = validateCapturedNetwork(root, origin, exercised, capture); }
  catch (e) { errors = [String(e)]; }
  const missing = routes.filter(id => !exercised.includes(id));
  // The legacy validator demands complete coverage; evaluate security separately
  // with a complete route list so missing coverage cannot conceal a leak.
  let security;
  try { security = validateCapturedNetwork(root, origin, routes, capture); }
  catch (e) { security = [String(e)]; }
  return {status: security.length ? 'rejected' : missing.length ? 'pending' : 'prepared', attempted:routes.filter(id => coverage?.[id]?.attempted === true), exercised, missing, errors, security};
}
export function faultAssessment(rows = []) {
  return ['gpu-device-lost','wasm-unavailable','download-interrupted','model-hash-mismatch','runtime-hash-mismatch','wasm-hash-mismatch'].map(id => {
    const row = rows.find(x => x.id === id);
    if (!row) return {id,status:'not-run',reason:'No current-snapshot result'};
    // Existing diagnostic rows do not prove progress preservation across fault contexts.
    if (row.status === 'passed' && !(row.injection && row.observedError && row.recovery && row.progressPreserved === true))
      return {id,status:'inconclusive',reason:'Missing injection, observed error, recovery or preserved progress evidence',source:row};
    return {id,status:row.status === 'passed' ? 'passed' : ['failed','not-run','inconclusive'].includes(row.status) ? row.status : 'inconclusive',source:row};
  });
}
// Read existing reports without changing their bytes or assigning them this revision.
export function evidenceInventory(root, refs, current) {
  return refs.map(ref => {
    const entry={path:ref.path,expectedSha256:ref.sha256??null};
    try {
      const base=realpathSync(root),dest=path.resolve(base,ref.path),relative=path.relative(base,dest);
      if(!relative||relative.startsWith('..')||path.isAbsolute(relative))throw Error('Artifact must be inside repository');
      const resolved=realpathSync(dest),resolvedRelative=path.relative(base,resolved);
      if(!resolvedRelative||resolvedRelative.startsWith('..')||path.isAbsolute(resolvedRelative))throw Error('Artifact resolves outside repository');
      const bytes=readFileSync(resolved),r=JSON.parse(bytes);
      Object.assign(entry,{sha256:sha(bytes),bytes:bytes.length,revision:r.revision??r.buildSourceRevision??r.snapshot?.revision??null,sourceCommit:r.snapshot?.head??r.sourceCommit??null,manifestSha256:r.snapshot?.manifestSha256??r.hashes?.['src/ai/model-manifest.json']??null,command:r.command??null,machine:r.machine??null,browser:r.browser??r.runs?.map(x=>({name:x.browser,version:x.browserVersion}))??null,recordedAt:r.createdAt??r.recordedAt??null});
      entry.issues=[];
      if(ref.sha256&&entry.sha256!==ref.sha256)entry.issues.push('artifact hash mismatch');
      // An outer label must never conceal an older nested build/manifest.
      entry.bindings={revision:{revision:r.revision,buildSourceRevision:r.buildSourceRevision,'snapshot.revision':r.snapshot?.revision},sourceCommit:{sourceCommit:r.sourceCommit,head:r.head,'snapshot.head':r.snapshot?.head,'snapshot.sourceCommit':r.snapshot?.sourceCommit},manifestSha256:{manifestSha256:r.manifestSha256,'snapshot.manifestSha256':r.snapshot?.manifestSha256,'hashes.manifest':r.hashes?.['src/ai/model-manifest.json']}};
      const expected={revision:current.revision,sourceCommit:current.head,manifestSha256:current.manifestSha256};
      for(const [key,aliases] of Object.entries(entry.bindings)){
        const present=Object.entries(aliases).filter(([,value])=>value!==undefined&&value!==null);
        if(present.some(([,value])=>typeof value!=='string'||!value.trim()))entry.issues.push(`invalid ${key} metadata`);
        if(new Set(present.map(([,value])=>value)).size>1)entry.issues.push(`conflicting ${key} metadata`);
        if(expected[key]&&present.some(([,value])=>value!==expected[key]))entry.issues.push(`${key} differs from current snapshot`);
      }
      entry.sourceCommit??=r.head??r.snapshot?.sourceCommit??null;
      entry.manifestSha256??=r.manifestSha256??null;
      entry.status=entry.issues.length?'stale':!current.revision||!current.head||!current.manifestSha256||!entry.revision||!entry.sourceCommit||!entry.manifestSha256||!entry.command||!entry.machine||!entry.browser||!entry.recordedAt?'pending':'current';
      entry.provenance='Metadata read from artifact; current means binding only, not acceptance';
    } catch(e) {entry.status=e.code==='ENOENT'?'missing':'invalid';entry.error=e.message;}
    return entry;
  });
}
export function preflight(root = process.cwd()) {
  const checks = [], pending = [];
  const files = ['scripts/mvp-evidence.mjs','scripts/prepare-mvp-review.mjs','scripts/acceptance-evidence.mjs','scripts/diagnostic-faults.mjs','scripts/bench-chapter.mjs','scripts/bench-browser-ai.mjs','scripts/chapter-frames.mjs','scripts/serve-built.mjs','scripts/verify-m4-technical-prep.mjs','docs/review-kit/README.md','src/ai/model-manifest.json'];
  const hashes = {};
  for (const name of files) {
    try { const bytes=readFileSync(path.join(root,name)); hashes[name]=sha(bytes); if (/^(?:<{7}|={7}|>{7})(?:\s|$)/m.test(bytes.toString('utf8'))) checks.push(`conflict marker: ${name}`); }
    catch(e) { checks.push(`${name}: ${e.message}`); }
  }
  let head = null;
  try { head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(); } catch(e) { checks.push(`git revision: ${e.message}`); }
  let revision = null;
  try { revision=mvpRevision(root); } catch(e) { pending.push(`build/source revision unavailable: ${e.message}`); }
  try {
    const text=readFileSync(path.join(root,'scripts/mvp-evidence.mjs'),'utf8');
    for(const [key,value] of Object.entries({textTruePositive:24,textFalsePositive:3,textTotal:51,audioPositive:16,audioNegative:2,warmups:2,samples:12,asrP95Ms:18000,llmP95Ms:14000}))
      if(!new RegExp(`\\b${key}\\s*:\\s*${value}\\s*[,}]`).test(text)) checks.push(`smoke threshold mismatch: ${key}`);
  } catch(e) { checks.push(`smoke thresholds: ${e.message}`); }
  if (![validateCapturedNetwork,captureRequests,faultTarget,runFaults,prepareKit,validateKit].every(x=>typeof x==='function')) checks.push('runner exports incompatible');
  pending.push('HTTPS five-route exercise, service worker coverage, fault recovery and offline/save checks require an authorized current-snapshot run');
  const gates=JSON.parse(readFileSync(path.join(root,'docs/mvp-gates.json')));
  const inventory=evidenceInventory(root,Object.values(gates).filter(x=>x?.evidence).map(x=>({path:x.evidence})),{revision,head,manifestSha256:hashes['src/ai/model-manifest.json']});
  return {schemaVersion:1,kind:'m4-technical-preparation',scope:'Technical preparation only; not verify:mvp or MVP acceptance',status:checks.length?'blocked':'pending',sourceCommit:head,buildSourceRevision:revision,hashes,inventory,checks,pending,recordedAt:new Date().toISOString()};
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  // Build once inside the authorized entrypoint; no model inference or benchmark.
  const build=[];
  for(const args of [['node_modules/vite/bin/vite.js','build'],['scripts/build-offline.mjs']]) {
    const result=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:16*1024*1024,windowsHide:true});
    build.push({command:[process.execPath,...args],exitCode:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?.message});
    if(result.status!==0) {console.log(JSON.stringify({kind:'m4-technical-preparation',status:'blocked',build,pending:['Build failed; regression tests not started. Not MVP acceptance.']},null,2));process.exit(1);}
  }
  const report=preflight();
  report.build=build;
  const files=['tests/m4-technical-prep.test.mjs','tests/mvp-evidence.test.mjs','tests/acceptance-runners.test.mjs','tests/game-dev-spawn.test.mjs'];
  const test=spawnSync(process.execPath,['--test','--test-concurrency=1',...files],{encoding:'utf8',maxBuffer:16*1024*1024,windowsHide:true});
  report.contractTests={files,exitCode:test.status,stdout:test.stdout,stderr:test.stderr,error:test.error?.message};
  if(test.status!==0) {report.status='blocked';report.checks.push('technical preparation regression tests failed');}
  try {if(mvpRevision(process.cwd())!==report.buildSourceRevision) {report.status='blocked';report.checks.push('Build/source changed during regression tests');}} catch(e) {report.status='blocked';report.checks.push(String(e));}
  console.log(JSON.stringify(report,null,2));
  if(report.status==='blocked') process.exitCode=1;
}
