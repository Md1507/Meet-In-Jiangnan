import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export function checkAmbientContent(){
  const data=JSON.parse(readFileSync('src/content/ambient-dialogues.json','utf8'));
  const manifest=JSON.parse(readFileSync('public/licenses/ambient-audio.json','utf8'));
  const chapter=JSON.parse(readFileSync('src/content/mvp.json','utf8'));
  assert.equal(manifest.audioKind,'synthetic-local-sapi');assert.equal(manifest.reviewStatus,'pending-human');
  assert(readFileSync(manifest.license,'utf8').includes('Microsoft Huihui'));
  const ids=new Set(),positions=new Set();let bytes=0;
  const verify=(id,line)=>{
    assert(!ids.has(id));ids.add(id);assert.equal(line.length,3);
    assert(/\p{Script=Han}/u.test(line[0])&&line[1].length&&line[2].length);
    const record=manifest.lines.find(r=>r.id===id);assert(record,'Missing voice '+id);
    assert.deepEqual([record.text,record.pinyin,record.meaningVi],line);
    assert.equal(record.path,'public/audio/ambient/'+id+'.wav');
    const audio=readFileSync(record.path);bytes+=audio.length;
    assert.equal(createHash('sha256').update(audio).digest('hex'),record.sha256,id+' hash');
    assert.equal(audio.toString('ascii',0,4),'RIFF');assert.equal(audio.toString('ascii',8,12),'WAVE');
    let rate=0,length=0;
    for(let offset=12;offset+8<=audio.length;){const size=audio.readUInt32LE(offset+4);assert(offset+8+size<=audio.length);const tag=audio.toString('ascii',offset,offset+4);if(tag==='fmt ')rate=audio.readUInt32LE(offset+16);if(tag==='data')length=size;offset+=8+size+(size%2);}
    assert(rate>0&&length/rate>=.3&&length/rate<20,id+' audio duration');
  };
  for(const npc of data.npcs){
    assert(chapter.scenes.some(s=>s.id===npc.scene));assert(Number.isInteger(npc.ambientIndex)&&npc.ambientIndex>=0&&npc.ambientIndex<9);
    assert(!positions.has(npc.ambientIndex));positions.add(npc.ambientIndex);
    const turnIds=new Set();
    for(const turn of npc.turns){
      assert(!turnIds.has(turn.id));turnIds.add(turn.id);assert.equal(turn.hints.length,2);assert(turn.goal);
      const prefix=npc.id+'-'+turn.id;verify(prefix+'-prompt',turn.prompt);
      const intents=new Set();
      for(const r of turn.responses){assert(!intents.has(r.intent));intents.add(r.intent);verify(prefix+'-'+r.intent+'-sample',r.sample);verify(prefix+'-'+r.intent+'-reply',r.reply);}
      assert(intents.size>=2);
    }
  }
  assert.equal(manifest.lines.length,ids.size);
  console.log(`Ambient content PASS: ${data.npcs.length} NPCs, ${data.npcs.reduce((n,p)=>n+p.turns.length,0)} questions, ${ids.size} local voices, ${(bytes/1048576).toFixed(2)} MiB. Human review pending.`);
}
