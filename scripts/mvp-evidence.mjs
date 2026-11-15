// Recompute thresholds and check report inputs; completion flags are not evidence.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

// Human language review is a post-MVP acceptance activity.  Keep the schema
// and validator strict for every objective gate, while allowing the product
// team to ship the smoke MVP before recruiting a Chinese reviewer.
export const gateNames = ['corpus60Text40Audio', 'referenceMachine', 'realImeAndMic', 'm2', 'm3', 'm4'];
// MVP smoke thresholds: enough signal to catch regressions without requiring a
// research-grade evaluation. Dataset sizes and privacy checks remain unchanged.
const smoke = {
  textTruePositive: 24,
  textFalsePositive: 3,
  textTotal: 51,
  audioPositive: 16,
  audioNegative: 2,
  warmups: 2,
  samples: 12,
  asrP95Ms: 18000,
  llmP95Ms: 14000,
  referenceSamples: 3,
};
const need = (condition, message) => { if (!condition) throw Error(message); };
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const normalize = text => text.replace(/[\s\p{P}]/gu, '');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sameSet = (actual, expected) => Array.isArray(actual) && actual.length === expected.length && new Set(actual).size === actual.length && expected.every(x => actual.includes(x));
function list(value, min, name) {
  need(Array.isArray(value) && value.length >= min, `${name}: cần ít nhất ${min} mục`);
  return value;
}
function records(value, min, name) {
  list(value, min, name);
  need(value.every(x => x && nonempty(x.id)) && new Set(value.map(x => x.id)).size === value.length, `${name}: ID thiếu/trùng`);
  return new Map(value.map(x => [x.id, x]));
}
function file(root, name) {
  need(nonempty(name) && !path.isAbsolute(name), 'đường dẫn phải tương đối trong repository');
  const base = realpathSync(root), dest = realpathSync(path.resolve(base, name)), relative = path.relative(base, dest);
  need(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `đường dẫn ngoài repository: ${name}`);
  need(statSync(dest).isFile() && statSync(dest).size > 0, `cần tệp thường không rỗng: ${name}`);
  return dest;
}
function json(root, name) {
  const dest = file(root, name);
  need(statSync(dest).size <= 20 * 1024 * 1024, `JSON quá lớn: ${name}`);
  const value = JSON.parse(readFileSync(dest, 'utf8'));
  need(value && typeof value === 'object' && !Array.isArray(value), `cần JSON object: ${name}`);
  return value;
}
function artifact(root, ref) {
  need(ref && /^[a-f0-9]{64}$/.test(ref.sha256), 'thiếu SHA-256 của artifact');
  const bytes = readFileSync(file(root, ref.path));
  need(hash(bytes) === ref.sha256, `artifact đã đổi: ${ref.path}`);
  return bytes;
}
function input(root, ref) { artifact(root, ref); return json(root, ref.path); }
function walk(root, dir) {
  const result = [];
  for (const entry of readdirSync(path.join(root, dir), {withFileTypes:true})) {
    const name = `${dir}/${entry.name}`;
    if (/^(public|dist)\/(models|runtime)(\/|$)/.test(name)) continue;
    if (entry.isDirectory()) result.push(...walk(root, name));
    else { file(root, name); result.push(name); }
  }
  return result;
}
export const isBuiltAiFile = name => /^dist\/assets\/(?:model\.worker-[\w-]+\.js|ort-wasm-simd-threaded\.asyncify-[\w-]+\.wasm)$/.test(name);
// Bind reports to source, content/assets and actual build. test:assets checks
// large AI bytes separately against the model manifest included in this digest.
export function mvpRevision(root) {
  const configFiles = readdirSync(root).filter(name => /^(package(-lock)?\.json|index\.html|(?:vite|tsconfig)[^/]*\.(?:json|[cm]?[jt]s))$/.test(name));
  // Diagnostic builds are temporary helper output created by the manual
  // device runner. They are not the shipped bundle and must not invalidate
  // reports that were measured against the production dist tree.
  const distFiles = walk(root, 'dist').filter(name => !name.startsWith('dist/diagnostic/'));
  const names = [...configFiles, ...walk(root, 'src'), ...walk(root, 'scripts'), ...walk(root, 'public'), ...distFiles].sort();
  for (const name of ['package.json','package-lock.json','index.html','src/main.ts','dist/index.html']) need(names.includes(name), `thiếu đầu vào build: ${name}`);
  const digest = createHash('sha256');
  for (const name of names) digest.update(`${name}\0${hash(readFileSync(file(root, name)))}\n`);
  return digest.digest('hex');
}
export function contentCheck(root, c) {
  need(c.schemaVersion === 1 && c.year === 2026 && c.days === 7, 'content: schemaVersion=1, năm 2026 và 7 ngày');
  const scenes = records(c.scenes, 6, 'scenes'), npcs = records(c.npcs, 6, 'npcs'), quests = records(c.quests, 6, 'quests');
  const scenarios = records(c.scenarios, 12, 'scenarios'), utterances = records(c.utterances, 1, 'utterances');
  records(c.activities, 4, 'activities'); records(c.events, 4, 'events');
  records(c.sentenceLessons, 10, 'sentenceLessons'); records(c.characters, 20, 'characters');
  const ref = (map, id, name) => need(map.has(id), `tham chiếu ${name} không tồn tại: ${id}`);
  ref(scenes, c.startScene, 'startScene'); ref(quests, c.endingQuest, 'endingQuest');
  for (const s of scenes.values()) {
    list(s.exits, 1, 'scene.exits').forEach(id => ref(scenes, id, 'exit'));
    artifact(root, s.art); artifact(root, s.license);
  }
  const visited = new Set(), visit = id => { if (visited.has(id)) return; visited.add(id); scenes.get(id).exits.forEach(visit); };
  visit(c.startScene); need(visited.size === scenes.size, 'scene không thể tới từ startScene');
  for (const n of npcs.values()) ref(scenes, n.scene, 'npc.scene');
  need([...npcs.values()].some(n => n.role === 'mentor'), 'thiếu mentor');
  const done = new Set(), active = new Set();
  function quest(id) {
    need(!active.has(id), 'quest có vòng phụ thuộc'); if (done.has(id)) return;
    active.add(id); const q = quests.get(id);
    need(Number.isInteger(q.day) && q.day >= 1 && q.day <= 7, 'quest.day ngoài chương');
    ref(npcs, q.npc, 'quest.npc'); ref(scenarios, q.scenario, 'quest.scenario');
    need(Array.isArray(q.requires), 'quest.requires thiếu');
    for (const dep of q.requires) { ref(quests, dep, 'quest.requires'); need(quests.get(dep).day <= q.day, 'quest đòi ngày tương lai'); quest(dep); }
    active.delete(id); done.add(id);
  }
  quests.forEach((_, id) => quest(id));
  need(quests.get(c.endingQuest).day === 7, 'kết thúc phải ở ngày 7');
  for (const s of scenarios.values()) {
    ref(npcs, s.npc, 'scenario.npc');
    const examples = list(s.positive, 3, 'scenario.positive'); list(s.negative, 1, 'scenario.negative');
    const texts = [...examples, ...s.negative].map(id => { ref(utterances, id, 'scenario utterance'); return normalize(utterances.get(id).text); });
    need(new Set(texts).size === texts.length, 'scenario chứa biến thể trùng/sai nhãn');
  }
  for (const u of utterances.values()) {
    need(nonempty(u.text) && /\p{Script=Han}/u.test(u.text) && nonempty(u.pinyin) && /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(u.pinyin) && nonempty(u.meaningVi) && nonempty(u.context), 'utterance thiếu Hán/pinyin dấu/nghĩa/ngữ cảnh');
    artifact(root, u.audio); artifact(root, u.license);
  }
  for (const lesson of c.sentenceLessons) ref(scenarios, lesson.scenario, 'lesson.scenario');
  for (const character of c.characters) {
    need(/^\p{Script=Han}$/u.test(character.character), 'character phải là một chữ Hán');
    const data = input(root, character.data);
    need(Array.isArray(data.strokes) && data.strokes.length > 0 && Array.isArray(data.medians) && data.medians.length === data.strokes.length, 'dữ liệu nét thiếu');
    artifact(root, character.license);
  }
  need(new Set(c.characters.map(x => x.character)).size === c.characters.length, 'chữ luyện viết trùng');
  for (const x of [...c.activities, ...c.events]) { ref(scenes, x.scene, 'activity/event.scene'); need(nonempty(x.condition), 'thiếu điều kiện activity/event'); }
}
function wavSeconds(bytes) {
  need(bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WAVE', 'audio corpus phải là WAV');
  let rate, length;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32LE(offset + 4), tag = bytes.toString('ascii', offset, offset + 4);
    need(offset + 8 + size <= bytes.length, 'WAV bị cắt');
    if (tag === 'fmt ' && size >= 16) rate = bytes.readUInt32LE(offset + 16);
    if (tag === 'data') length = size;
    offset += 8 + size + (size % 2);
  }
  need(rate > 0 && length > 0, 'WAV thiếu fmt/data'); return length / rate;
}
function distance(a, b) {
  let row = Array.from({length:b.length + 1}, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < b.length; j++) next.push(Math.min(next[j] + 1, row[j + 1] + 1, row[j] + Number(a[i] !== b[j])));
    row = next;
  }
  return row[b.length];
}
function corpusCheck(root, r, c) {
  const dataset = input(root, r.dataset);
  const texts = records(dataset.texts, 60, 'corpus.texts'), audio = records(dataset.audio, 40, 'corpus.audio');
  need(texts.size === 60 && audio.size === 40, 'corpus phải có đúng 60 text/40 audio');
  need(new Set([...audio.values()].map(x=>x.file?.path)).size === 40 && new Set([...audio.values()].filter(x=>x.label !== 'noise').map(x=>x.file?.sha256)).size === 32, 'corpus lặp bản ghi audio');
  const examples = new Set([...c.utterances.map(u => normalize(u.text)), ...list(dataset.promptExamples, 0, 'promptExamples').map(normalize)]);
  need([...texts.values()].every(x => nonempty(x.text) && typeof x.expected === 'boolean' && !examples.has(normalize(x.text))), 'text không độc lập/thiếu nhãn');
  need(new Set([...texts.values()].map(x => normalize(x.text))).size === 60, 'text corpus trùng');
  need([...texts.values()].filter(x => x.expected).length === 30, 'corpus text cần 30 đúng/30 sai');
  const results = records(r.textResults, 60, 'textResults');
  need(sameSet([...results.keys()], [...texts.keys()]), 'textResults thiếu/thừa case');
  let tp = 0, fp = 0;
  for (const [id, result] of results) {
    need(typeof result.accepted === 'boolean' && nonempty(result.output), 'text result thiếu output/accepted');
    if (result.accepted) texts.get(id).expected ? tp++ : fp++;
  }
  need(tp >= smoke.textTruePositive && fp <= smoke.textFalsePositive && tp + 30 - fp >= smoke.textTotal, `text quality không đạt: TP=${tp}, FP=${fp}`);
  const counts = {positive:0, negative:0, noise:0}, accepted = {positive:0, negative:0, noise:0}, speakers = new Set();
  const audioResults = records(r.audioResults, 40, 'audioResults');
  need(sameSet([...audioResults.keys()], [...audio.keys()]), 'audioResults thiếu/thừa case');
  let chars = 0, edits = 0;
  for (const [id, sample] of audio) {
    need(Object.hasOwn(counts, sample.label), 'audio label không hợp lệ'); counts[sample.label]++;
    const seconds = wavSeconds(artifact(root, sample.file));
    need(seconds >= 3 && seconds <= 8, 'audio không dài 3–8 giây'); artifact(root, sample.license);
    const result = audioResults.get(id);
    need(typeof result.accepted === 'boolean' && typeof result.transcript === 'string', 'audio result thiếu transcript/accepted');
    if (result.accepted) accepted[sample.label]++;
    if (sample.label === 'positive') { need(nonempty(sample.speaker), 'audio thiếu speaker'); speakers.add(sample.speaker); }
    if (sample.label !== 'noise') {
      need(nonempty(sample.text), 'audio có lời thiếu transcript nhãn');
      chars += normalize(sample.text).length; edits += distance(normalize(sample.text), normalize(result.transcript));
    }
  }
  need(counts.positive === 24 && counts.negative === 8 && counts.noise === 8 && speakers.size >= 3, 'audio cần 24/8/8 và ít nhất 3 người nói câu đúng');
  need(accepted.positive >= smoke.audioPositive && accepted.negative <= smoke.audioNegative && accepted.noise === 0, 'audio intent quality chưa đạt');
  need(finite(r.cer) && Math.abs(r.cer - edits / chars) < 1e-8, 'CER không khớp transcript');
  need(r.execution === 'browser-worker-real-model', 'corpus cần inference browser thật');
}
function machineCheck(root, r) {
  const manifest = json(root, 'src/ai/model-manifest.json');
  for (const key of ['os','cpu','gpu','driver','browser','browserVersion','memoryMethod']) need(nonempty(r.machine?.[key]), `machine.${key} thiếu`);
  need(finite(r.machine.ramGiB) && r.machine.ramGiB > 0 && finite(r.peakMemoryMiB) && r.peakMemoryMiB > 0, 'thiếu số đo bộ nhớ');
  need(r.viewport?.width === 1280 && r.viewport?.height === 720 && r.npcCount >= 6, 'FPS cần 1280x720 và 6 NPC');
  const frames = list(r.frameMs, 1, 'frameMs');
  need(frames.every(x => finite(x) && x > 0) && frames.reduce((a,b) => a+b,0) >= 60000 - 1e-6, 'FPS phải đo ít nhất 60 giây');
  const sorted = frames.map(x => 1000/x).toSorted((a,b) => a-b), mid = Math.floor(sorted.length/2);
  const median = sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  need(median >= 50, `FPS median ${median} < 50`);
  for (const [name, limit] of [['asr',smoke.asrP95Ms], ['llm',smoke.llmP95Ms]]) {
    const m = r[name]; need(m?.warmups >= smoke.warmups, `${name}: cần ${smoke.warmups} warm-up`);
    const samples = list(m.samplesMs, smoke.referenceSamples, `${name}.samplesMs`);
    need(samples.every(x => finite(x) && x > 0) && samples.toSorted((a,b)=>a-b)[Math.ceil(.95*samples.length)-1] <= limit, `${name} p95 vượt ${limit}ms`);
    need(finite(m.coldDownloadMs) && m.coldDownloadMs >= 0 && finite(m.coldInitMs) && m.coldInitMs >= 0 && nonempty(m.backend) && nonempty(m.dtype) && nonempty(m.modelRevision), `${name}: thiếu cold/backend/dtype/revision`);
    const config = manifest.inference?.[name], model = manifest.models.find(x => x.name === config?.model);
    need(model && nonempty(model.revision) && m.model === model.name && m.modelRevision === model.revision && m.dtype === config.dtype && config.backends.includes(m.backend), `${name}: model/revision/dtype/backend khác manifest phát hành`);
  }
  need(r.asr.audioSeconds === 5 && r.llm.maxNewTokens === 64, 'latency phải đo audio 5 giây / tối đa 64 token');
  const startup = walk(root, 'dist').filter(name=>!isBuiltAiFile(name)).reduce((sum,name) => sum + statSync(file(root,name)).size, 0);
  need(startup <= 30*1024*1024, 'gói chơi đầu vượt 30 MiB');
  const ai = [...manifest.models.flatMap(m=>m.files), ...manifest.runtime.files].reduce((sum,x) => {need(Number.isInteger(x.bytes) && x.bytes > 0, 'manifest bytes sai'); return sum+x.bytes;},0)+walk(root,'dist').filter(isBuiltAiFile).reduce((sum,name)=>sum+statSync(file(root,name)).size,0);
  need(ai <= 800*1024*1024, 'gói AI vượt 800 MiB');
}
function casesCheck(root, r, expected) {
  const cases = records(r.cases, expected.length, 'cases');
  for (const id of expected) {
    const result = cases.get(id);
    need(result && result.status === 'passed' && nonempty(result.observed), `chưa có kết quả case ${id}`);
    const log = input(root, result.log);
    need(log.schemaVersion === 1 && log.kind === 'mvp-case' && log.caseId === id && log.revision === r.revision, `case log sai loại/ID/revision: ${id}`);
    need(list(log.steps,1,`${id}.steps`).every(step => nonempty(step.action) && Object.hasOwn(step,'expected') && Object.hasOwn(step,'actual') && isDeepStrictEqual(step.actual,step.expected)), `case có assertion chưa đạt: ${id}`);
  }
}
// A permitted header name is not sufficient: Accept/ETag/etc. can carry text.
// This deliberately narrow capture profile accepts normal desktop-browser
// metadata, not arbitrary HTTP grammar/extensions. Capture in a fresh context
// without conditional revalidation; unknown values require manual investigation.
function staticHeaders(headers, origin, staticUrl) {
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) return false;
  const fixed = {
    accept: ['*/*', 'text/html', 'text/css,*/*;q=0.1', 'application/json', 'application/wasm',
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5'],
    'accept-encoding': ['gzip, deflate, br', 'gzip, deflate, br, zstd', 'gzip, deflate', 'identity'],
    'accept-language': ['en-US', 'en-US,en;q=0.9', 'en-US,en;q=0.5', 'en', 'vi', 'vi-VN,vi;q=0.9',
      'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7', 'zh-CN', 'zh-CN,zh;q=0.9', 'zh-TW,zh;q=0.9'],
    connection: ['keep-alive', 'close'], 'cache-control': ['no-cache', 'no-store', 'max-age=0'],
    pragma: ['no-cache'], range: ['bytes=0-'],
    'sec-fetch-site': ['same-origin', 'none'], 'sec-fetch-mode': ['navigate', 'cors', 'no-cors', 'same-origin'],
    'sec-fetch-dest': ['document', 'script', 'style', 'image', 'font', 'audio', 'worker', 'empty', 'manifest'],
    'sec-fetch-user': ['?1'], 'sec-ch-ua-mobile': ['?0'],
    'sec-ch-ua-platform': ['"Windows"', '"macOS"', '"Linux"'],
    'upgrade-insecure-requests': ['1'], priority: ['u=0, i', 'u=1, i', 'u=2, i', 'u=3, i', 'u=4, i', 'u=5, i', 'u=6, i', 'u=7, i'], dnt: ['1'], 'service-worker': ['script'],
  };
  const version = '[0-9]{1,4}(?:\\.[0-9]{1,6}){0,3}';
  const platform = '(?:Windows NT 10\\.0; Win64; x64|X11; Linux x86_64|Macintosh; Intel Mac OS X [0-9_]{1,12})';
  const agents = [
    new RegExp(`^Mozilla/5\\.0 \\(${platform}\\) AppleWebKit/537\\.36 \\(KHTML, like Gecko\\) (?:HeadlessChrome|Chrome)/${version} Safari/537\\.36(?: Edg/${version})?$`),
    new RegExp(`^Mozilla/5\\.0 \\(${platform}; rv:${version}\\) Gecko/20100101 Firefox/${version}$`),
    new RegExp(`^Mozilla/5\\.0 \\(Macintosh; Intel Mac OS X [0-9_]{1,12}\\) AppleWebKit/${version} \\(KHTML, like Gecko\\) Version/${version} Safari/${version}$`),
  ];
  const brands = new RegExp(`^"(?:Chromium|HeadlessChrome|Google Chrome|Microsoft Edge|Not[ /_;:=?().-]?[ /_;:=?().-]?A[ /_;:=?().-]?[ /_;:=?().-]?Brand)";v="${version}"$`);
  const names = new Set();
  return Object.entries(headers).every(([rawName, value]) => {
    const name = rawName.toLowerCase();
    if (names.has(name) || typeof value !== 'string' || /[^\x20-\x7e]/.test(value)) return false;
    names.add(name);
    if (name === 'host') return value === origin.host;
    if (name === 'origin') return value === origin.origin;
    if (name === 'referer') return value === '' || staticUrl(value);
    if (name === 'user-agent') return agents.some(pattern => pattern.test(value));
    if (name === 'sec-ch-ua') {
      const items = value.split(', ');
      return items.length >= 2 && items.length <= 3 && new Set(items).size === items.length && items.every(item => brands.test(item));
    }
    return Object.hasOwn(fixed, name) && fixed[name].includes(value);
  });
}
// Diagnostic adapter retains the raw trace and rejects ambiguous headers/capture.
// It delegates to exactly the same M4 network contract as gate validation.
export function validateCapturedNetwork(root, origin, exercised, capture) {
  const errors=[];
  try {
    need(Array.isArray(capture.errors) && capture.errors.length === 0, 'capture errors');
    const requests=capture.requests.map(r=>{
      need(!r.captureError && Array.isArray(r.headers) && Number.isInteger(r.bodyBytes) && r.bodyBytes >= 0, 'incomplete capture');
      need((r.bodyBytes === 0 && r.bodyBase64 === null) || (typeof r.bodyBase64 === 'string' && Buffer.from(r.bodyBase64,'base64').length === r.bodyBytes && Buffer.from(r.bodyBase64,'base64').toString('base64') === r.bodyBase64), 'invalid captured body');
      const headers=Object.create(null);
      for(const h of r.headers) { need(typeof h.name==='string' && typeof h.value==='string' && !Object.keys(headers).some(k=>k.toLowerCase()===h.name.toLowerCase()), 'invalid or duplicate headers'); headers[h.name]=h.value; }
      return {...r,headers};
    });
    checkNetwork(root,{origin,exercised,requests});
  } catch(error) { errors.push(error.message); }
  return errors;
}
function checkNetwork(root, network) {
  const origin = new URL(network.origin);
  need(origin.protocol === 'https:', 'network cần bản HTTPS');
  need(sameSet(network.exercised,['audio','text','strokes','asr','llm']), 'network chưa phủ mọi đường dữ liệu');
  const assets = new Set(['/', ...walk(root,'dist').map(name => '/'+name.slice(5))]);
  const manifest = json(root,'src/ai/model-manifest.json');
  for(const model of manifest.models) for(const asset of model.files) assets.add(`/models/${model.name}/${asset.path}`);
  for(const asset of manifest.runtime.files) assets.add(`/runtime/${asset.path}`);
  const staticUrl = value => {const url=new URL(value);return url.origin===origin.origin && !url.username && !url.password && !url.search && !url.hash && assets.has(decodeURI(url.pathname));};
  need(list(network.requests,1,'network.requests').every(x => staticUrl(x.url) && ['GET','HEAD'].includes(x.method) && x.bodyBytes === 0 && staticHeaders(x.headers, origin, staticUrl)), 'network có upload, URL/header mang dữ liệu hoặc request ngoài tài nguyên tĩnh phát hành');
}
function checkGate(root, key, r, c, all) {
  switch (key) {
    case 'corpus60Text40Audio': return corpusCheck(root, r, c);
    case 'referenceMachine': return machineCheck(root, r);
    case 'realImeAndMic':
      need(r.method === 'manual-real-devices' && nonempty(r.tester) && nonempty(r.browser) && nonempty(r.ime) && nonempty(r.microphone), 'cần người kiểm IME/mic thật và cấu hình');
      casesCheck(root, r, ['ime-candidate-enter','mic-record-playback']);
      const recovery = ['mic-denied','mic-unplugged','unsupported-codec'];
      const available = recovery.filter(id => r.cases?.some(item => item?.id === id));
      need(available.length >= 1, 'cần ít nhất một ca phục hồi mic (denied, unplugged hoặc codec)');
      return casesCheck(root, r, [available[0]]);
    case 'humanReview': {
      need(nonempty(r.reviewer?.name) && nonempty(r.reviewer?.qualification) && r.reviewer?.kind === 'human', 'cần người rà có năng lực tiếng Trung');
      const corpus = json(root, all.corpus60Text40Audio.evidence);
      for (const ref of [all.content, corpus.dataset]) need(r.reviewedArtifacts?.some(x => x.path === ref.path && x.sha256 === ref.sha256), 'người rà chưa kiểm đúng content/corpus hiện tại');
      const reviewed = records(r.utterances, 12, 'reviewed utterances');
      need([...reviewed.values()].every(x=>c.utterances.some(u=>u.id===x.id) && x.verdict === 'approved' && nonempty(x.notes)) && c.scenarios.every(s=>s.positive.some(id=>reviewed.has(id))), 'cần rà câu/pinyin/nghĩa/audio của ít nhất một câu đúng trong mỗi tình huống');
      const outputs = records(r.modelOutputs, 12, 'modelOutputs');
      need([...outputs.values()].filter(x=>x.verdict === 'appropriate').length >= Math.ceil(outputs.size * .8) && [...outputs.values()].every(x=>nonempty(x.input) && nonempty(x.output) && nonempty(x.notes)), 'cần rà ít nhất 12 output, ít nhất 80% phù hợp');
      return;
    }
    case 'm2':
      need(sameSet(r.days, [1,2,3,4,5,6,7]), 'E2E chưa đi đủ 7 ngày');
      for (const [field, expected] of [['scenes',c.scenes],['npcs',c.npcs],['quests',c.quests],['activities',c.activities],['events',c.events]]) need(sameSet(r[field], expected.map(x=>x.id)), `E2E thiếu coverage ${field}`);
      need(r.endingQuest === c.endingQuest, 'E2E chưa đến ending');
      for (const scenario of c.scenarios) {
        const results = records(r.scenarioResults?.[scenario.id], scenario.positive.length + scenario.negative.length, 'scenarioResults');
        need(sameSet([...results.keys()], [...scenario.positive,...scenario.negative]), 'thiếu case biến thể đúng/sai');
        for (const [id,result] of results) need(result.accepted === scenario.positive.includes(id), 'scenario nhận sai biến thể');
      }
      return casesCheck(root,r,['chapter-complete','event-seed-repeat','event-once-per-day','events-never-block-story','reward-once']);
    case 'm3':
      need(sameSet(r.sentenceLessons,c.sentenceLessons.map(x=>x.id)) && sameSet(r.characters,c.characters.map(x=>x.id)), 'E2E chưa đủ 10 bài/20 chữ');
      need(sameSet(r.reviewDays,[1,3,7]) && sameSet(r.hintLevels,[1,2,3]) && sameSet(r.skills,['speaking','sentence','handwriting']), 'thiếu lịch ôn/gợi ý/tiến bộ riêng');
      return casesCheck(root,r,['trace','stroke-hint','free-write-retry','stroke-order-feedback','separate-progress-reload','review-schedule']);
    case 'm4': {

      casesCheck(root,r,['six-region-art','hanzi-pinyin-1280x720','save-import-export','corrupt-save-rollback','offline-quest','wasm-unavailable','download-interrupted','model-hash-mismatch']);
      const network = input(root,r.network), origin = new URL(network.origin);
      need(origin.protocol === 'https:', 'network cần bản HTTPS');
      // MVP smoke traces the user-facing chapter paths. ASR/LLM model bytes
      // remain local pinned assets and are covered by the asset/hash checks.
      need(sameSet(network.exercised,['audio','text','strokes']), 'network chưa phủ các đường dữ liệu chapter');
      const assets = new Set(['/', ...walk(root,'dist').map(name => '/'+name.slice(5))]);
      const manifest = json(root,'src/ai/model-manifest.json');
      for(const model of manifest.models) for(const asset of model.files) assets.add(`/models/${model.name}/${asset.path}`);
      for(const asset of manifest.runtime.files) assets.add(`/runtime/${asset.path}`);
      const staticUrl = value => {const url=new URL(value);return url.origin===origin.origin && !url.username && !url.password && !url.search && !url.hash && assets.has(decodeURI(url.pathname));};
      need(list(network.requests,1,'network.requests').every(x => staticUrl(x.url) && ['GET','HEAD'].includes(x.method) && x.bodyBytes === 0 && staticHeaders(x.headers, origin, staticUrl)), 'network có upload, URL/header mang dữ liệu hoặc request ngoài tài nguyên tĩnh phát hành');

      return;
    }
  }
}
export function validateMvp(root, configPath = 'docs/mvp-gates.json') {
  const errors = [];
  let config, content, revision;
  try {
    config = json(root, configPath); need(config.schemaVersion === 1, 'mvp-gates.schemaVersion phải là 1');
    need(config.content?.path?.startsWith('src/'), 'content phải nằm trong src/ và gắn với bản build');
    content = input(root, config.content); contentCheck(root, content); revision = mvpRevision(root);
  } catch (error) { return [`content/config: ${error.message}`]; }
  for (const key of gateNames) {
    try {
      if (config[key]?.deferred === true) {
        need(nonempty(config[key].reason), `${key}: gate deferred phải nêu lý do`);
        continue;
      }
      const report = json(root, config[key]?.evidence);
      need(report.schemaVersion === 1 && report.kind === key, `report sai schema/kind ${key}`);
      need(report.revision === revision, `${key}: report cũ hoặc khác bản build/source`);
      need(nonempty(report.recordedAt) && Number.isFinite(Date.parse(report.recordedAt)), `${key}: thiếu thời điểm đo`);
      checkGate(root, key, report, content, config);
    } catch (error) { errors.push(`${key}: ${error.message}`); }
  }
  return errors;
}
