// Dictionary support is lexical evidence, not a translation or human review.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash, randomUUID} from 'node:crypto';
import path from 'node:path';
import {grammarCandidates} from './reference-grammar.mjs';
import {comparePinyin} from './reference-pinyin.mjs';
const [dictionary, outputDir] = process.argv.slice(2);
if (!dictionary || !outputDir) throw Error('Usage: node scripts/reference-audit.mjs <cedict_ts.u8> <new-output-directory>');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = readFileSync(dictionary);
if (hash(bytes) !== 'e600176f3344a056c0b81aa38ee1485b55cf80959b747642b50a595a32a13029') throw Error('Unexpected reference hash');
const contentBytes = readFileSync('src/content/mvp.json');
const content = JSON.parse(contentBytes);
const grammarPath=path.join(path.dirname(dictionary),'GF0025-2021.pdf'),grammarHash='e451fdf0899d9267bbd122db66e7e75bdd2851ad1e6732e47b6e960290d73a63';
if(hash(readFileSync(grammarPath))!==grammarHash)throw Error('Unexpected GF2021 reference hash');
const entries = new Map();
for (const line of bytes.toString('utf8').split(/\r?\n/)) {
  const m = line.match(/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/);
  if (!m) continue;
  const list = entries.get(m[2]) ?? []; list.push({traditional:m[1], simplified:m[2], pinyin:m[3], english:m[4]}); entries.set(m[2], list);
}
const rows = content.utterances.map(u => {
  const chars = [...u.text].filter(c => /\p{Script=Han}/u.test(c));
  const words = []; let i = 0;
  while (i < chars.length) {
    let word = '';
    for (let n = Math.min(6, chars.length-i); n > 0; n--) { const candidate=chars.slice(i,i+n).join(''); if(entries.has(candidate)){word=candidate;break;} }
    if (!word) { words.push({text:chars[i],status:'not-found'}); i++; continue; }
    words.push({text:word,status:'dictionary-entry',entries:entries.get(word)}); i += [...word].length;
  }
  const pinyinComparison=comparePinyin(u.pinyin,words);
  const grammar=grammarCandidates(u.text);
  return {id:u.id,text:u.text,pinyin:u.pinyin,meaningVi:u.meaningVi,context:u.context,lexicalMatches:words,pinyinComparison,grammar,
    status:words.some(w=>w.status==='not-found')?'uncertain-missing-entry':'uncertain-context-and-pronunciation',
    sentencePinyin:'unreviewed',meaningAndContext:'unreviewed',audio:'unavailable: no independently licensed exact-phrase reference'};
});
const report={kind:'reference-audit-diagnostic',createdAt:new Date().toISOString(),reviewer:{kind:'automated-reference',human:false},
  source:{url:'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',downloadedBy:'coordinator',downloadedAt:'2026-11-13T04:51:32Z',license:'CC BY-SA 4.0',attribution:'CC-CEDICT contributors via MDBG',sha256:hash(bytes),compressedSha256:'3199822e3cb14dfd13b4c80374cefb6d02e579e92f39e5ac7e6a7fa702fae739'},
  grammarSource:{title:'GF 0025-2021 国际中文教育中文水平等级标准',year:2021,edition:'2021 standard',isbn:null,sourceType:'official-standard-not-textbook',url:'https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202103/W020210329527301787356.pdf',sha256:grammarHash,localHashVerified:true,inspection:{by:'coordinator',method:'Rendered and read official appendix A pages; supplied in task constraints',pages:[{printed:170,pdf:176,sections:['A.1.1.2','A.1.1.3']},{printed:174,pdf:180,sections:['A.1.3.4']},{printed:178,pdf:184,sections:['A.1.7']}]},scope:'Heuristic lexical candidates for comparison with inspected Appendix A sections; no verified per-sentence grammatical mapping'},
  textbookMetadata:[{title:'语法学习手册（初等）',year:2022,edition:'2022-01',isbn:'9787561959862',url:'https://www.blcup.com/PInfo/index/11228',coverage:'publisher metadata only; book contents not inspected'},{title:'词汇速记速练手册（一级）',year:2022,edition:'2022-11',isbn:'9787561961223',url:'https://www.blcup.com/PInfo/index/11438',coverage:'publisher metadata only; book contents not inspected'}],
  content:{path:'src/content/mvp.json',sha256:hash(contentBytes)},rows,
  modelOutputs:Array.from({length:30},(_,i)=>({id:`output-${i+1}`,status:'unavailable',reason:'No independently collected real output supplied'})),
  limitations:['Greedy segmentation is ambiguous and ignores punctuation boundaries; pinyin comparison ignores tones and caps candidate paths at 500. Mismatch needs manual investigation.', 'GF lexical candidates are unverified and may include polysemous or embedded terms; no supported-sentence coverage count. Publisher 2022 textbook contents not inspected; no textbook-level sentence approval.', 'Pinyin tones, Vietnamese meaning, context, audio and speaker identity remain unreviewed.', 'No real reviewer or 40 recordings from six speakers; legacy gate remains pending.']};
mkdirSync(outputDir,{recursive:true});
const file=path.join(outputDir,`reference-audit-${randomUUID()}.json`);writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({file,rows:rows.length,missing:rows.filter(r=>r.status==='uncertain-missing-entry').length,allUnreviewed:true}));
