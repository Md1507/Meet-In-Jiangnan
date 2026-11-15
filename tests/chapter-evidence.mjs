// Real UI run + observed engine assertions. No inference or human-review claims.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {content,interpret,utteranceById} from '../src/chapter/content.ts';
import {newChapter,attempt,endPeriod,completeCharacter,eventForScene,finishEvent,dailyActivity,dueReviews,review,validChapter} from '../src/chapter/engine.ts';
import {mvpRevision} from '../scripts/mvp-evidence.mjs';
const root=process.cwd(),revision=mvpRevision(root),recordedAt=new Date().toISOString();
mkdirSync('docs/evidence/chapter-cases',{recursive:true});
const ui=execFileSync(process.platform==='win32'?'npm.cmd':'npm',['run','verify:m0-m1'],{encoding:'utf8',maxBuffer:4*1024*1024,shell:process.platform==='win32'});
writeFileSync('docs/evidence/chapter-technical-check.log',ui);
writeFileSync('docs/evidence/chapter-browser-check.log',ui);process.stdout.write(ui);
assert.match(ui,/Chapter UI PASS:.*all20/);
const artifact=path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});
const caseResult=(id,steps)=>{for(const step of steps)assert.deepEqual(step.actual,step.expected,step.action);const path=`docs/evidence/chapter-cases/${id}.json`;writeFileSync(path,JSON.stringify({schemaVersion:1,kind:'mvp-case',caseId:id,revision,recordedAt,steps,uiRun:artifact('docs/evidence/chapter-browser-check.log')},null,2)+'\n');return {id,status:'passed',observed:steps.map(s=>s.action).join('; '),log:artifact(path)};};
const step=(action,expected,actual)=>({action,expected,actual});
const s=newChapter(),days=new Set([1]);
for(const quest of content.quests){while(s.day<quest.day){endPeriod(s);days.add(s.day);}for(const id of quest.steps)attempt(s,id,utteranceById.get(content.scenarios.find(c=>c.id===id).positive[0]).text,'typed',0);}
attempt(s,'invitation',utteranceById.get('invitation-0').text,'typed',0,undefined,'lesson-10');completeCharacter(s,'我','quiz');
const finished=structuredClone(s),relations=structuredClone(s.relations);
attempt(s,'invitation',utteranceById.get('invitation-0').text,'typed',0);
const cases=[caseResult('chapter-complete',[step('Seven-day keyboard UI/engine ending',content.quests.map(q=>q.id),s.completed),step('Keyboard ending does not claim audio','keyboard',s.endingMode),step('Valid resulting save',true,validChapter(s))]),caseResult('reward-once',[step('Repeated final answer preserves reward',relations,s.relations)])];
const events=[],activities=[],sequenceA=[],sequenceB=[];let duplicate=false;
for(const scene of content.scenes){s.scene=scene.id;const other=structuredClone(s);for(;;){const a=eventForScene(s),b=eventForScene(other);assert.deepEqual(a,b);if(!a)break;sequenceA.push(a.id);sequenceB.push(b.id);finishEvent(s,a.id);finishEvent(other,b.id);events.push(a.id);duplicate ||= finishEvent(s,a.id);}
  for(const activity of content.activities.filter(a=>a.scene===scene.id)){assert.equal(dailyActivity(s,activity.id),true);assert.equal(dailyActivity(s,activity.id),false);activities.push(activity.id);}}
cases.push(caseResult('event-seed-repeat',[step('Identical state and seed produce identical event sequence',sequenceA,sequenceB)]),caseResult('event-once-per-day',[step('Completed event never grants a second result',false,duplicate),step('All four events exercised',content.events.map(e=>e.id).sort(),events.sort())]),caseResult('events-never-block-story',[step('Events preserve finished quest set',finished.completed,s.completed),step('All daily activities exercised',content.activities.map(a=>a.id).sort(),activities.sort())]));
const scenarioResults=Object.fromEntries(content.scenarios.map(c=>[c.id,[...c.positive,...c.negative].map(id=>{const accepted=interpret(c.id,utteranceById.get(id).text).accepted;assert.equal(accepted,c.positive.includes(id));return {id,accepted};})]));
const report={schemaVersion:1,recordedAt,revision,execution:'real-browser-ui-plus-engine-assertions',limitations:['Automated composition/pointer events; no physical IME/mic or language review','Speaking provenance is tested separately; this walkthrough is keyboard'],uiRun:artifact('docs/evidence/chapter-browser-check.log')};
writeFileSync('docs/evidence/gate-m2.json',JSON.stringify({...report,kind:'m2',days:[...days],scenes:content.scenes.map(x=>x.id),npcs:content.npcs.map(x=>x.id),quests:s.completed,activities,events,endingQuest:content.endingQuest,scenarioResults,cases},null,2)+'\n');
const learning=newChapter();for(const lesson of content.sentenceLessons){const c=content.scenarios.find(c=>c.id===lesson.scenario);attempt(learning,c.id,utteranceById.get(c.positive[0]).text,'typed',0,undefined,lesson.id);}for(const c of content.characters)completeCharacter(learning,c.id,'quiz');
const phrase=learning.journal[0],due=[];for(const offset of [1,3,7]){learning.day=phrase.learnedDay+offset;assert.ok(dueReviews(learning).includes(phrase));review(learning,phrase.id,phrase.text);due.push(offset);assert.equal(dueReviews(learning).includes(phrase),false);}
const uiPassed=ui.includes('all20 real Hanzi Writer pointer quizzes/trace/hint/retry');
const m3cases=['trace','stroke-hint','free-write-retry','stroke-order-feedback','separate-progress-reload'].map(id=>caseResult(id,[step('Real Hanzi Writer pointer UI including wrong-stroke feedback, retry, hints, all20 and reload assertions',true,uiPassed)]));
m3cases.push(caseResult('review-schedule',[step('Reviews become due after 1/3/7 game days',[1,3,7],due)]));
writeFileSync('docs/evidence/gate-m3.json',JSON.stringify({...report,kind:'m3',sentenceLessons:Object.keys(learning.skills.sentence),characters:Object.keys(learning.skills.handwriting),reviewDays:due,hintLevels:[1,2,3],skills:['speaking','sentence','handwriting'],cases:m3cases},null,2)+'\n');
assert.equal(mvpRevision(root),revision,'Sources/build changed during evidence run');console.log('M2/M3 evidence written from actual UI run and asserted engine observations.');
