import {launchLoggedBrowser} from './browser-logging.mjs';
import { chromium } from 'playwright';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {readChapterState} from './chapter-state-observer.mjs';
import {captureRequests} from './acceptance-evidence.mjs';
import {serveBuilt} from './serve-built.mjs';
import {buildDiagnostic,finishSnapshot} from './diagnostic-build.mjs';

// Interactive diagnostic: the operator supplies all IME and microphone input.
const args = process.argv.slice(2);
function option(name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw Error(`Missing value for ${name}`);
  return args[i + 1];
}
const mode = option('--mode', 'chapter');
if (!['chapter', 'spike'].includes(mode)) throw Error('Use --mode chapter|spike');
if(args.includes('--url')) throw Error('External servers are not accepted: this runner builds and serves the current worktree itself');
const sourceDir = path.resolve(option('--source-dir', process.cwd()));
if(sourceDir!==path.resolve(process.cwd())) throw Error('source-dir must be the current worktree');
const snapshot=await buildDiagnostic({legacySpike:mode==='spike'}),revision=snapshot.revision;
const server=await serveBuilt();
const url = new URL(server.url + (mode === 'spike' ? '/legacy-spike/index.html?spike' : '/'));
if (url.searchParams.has('spike') !== (mode === 'spike')) throw Error('URL spike query must match --mode');
if (!['http:', 'https:'].includes(url.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw Error('The URL must be a local HTTP(S) server');
const browserName = option('--browser', 'chrome');
if (!['chrome', 'edge'].includes(browserName)) throw Error('Use --browser chrome|edge');
const outputDir = path.resolve(option('--output-dir', path.join(os.tmpdir(), 'game-manual-device-evidence')));
const started = new Date(), id = randomUUID();
const file = path.join(outputDir, `${started.toISOString().replace(/[:.]/g, '-')}-${id}.json`);
const report = { id, startedAt: started.toISOString(), status: 'running', kind: 'manual-device-acceptance', mode, url: url.href, browserRequested: browserName, sourceDir, sourceHashes: {}, setup: mode === 'chapter' ? 'Automated movement, E and topic selection; not human input evidence.' : 'Synthetic IndexedDB position and automated E; not human input evidence.', limitations: ['Fresh temporary browser context; no simulated IME, microphone, model or GPU', 'Text and recording metadata are saved; audio bytes are not saved separately', 'Source directory is operator-declared and must correspond to the server snapshot', 'Playback requires human confirmation; events alone do not prove audible sound'], network: [], events: [] };
report.revision=revision; report.build={...snapshot,server:'owned static HTTPS dist'};report.command=process.argv;
report.setupOnly=args.includes('--setup-only');
report.limitations=report.limitations.filter(x=>!x.startsWith('Source directory is operator-declared'));
const hash = file => new Promise((resolve, reject) => { const h = createHash('sha256'), s = createReadStream(file); s.on('data', x => h.update(x)); s.on('error', reject); s.on('end', () => resolve(h.digest('hex'))); });
for (const f of ['src/main.ts', 'src/audio/recorder.ts', 'src/audio/pcm.ts', 'src/ai/model.worker.ts', 'src/ai/ModelManager.ts', 'src/ai/model-manifest.json']) report.sourceHashes[f] = await hash(path.join(sourceDir, f));
await mkdir(outputDir, { recursive: true });
await writeFile(file, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
let writing = Promise.resolve();
function flush() { const body = JSON.stringify(report, null, 2) + '\n'; writing = writing.then(() => writeFile(file, body)); return writing; }
let browser, context, page, timer, interval, endSession, capture;
const ended = new Promise(resolve => { endSession = resolve; });
const onSignal = () => endSession('SIGINT');
process.once('SIGINT', onSignal);
try {
  browser = await launchLoggedBrowser(chromium,{ channel: browserName === 'edge' ? 'msedge' : 'chrome', headless: report.setupOnly, args:['--ignore-certificate-errors'], ignoreDefaultArgs: ['--enable-unsafe-swiftshader'] });
  report.browserLogs=browser.diagnosticLogs;report.browserLog=browser.diagnosticLogs.file;report.browserVersion = browser.version();
  context = await browser.newContext({ serviceWorkers: 'allow',ignoreHTTPSErrors:true });
  capture = captureRequests(context); report.network = capture.requests; report.captureErrors = capture.errors;
  report.limitations.push('Network capture does not prove service worker or worker coverage');
  await context.route('**/*', async route => {
    const req = route.request(), target = new URL(req.url());
    const allowed = target.origin === url.origin && ['GET', 'HEAD'].includes(req.method());
    report.events.push({type:'route-decision',at:new Date().toISOString(),url:req.url(),method:req.method(),allowed});
    if (!allowed) return route.abort();
    if (target.pathname === '/__manual_acceptance_seed__') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Local setup</title>' });
    return route.continue();
  });
  // This page exists solely to initialize an isolated profile before the app starts.
  const seed = await context.newPage();
  await seed.goto(new URL('/__manual_acceptance_seed__', url).href);
  if (mode === 'spike') await seed.evaluate(() => new Promise((resolve, reject) => {
    const r = indexedDB.open('jiangnan-m1', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('save');
    r.onerror = () => reject(r.error);
    r.onsuccess = () => { const db = r.result, tx = db.transaction('save', 'readwrite'); tx.objectStore('save').put({ x: 220, y: 230, rewarded: false, hint: 0, writing: 0, journal: [] }, 'current'); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); };
  }));
  await seed.close();
  await context.exposeBinding('__manualEvidence', (_source, event) => { if(event.type==='chapter-state') {report.chapterSnapshot=event.snapshot;if(event.snapshot?.status==='snapshot')report.chapterState=event.value;} else {if(event.type==='chapter-state-error')report.chapterSnapshot={status:'error',error:event.error};report.events.push(event);} });
  await context.addInitScript('window.__readChapterState = '+readChapterState.toString());
  await context.addInitScript(({mode}) => {
    const emit = (type, data = {}) => { void window.__manualEvidence({ at: new Date().toISOString(), type, ...data }).catch(() => {}); };
    const state = () => ({ value: document.querySelector(mode==='chapter'?'#chapter-answer':'#answer')?.value ?? null, feedback: document.querySelector(mode==='chapter'?'#chapter-feedback':'#feedback')?.textContent ?? null, status: document.querySelector(mode==='chapter'?'#chapter-status':'#status')?.textContent ?? null, modelStatus: document.querySelector(mode==='chapter'?'#chapter-ai-status':'#model-status')?.textContent ?? null, focus: document.activeElement?.id || document.activeElement?.tagName || null, dialogOpen: !!document.querySelector(mode==='chapter'?'#chapter-dialog[open]':'#dialog:not([hidden])'), playbackVisible: !!document.querySelector(mode==='chapter'?'#chapter-playback:not([hidden])':'#playback:not([hidden])') });
    for (const type of ['compositionstart', 'compositionupdate', 'compositionend', 'keydown', 'beforeinput', 'input', 'focusin', 'click']) document.addEventListener(type, event => {
      if (!event.isTrusted) return;
      const target = event.target;
      emit(type, { trusted: event.isTrusted, target: target?.id || target?.tagName, key: event.key, inputType: event.inputType, data: event.data, isComposing: event.isComposing, ...state() });
      setTimeout(() => emit('after-' + type, state()), 0);
    }, true);
    for (const type of ['play', 'playing', 'pause', 'ended', 'error', 'loadedmetadata']) document.addEventListener(type, event => { if (event.target?.id === (mode==='chapter'?'chapter-playback':'playback')) emit('playback-' + type, { trusted: event.isTrusted, duration: Number.isFinite(event.target.duration) ? event.target.duration : null, ...state() }); }, true);
    const Original = window.MediaRecorder;
    if (Original) window.MediaRecorder = new Proxy(Original, { construct(target, args, newTarget) {
      const recorder = Reflect.construct(target, args, newTarget), stream = args[0];
      const tracks = () => stream.getTracks().map(t => { const s = t.getSettings(); return { kind: t.kind, readyState: t.readyState, enabled: t.enabled, muted: t.muted, settings: { sampleRate: s.sampleRate, channelCount: s.channelCount, sampleSize: s.sampleSize, echoCancellation: s.echoCancellation, noiseSuppression: s.noiseSuppression, autoGainControl: s.autoGainControl } }; });
      for (const name of ['start', 'dataavailable', 'stop', 'error']) recorder.addEventListener(name, e => { emit('recorder-' + name, { mime: recorder.mimeType, bytes: e.data?.size, blobType: e.data?.type, recorderState: recorder.state, tracks: tracks(), ...state() }); if (name === 'stop') setTimeout(() => emit('tracks-after-stop', { tracks: tracks(), ...state() }), 200); });
      return recorder;
    } });
    const proto = window.AudioContext?.prototype;
    if (proto) { const original = proto.decodeAudioData; proto.decodeAudioData = function (...args) { emit('decode-start', { bytes: args[0]?.byteLength, ...state() }); const result = original.apply(this, args); result.then(buffer => emit('decode-result', { sampleRate: buffer.sampleRate, channels: buffer.numberOfChannels, duration: buffer.duration, ...state() }), error => emit('decode-error', { error: String(error), ...state() })); return result; }; }
    let previous = '';
    setInterval(() => { const current = state(), json = JSON.stringify(current); if (json !== previous) { previous = json; emit('ui-state', current); } }, 250);
    if(mode==='chapter') setInterval(()=>{void window.__readChapterState().then(snapshot=>emit('chapter-state',{value:snapshot.value,snapshot})).catch(error=>emit('chapter-state-error',{error:String(error)}));},500);
  }, {mode});
  page = await context.newPage();
  page.on('pageerror', error => report.events.push({ at: new Date().toISOString(), type: 'pageerror', error: String(error) }));
  page.on('close', () => endSession('browser-page-closed'));
  browser.on('disconnected', () => endSession('browser-disconnected'));
  await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (mode === 'chapter') {
    await page.locator('#chapter-canvas canvas').waitFor({ timeout: 30000 });
    await page.locator('#chapter-canvas canvas').focus();
    await page.keyboard.down('a'); await page.waitForTimeout(650); await page.keyboard.up('a');
    await page.keyboard.press('e');
    await page.locator('#chapter-topics button').first().click();
    await page.locator('#chapter-dialog[open] #chapter-answer').waitFor({ timeout: 10000 });
  } else {
    await page.locator('#scene canvas').waitFor({ timeout: 30000 });
    await page.locator('#scene canvas').focus();
    await page.keyboard.press('e');
    await page.locator('#dialog:not([hidden]) #answer').waitFor({ timeout: 10000 });
  }
  report.readyAt = new Date().toISOString();
  await flush();
  console.log(`READY ${url.href}\nEvidence: ${file}\nNavigation and selection are synthetic setup. User controls IME and Record; audio recording bytes are not saved separately. Network traces may contain sensitive payloads.`);
  interval = setInterval(() => { void flush().catch(error => { report.error = String(error); endSession('write-error'); }); }, 2000);
  timer = setTimeout(() => endSession('20-minute-limit'), 20 * 60 * 1000);
  if(report.setupOnly){await page.waitForTimeout(750);await page.close();}
  report.endReason = await ended;
} catch (error) {
  report.error = String(error); report.endReason = 'error'; process.exitCode = 1;
} finally {
  clearInterval(interval); clearTimeout(timer); process.removeListener('SIGINT', onSignal);
  if (mode === 'chapter' && page && !page.isClosed()) {
    try { const snapshot=await page.evaluate(readChapterState);report.chapterSnapshot=snapshot;if(snapshot.status==='snapshot')report.chapterState=snapshot.value; } catch(error) { report.chapterStateError=String(error); }
  }
  await context?.close().catch(() => {}); await capture?.flush(); await browser?.close().catch(() => {});
  try {report.sourceCheck=finishSnapshot(snapshot);report.finalRevision=report.sourceCheck.finalRevision;if(!report.sourceCheck.stable){report.error='Source/build changed during session';process.exitCode=1;}} catch(error){report.error=String(error);process.exitCode=1;}
  await server.close();
  report.provenanceStatus=mode==='chapter'&&(!report.chapterState||report.chapterStateError||report.chapterSnapshot?.status!=='snapshot')?'incomplete':'snapshot-observed';
  report.provenanceLimitation='Last successfully observed readonly snapshot; closing a browser can lose writes after that timestamp. Trusted keyboard events alone do not identify real OS IME input.';
  report.status = 'ended'; report.endedAt = new Date().toISOString();
  await flush(); console.log(`Evidence saved: ${file}`);
}
