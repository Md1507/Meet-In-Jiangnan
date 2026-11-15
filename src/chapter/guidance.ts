import {content, scenarioById, sceneById} from './content.ts';
import {activeQuests, type ChapterSave} from './engine.ts';

export type GuidanceBranch = 'entry'|'locked'|'active'|'error'|'cancel'|'complete'|'replay';
type Quest = typeof content.quests[number];

// Presentation only: all progress and rewards remain owned by the engine.
export function questBranch(save:ChapterSave, quest:Quest):'locked'|'active'|'complete' {
  if(save.completed.includes(quest.id)) return 'complete';
  return activeQuests(save).some(q=>q.id===quest.id)?'active':'locked';
}
export function questGuidance(save:ChapterSave, quest:Quest) {
  const branch=questBranch(save,quest);
  const step=quest.steps.find(id=>!save.steps[quest.id]?.includes(id));
  const scenario=step?scenarioById.get(step):undefined;
  const npc=scenario&&content.npcs.find(n=>n.id===scenario.npc);
  const scene=npc&&sceneById.get(npc.schedule[save.period]);
  const missing=quest.requires.filter(id=>!save.completed.includes(id)).map(id=>content.quests.find(q=>q.id===id)!.title);
  let text:string;
  if(branch==='complete') text='Đã hoàn thành; có thể luyện lại mà không nhận lại thưởng nhiệm vụ.';
  else if(branch==='locked') text=[quest.day>save.day?`Mở từ ngày ${quest.day}.`:'',missing.length?`Cần hoàn thành: ${missing.join(', ')}.`:''].filter(Boolean).join(' ');
  else if(scenario&&npc&&scene) text=`${scenario.label}: tìm ${npc.name} tại ${scene.name} trong buổi này. Đến gần và nhấn E.`;
  else text='Các bước hội thoại đã xong; hãy hoàn thành bài viết lời mời và tự viết chữ 我.';
  return {id:`guidance-default.${quest.id}.${branch}`,branch,step,scenario,npc,scene,text};
}

export function scenarioGuidance(save:ChapterSave, scenarioId:string) {
  const matches=content.quests.filter(q=>q.steps.includes(scenarioId));
  const quest=matches.find(q=>questBranch(save,q)==='active'&&!save.steps[q.id]?.includes(scenarioId))
    ?? matches.find(q=>questBranch(save,q)==='active')
    ?? matches.find(q=>questBranch(save,q)==='locked') ?? matches.find(q=>questBranch(save,q)==='complete');
  if(!quest)return undefined;
  const guidance=questGuidance(save,quest);
  if(guidance.branch==='active'&&save.steps[quest.id]?.includes(scenarioId))return {
    ...guidance,quest,id:`guidance-default.${quest.id}.replay`,branch:'replay' as const,
    text:`Bước này đã xong; có thể luyện lại. Tiếp theo: ${guidance.text}`,
  };
  return {quest,...guidance};
}
