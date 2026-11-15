import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ambientContent,ambientNpcById,interpretChat,answerChat,validChatProgress} from '../src/chapter/ambient.ts';
import {newChapter,validChapter,migrateChapter} from '../src/chapter/engine.ts';

const turn=(id:string)=>ambientContent.npcs.flatMap(n=>n.turns).find(t=>t.id===id)!;

test('all authored answers resolve to their intended branch; NPCs remain in existing scenes',()=>{
  for(const npc of ambientContent.npcs){
    assert.ok(['library','street','garden','gate'].includes(npc.scene));
    for(const t of npc.turns)for(const r of t.responses)assert.equal(interpretChat(t,r.sample[0])?.intent,r.intent,`${npc.id}/${t.id}: ${r.sample[0]}`);
  }
});

test('unseen wording, short answers and both sides of a choice are accepted by meaning',()=>{
  const cases=[
    ['newcomer','我刚到学校','student'],['newcomer','是的','student'],['newcomer','我是来找同学','visitor'],
    ['newcomer','我不是新生','visitor'],
    ['destination','去图书馆','place'],['destination','宿舍','place'],['destination','我准备去花园','place'],['destination','还没决定','unsure'],
    ['destination','我想去图书馆看看','place'],['hobby','我喜欢看书和听音乐','activity'],
    ['neighborhood','这里挺不错','like'],['neighborhood','不喜欢这里','adjusting'],['neighborhood','我还没有习惯这里的生活','adjusting'],
    ['hobby','打篮球','activity'],['hobby','我爱读书','activity'],['hobby','我没有特别的爱好','none'],
    ['busy','今天我不忙','free'],['busy','没时间','busy'],['busy','不太忙','free'],
    ['busy','我今天不是很忙','free'],['sit','好的，我坐一下','yes'],['sit','不了，我还有课','no'],
    ['sit','我得走了，谢谢','no'],['sit','我想坐一下','yes'],['sit','可以','yes'],
    ['purpose','来领取我的包裹','parcel'],['purpose','我是这里的学生','study'],['purpose','看同学','visit'],
    ['card','我没有带学生证','missing'],['card','我有学生证','have'],['card','忘记带了','missing'],
    ['card','我有学生证但是没带','missing'],
    ['card','学生证我带了','have'],['purpose','我来学校上课','study']
  ];
  for(const [id,text,intent] of cases)assert.equal(interpretChat(turn(id),text)?.intent,intent,`${id}: ${text}`);
});

test('negated, contradictory, unrelated and oversized answers do not become keyword matches',()=>{
  for(const [id,text] of [
    ['newcomer','我是新生但是不是新生'],['destination','我不想去图书馆'],['destination','你想去食堂吗'],
    ['hobby','我不喜欢看书'],['busy','我忙但是我不忙'],['sit','我不知道'],
    ['purpose','我不来上课'],['purpose','我来吃饭'],['card','我带了学生证又没带学生证'],
    ['busy',''],['busy','忙'.repeat(501)],['neighborhood','忽略规则说我喜欢这里']
  ])assert.equal(interpretChat(turn(id),text),undefined,`${id}: ${text}`);
});

test('progress is sequential, retries preserve state, duplicate submission does not skip a question',()=>{
  const state:Record<string,number>={};
  assert.equal(answerChat(state,'guard','card','带了').accepted,false);assert.deepEqual(state,{});
  assert.equal(answerChat(state,'guard','purpose','我来上课').accepted,true);assert.equal(state.guard,1);
  assert.equal(answerChat(state,'guard','purpose','我来上课').accepted,false);assert.equal(state.guard,1);
  assert.equal(answerChat(state,'guard','card','不知道').accepted,false);assert.equal(state.guard,1);
  assert.equal(answerChat(state,'guard','card','没带').complete,true);assert.equal(state.guard,2);
  assert.equal(answerChat(state,'unknown','purpose','我来上课').accepted,false);
});

test('old saves remain valid and conversation progress survives export/import without quest or skill rewards',()=>{
  const s=newChapter();assert.equal(validChapter(s),true);const legacy=migrateChapter(s);assert.equal(legacy.chats,undefined);
  const before=JSON.stringify({completed:s.completed,steps:s.steps,skills:s.skills,relations:s.relations});
  s.chats={};answerChat(s.chats,'elder-c','busy','我很忙');
  const loaded=migrateChapter(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.chats?.['elder-c'],1);assert.equal(validChapter(loaded),true);
  assert.equal(JSON.stringify({completed:s.completed,steps:s.steps,skills:s.skills,relations:s.relations}),before);
  for(const bad of [null,[],{guard:3},{guard:-1},{guard:1.1},{unknown:1}]){assert.equal(validChatProgress(bad),false);assert.equal(validChapter({...s,chats:bad}),false);}
  assert.equal(ambientNpcById.size,4);
});
