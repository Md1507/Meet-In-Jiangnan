import {content,interpret,scenarioById,sceneById,utteranceById} from './content.ts';
import {valid as validLegacy} from '../storage/save.ts';
import {validChatProgress,type ChatProgress} from './ambient.ts';
export type Skill='speaking'|'sentence'|'handwriting';
export type AttemptSource='typed'|'audio-asr'|'edited-transcript';
export interface JournalItem {id:string;text:string;pinyin:string;meaningVi:string;context:string;learnedDay:number;dueDays:number[];reviewedDays:number[];hint:number;source:AttemptSource}
export interface Attempt {scenario:string;text:string;rawTranscript?:string;source:AttemptSource;hint:number;day:number;accepted:boolean}
export interface ChapterSave {
  schemaVersion:2;revision:number;scene:string;x:number;y:number;day:number;period:number;seed:number;
  completed:string[];steps:Record<string,string[]>;relations:Record<string,number>;
  skills:Record<Skill,Record<string,number>>;journal:JournalItem[];attempts:Attempt[];
  events:string[];activities:string[];endingMode:'audio'|'keyboard'|null;
  endingInvitationSource?:AttemptSource;
  chats?:ChatProgress;
  settings:{volume:number;pinyin:boolean;meaning:boolean};
}
export function newChapter(seed=2026):ChapterSave{return {schemaVersion:2,revision:0,scene:content.startScene,x:480,y:380,day:1,period:0,seed:seed>>>0,completed:[],steps:{},relations:{},skills:{speaking:{},sentence:{},handwriting:{}},journal:[],attempts:[],events:[],activities:[],endingMode:null,settings:{volume:.6,pinyin:true,meaning:true}};}
const unique=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string')&&new Set(v).size===v.length;
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const integer=(v:unknown,min:number,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&Number(v)>=min&&Number(v)<=max;
const keysOnly=(v:unknown,allowed:string[])=>object(v)&&Object.entries(v).every(([k,n])=>allowed.includes(k)&&integer(n,0));
export function validChapter(value:unknown):value is ChapterSave {
  if(!object(value))return false;const s=value as unknown as ChapterSave;
  if(s.schemaVersion!==2||!integer(s.revision,0)||!sceneById.has(s.scene)||!Number.isFinite(s.x)||!Number.isFinite(s.y)||s.x<32||s.x>928||s.y<32||s.y>508||!integer(s.day,1,3650)||!integer(s.period,0,2)||!integer(s.seed,0,0xffffffff))return false;
  if(sceneById.get(s.scene)!.colliders.some(([l,t,r,b])=>s.x+8>l&&s.x-8<r&&s.y+16>t&&s.y-22<b))return false;
  if(!unique(s.completed)||s.completed.some(id=>!content.quests.some(q=>q.id===id))||!object(s.steps)||!Object.entries(s.steps).every(([id,steps])=>content.quests.some(q=>q.id===id)&&unique(steps)&&steps.every(step=>content.quests.find(q=>q.id===id)!.steps.includes(step))))return false;
  if(s.completed.some(id=>{const q=content.quests.find(q=>q.id===id)!;return q.day>s.day||!q.requires.every(required=>s.completed.includes(required))||!q.steps.every(step=>s.steps[id]?.includes(step));}))return false;
  if(!keysOnly(s.relations,content.npcs.map(n=>n.id))||!object(s.skills)||!['speaking','sentence','handwriting'].every(k=>object(s.skills[k as Skill])))return false;
  if(!keysOnly(s.skills.speaking,content.scenarios.map(s=>s.id))||!keysOnly(s.skills.sentence,content.sentenceLessons.map(l=>l.id))||!keysOnly(s.skills.handwriting,content.characters.map(c=>c.id)))return false;
  const source=(a:unknown)=>['typed','audio-asr','edited-transcript'].includes(String(a));
  if(s.endingInvitationSource!==undefined&&!source(s.endingInvitationSource))return false;
  if(s.chats!==undefined&&!validChatProgress(s.chats))return false;
  if(!Array.isArray(s.journal)||s.journal.length>1000||!s.journal.every(j=>object(j)&&utteranceById.has(j.id)&&j.text===utteranceById.get(j.id)!.text&&j.pinyin===utteranceById.get(j.id)!.pinyin&&j.meaningVi===utteranceById.get(j.id)!.meaningVi&&typeof j.context==='string'&&integer(j.learnedDay,1,s.day)&&Array.isArray(j.dueDays)&&j.dueDays.length===3&&j.dueDays.every((day,i)=>day===j.learnedDay+[1,3,7][i])&&Array.isArray(j.reviewedDays)&&j.reviewedDays.every(d=>integer(d,j.learnedDay,s.day))&&integer(j.hint,0,3)&&source(j.source)))return false;
  if(!Array.isArray(s.attempts)||s.attempts.length>2000||!s.attempts.every(a=>object(a)&&scenarioById.has(a.scenario)&&typeof a.text==='string'&&a.text.length<=1000&&source(a.source)&&integer(a.hint,0,3)&&integer(a.day,1,s.day)&&typeof a.accepted==='boolean'&&(a.rawTranscript===undefined||typeof a.rawTranscript==='string')))return false;
  if(!unique(s.events)||!unique(s.activities)||!s.events.every(k=>/^\d+:[a-z_]+$/.test(k)&&content.events.some(e=>k.endsWith(':'+e.id)))||!s.activities.every(k=>/^\d+:[a-z_]+$/.test(k)&&content.activities.some(a=>k.endsWith(':'+a.id))))return false;
  const ended=s.completed.includes(content.endingQuest);
  if(ended!==!!s.endingMode||ended&&(!s.skills.sentence['lesson-10']||!s.skills.handwriting['我'])||s.endingMode==='audio'&&!s.skills.speaking.invitation)return false;
  return [null,'audio','keyboard'].includes(s.endingMode)&&object(s.settings)&&Number.isFinite(s.settings.volume)&&s.settings.volume>=0&&s.settings.volume<=1&&typeof s.settings.pinyin==='boolean'&&typeof s.settings.meaning==='boolean';
}
export function migrateChapter(value:unknown):ChapterSave {
  if(validChapter(value))return structuredClone(value);
  if(object(value)&&(value.schemaVersion===1||value.schemaVersion===undefined)&&validLegacy(value)){
    const s=newChapter();s.scene='canteen';s.x=Math.max(32,Math.min(928,Number(value.x)));s.y=Math.max(303,Math.min(508,Number(value.y)));
    s.skills.handwriting['我']=value.writing;
    for(const item of value.journal){const result=interpret('order_water',item.text);if(result.accepted)attempt(s,'order_water',item.text,item.source,item.hint,item.rawTranscript??(item.source==='audio-asr'?item.text:undefined));}
    return s;
  }
  throw Error('Bản lưu không đúng schema hoặc dữ liệu không hợp lệ.');
}
export const activeQuests=(s:ChapterSave)=>content.quests.filter(q=>q.day<=s.day&&!s.completed.includes(q.id)&&q.requires.every(id=>s.completed.includes(id)));
export function finishQuests(s:ChapterSave) {
  for(const q of activeQuests(s)){
    if(!q.steps.every(id=>s.steps[q.id]?.includes(id)))continue;
    if(q.id===content.endingQuest && (!s.skills.sentence['lesson-10']||!s.skills.handwriting['我']))continue;
    s.completed.push(q.id);
    s.relations[q.npc]=(s.relations[q.npc]??0)+1;
    if(q.id===content.endingQuest)s.endingMode=s.endingInvitationSource==='audio-asr'?'audio':'keyboard';
  }
}
export function attempt(s:ChapterSave, scenario:string,text:string,source:AttemptSource,hint:number,rawTranscript?:string,lesson?:string) {
  const result=interpret(scenario,text);
  if(!scenarioById.has(scenario)||text.length>1000||!integer(hint,0,3))throw Error('Lần thử không hợp lệ.');
  if(source==='audio-asr'&&(!rawTranscript||rawTranscript!==text))throw Error('Nguồn audio cần bản chép chưa sửa.');
  if(source==='edited-transcript'&&!rawTranscript)throw Error('Thiếu bản chép gốc.');
  const lessonDefinition=lesson?content.sentenceLessons.find(l=>l.id===lesson&&l.scenario===scenario):undefined;
  if(lesson&&!lessonDefinition)throw Error('Bài viết không khớp tình huống.');
  s.attempts.push({scenario,text,source,hint,rawTranscript,day:s.day,accepted:result.accepted});s.attempts=s.attempts.slice(-2000);
  if(!result.accepted||!result.phrase)return result;
  if(source==='audio-asr')s.skills.speaking[scenario]=(s.skills.speaking[scenario]??0)+1;
  if(lesson)s.skills.sentence[lesson]=(s.skills.sentence[lesson]??0)+1;
  for(const q of activeQuests(s))if(q.steps.includes(scenario)) {const steps=s.steps[q.id]??=[];if(!steps.includes(scenario))steps.push(scenario);if(q.id===content.endingQuest&&scenario==='invitation'&&!lesson)s.endingInvitationSource=source;}
  const phrase=result.phrase;
  if(!s.journal.some(j=>j.id===phrase.id))s.journal.push({...phrase,learnedDay:s.day,dueDays:[s.day+1,s.day+3,s.day+7],reviewedDays:[],hint,source});
  finishQuests(s);return result;
}
export function completeCharacter(s:ChapterSave,char:string,mode:'trace'|'hint'|'quiz') {
  if(!content.characters.some(c=>c.id===char))throw Error('Chữ không hợp lệ.');
  if(mode==='quiz'){s.skills.handwriting[char]=(s.skills.handwriting[char]??0)+1;finishQuests(s);}
}
export function endPeriod(s:ChapterSave){if(s.day>=3650&&s.period===2)throw Error('Đã đến giới hạn lịch.');s.period=(s.period+1)%3;if(s.period===0)s.day++;finishQuests(s);}
export function dailyActivity(s:ChapterSave,id:string){const a=content.activities.find(a=>a.id===id);if(!a||a.scene!==s.scene)throw Error('Hãy đến đúng khu vực.');const key=`${s.day}:${id}`;if(s.activities.includes(key))return false;s.activities.push(key);return true;}
export function eventForScene(s:ChapterSave){
  const candidates=content.events.filter(e=>e.scene===s.scene&&s.day>=e.minDay&&e.requires.every(id=>s.completed.includes(id))&&!s.events.includes(`${s.day}:${e.id}`));
  if(!candidates.length)return null;
  // Stateless selection: visiting a menu never consumes RNG or changes story state.
  const n=((s.seed^(s.day*2654435761))>>>0)%candidates.length;return candidates[n];
}
export function finishEvent(s:ChapterSave,id:string){const event=eventForScene(s);if(!event||event.id!==id)return false;s.events.push(`${s.day}:${id}`);s.relations[event.npc]=(s.relations[event.npc]??0)+1;return true;}
export const dueReviews=(s:ChapterSave)=>s.journal.filter(j=>j.dueDays.some(day=>day<=s.day&&!j.reviewedDays.some(review=>review>=day)));
export function review(s:ChapterSave,id:string,text:string){const j=s.journal.find(j=>j.id===id);if(!j)return false;const scenario=content.scenarios.find(c=>c.positive.includes(id));if(!scenario||!interpret(scenario.id,text).accepted)return false;if(!j.reviewedDays.includes(s.day))j.reviewedDays.push(s.day);return true;}
export function travel(s:ChapterSave,scene:string){const current=sceneById.get(s.scene);if(!current?.exits.includes(scene))throw Error('Không có lối nối đến vùng này.');const dest=sceneById.get(scene)!;s.scene=dest.id;s.x=dest.spawn.x;s.y=dest.spawn.y;}
