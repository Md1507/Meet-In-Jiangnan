import {mkdirSync,writeFileSync} from 'node:fs';
import {newChapter,attempt,endPeriod,completeCharacter,travel,validChapter} from '../src/chapter/engine.ts';
import {content,utteranceById} from '../src/chapter/content.ts';
import assert from 'node:assert/strict';
const dir='docs/playtest/01M7AWMZ6C065JP5EHAZABVRFS/saves';
mkdirSync(dir,{recursive:true});
const s=newChapter(2026);
function save(name,state=s){assert.ok(validChapter(state),name);writeFileSync(`${dir}/${name}.json`,JSON.stringify(state,null,2)+'\n');}
function advance(day){while(s.day<day)endPeriod(s);}
function quest(q){for(const id of q.steps){const scenario=content.scenarios.find(x=>x.id===id);assert.ok(attempt(s,id,utteranceById.get(scenario.positive[0]).text,'typed',0).accepted);}}
function go(dest){while(s.scene!==dest){const scene=content.scenes.find(x=>x.id===s.scene);travel(s,scene.exits[1]);}}
save('new-game');quest(content.quests.find(q=>q.id==='arrival'));advance(2);go('canteen');save('canteen-before');quest(content.quests.find(q=>q.id==='breakfast'));save('canteen-after');
for(const q of content.quests.filter(q=>['classroom','shopping','delivery'].includes(q.id))){advance(q.day);quest(q);}
advance(6);save('day6-preparation');const invitation=content.scenarios.find(x=>x.id==='invitation');attempt(s,'invitation',utteranceById.get(invitation.positive[0]).text,'typed',0,undefined,'lesson-10');completeCharacter(s,'我','quiz');advance(7);save('day7-ending-ready');
writeFileSync(`${dir}/invalid-schema.json`,JSON.stringify({...newChapter(),schemaVersion:999},null,2)+'\n');
// Branch fixtures are built exclusively through engine operations. The player still
// approaches the scheduled NPC and opens every conversation through the UI.
for(const q of content.quests){
 const branch=newChapter(2026);
 const advanceBranch=day=>{while(branch.day<day)endPeriod(branch);};
 const finish=(scenario,lesson)=>{const def=content.scenarios.find(x=>x.id===scenario);assert.ok(attempt(branch,scenario,utteranceById.get(def.positive[0]).text,'typed',0,undefined,lesson).accepted);};
 const approach=(state=branch)=>{const scenario=content.scenarios.find(x=>x.id===q.steps[0]);const npc=content.npcs.find(x=>x.id===scenario.npc);const dest=npc.schedule[state.period];while(state.scene!==dest)travel(state,content.scenes.find(x=>x.id===state.scene).exits[1]);};
 // arrival is open from the first instant, so a locked arrival is unreachable.
 if(q.day>1){approach();save(`${q.id}-locked`,branch);}
 for(const prerequisite of content.quests.slice(0,content.quests.indexOf(q))){advanceBranch(prerequisite.day);for(const id of prerequisite.steps)finish(id);}
 if(q.id==='welcome'){advanceBranch(6);finish('invitation','lesson-10');completeCharacter(branch,'我','quiz');}
 advanceBranch(q.day);
 if(q.steps.length>1){
  const partial=structuredClone(branch),first=content.scenarios.find(x=>x.id===q.steps[0]);
  assert.ok(attempt(partial,first.id,utteranceById.get(first.positive[0]).text,'typed',0).accepted);
  approach(partial);save(`${q.id}-partial-replay`,partial);
 }
 for(const target of q.steps.slice(1)){
  const extra=structuredClone(branch);
  for(const id of q.steps.filter(id=>id!==target)){const def=content.scenarios.find(x=>x.id===id);assert.ok(attempt(extra,id,utteranceById.get(def.positive[0]).text,'typed',0).accepted);}
  const scenario=content.scenarios.find(x=>x.id===target),npc=content.npcs.find(x=>x.id===scenario.npc),dest=npc.schedule[extra.period];
  while(extra.scene!==dest)travel(extra,content.scenes.find(x=>x.id===extra.scene).exits[1]);
  save(`${q.id}-${target}-active`,extra);
 }
 for(const id of q.steps.slice(1))finish(id);
 approach();save(`${q.id}-active`,branch);
 finish(q.steps[0]);save(`${q.id}-complete`,branch);
}
console.log('Generated and validated five chapter fixtures; invalid-schema is deliberately invalid.');
