import {readFileSync} from 'node:fs';
import {contentCheck} from './mvp-evidence.mjs';
import {checkAmbientContent} from './check-ambient-content.mjs';
const content=JSON.parse(readFileSync('src/content/mvp.json','utf8'));
contentCheck(process.cwd(),content);
checkAmbientContent();
console.log(`Content PASS: ${content.scenes.length} regions, ${content.npcs.length} NPC, ${content.quests.length} quests, ${content.scenarios.length} scenarios, ${content.utterances.length} audio, ${content.sentenceLessons.length} lessons, ${content.characters.length} characters. Human review: ${content.reviewStatus}.`);
