import {answerChat,chatAudio,type AmbientNpc,type ChatProgress} from './ambient.ts';
import type {LocalRecorder} from '../audio/recorder';
import type {ModelManager} from '../ai/ModelManager';
import {toMono16k,hasAudibleSignal} from '../audio/pcm';

interface Options {
  body:HTMLElement;npc:AmbientNpc;progress:ChatProgress;
  settings:{volume:number;pinyin:boolean;meaning:boolean};
  recorder:LocalRecorder;model:ModelManager;cancelAI:()=>void;
  current:()=>boolean;persist:()=>void;close:()=>void;
}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

export function mountAmbientPanel(o:Options){
  const section=document.createElement('section');section.className='ambient-conversation';o.body.append(section);
  let disposed=false,generation=0,playing:HTMLAudioElement|undefined,recordedUrl='';
  const active=()=>!disposed&&o.current();
  const stopAudio=()=>{playing?.pause();playing=undefined;section.querySelector<HTMLAudioElement>('[data-chat="playback"]')?.pause();};
  const cancel=()=>{generation++;stopAudio();o.cancelAI();};
  const line=(v:string[])=>`<p lang="zh-Hans" class="chat-chinese">${escape(v[0])}</p>${o.settings.pinyin?`<p class="chat-pinyin">${escape(v[1])}</p>`:''}${o.settings.meaning?`<p>${escape(v[2])}</p>`:''}`;
  function render(){
    cancel();if(recordedUrl)URL.revokeObjectURL(recordedUrl);recordedUrl='';
    const index=o.progress[o.npc.id]??0,turn=o.npc.turns[index];
    if(!turn){
      section.innerHTML=`<p>${escape(o.npc.context)}</p><p>Cuộc trò chuyện đã xong. Bạn có thể gặp lại để luyện một cách trả lời khác.</p><button data-chat="replay">Trò chuyện lại</button><button data-chat="close">Khép cuộc trò chuyện</button>`;
      section.querySelector<HTMLButtonElement>('[data-chat="replay"]')!.onclick=()=>{o.progress[o.npc.id]=0;o.persist();render();};
      section.querySelector<HTMLButtonElement>('[data-chat="close"]')!.onclick=o.close;return;
    }
    const prefix=`${o.npc.id}-${turn.id}`;
    section.innerHTML=`<p class="chat-context">${escape(o.npc.context)} <span>Trò chuyện tự chọn · ${index+1}/${o.npc.turns.length}</span></p><div class="npc-line">${line(turn.prompt)}<button data-chat="listen">Nghe NPC</button><button data-chat="slow">Nghe chậm</button></div><p>${escape(turn.goal)}</p><p class="chat-reassurance">Nói theo cách của bạn, đủ ý là được. Có thể tạm biệt bất cứ lúc nào.</p><div class="hint-buttons"><button data-hint="0">Gợi ý 1 · Nhắc ý</button><button data-hint="1">Gợi ý 2 · Từ khóa</button><button data-hint="2">Gợi ý 3 · Câu mẫu</button></div><div data-chat="hint" aria-live="polite"></div><label for="chat-answer">Bạn trả lời (tiếng Trung)</label><textarea id="chat-answer" maxlength="500" rows="2" placeholder="Nói điều bạn muốn chia sẻ…"></textarea><div><button data-chat="send" class="primary">Trả lời</button><button data-chat="record">Thu âm · tối đa 20 giây</button><button data-chat="stop" disabled>Dừng thu</button></div><audio data-chat="playback" controls hidden></audio><div data-chat="feedback" role="status" aria-live="polite"></div><div data-chat="outcome"></div><button data-chat="next" hidden>${index+1===o.npc.turns.length?'Khép cuộc trò chuyện':'Nghe câu tiếp theo'}</button><p class="draft-note">Giọng đọc tổng hợp · nội dung đang chờ người rà.</p>`;
    const el=<T extends HTMLElement>(id:string)=>section.querySelector<T>(`[data-chat="${id}"]`)!;
    const answer=section.querySelector<HTMLTextAreaElement>('#chat-answer')!,feedback=el('feedback');
    let composing=false,justComposed=false,changed=0,submitted=false,raw='';
    const play=(id:string,slow=false)=>{stopAudio();playing=new Audio(chatAudio(id));playing.volume=o.settings.volume;playing.playbackRate=slow?.75:1;void playing.play().catch(()=>{if(active())feedback.textContent='Chưa phát được giọng đọc. Bạn vẫn có thể đọc câu và trả lời.';});};
    el('listen').onclick=()=>play(prefix+'-prompt');el('slow').onclick=()=>play(prefix+'-prompt',true);
    section.querySelectorAll<HTMLButtonElement>('[data-hint]').forEach(b=>b.onclick=()=>{
      const level=Number(b.dataset.hint),hint=el('hint');hint.replaceChildren();
      if(level<2){hint.textContent=turn.hints[level];return;}
      for(const r of turn.responses){const card=document.createElement('div');card.className='chat-example';card.innerHTML=line(r.sample);const listen=document.createElement('button');listen.textContent='Nghe câu mẫu';listen.onclick=()=>play(prefix+'-'+r.intent+'-sample');card.append(listen);hint.append(card);}
    });
    answer.oninput=()=>{changed++;};answer.addEventListener('compositionstart',()=>composing=true);
    answer.addEventListener('compositionend',()=>{composing=false;justComposed=true;setTimeout(()=>justComposed=false,0);});
    function submit(){
      if(!active()||submitted||composing||justComposed)return;
      if(!answer.value.trim()){feedback.textContent='Bạn hãy nhập hoặc nói một câu trả lời trước nhé.';answer.focus();return;}
      cancel();el<HTMLButtonElement>('record').disabled=false;el<HTMLButtonElement>('stop').disabled=true;
      const result=answerChat(o.progress,o.npc.id,turn.id,answer.value);feedback.textContent=result.reason;
      if(!result.accepted||!result.response)return;
      submitted=true;answer.readOnly=true;el<HTMLButtonElement>('send').disabled=true;el<HTMLButtonElement>('record').disabled=true;
      el('outcome').innerHTML=`<div class="npc-line">${line(result.response.reply)}<button data-chat="reply-listen">Nghe phản hồi</button></div><p class="draft-note">${raw?(answer.value===raw?'Bạn dùng bản chép từ giọng nói.':'Bạn đã chỉnh bản chép trước khi gửi.'):'Bạn trả lời bằng chữ.'} Đã lưu lượt trò chuyện; không chấm điểm phát âm.</p>`;
      el('reply-listen').onclick=()=>play(prefix+'-'+result.response!.intent+'-reply');
      el<HTMLButtonElement>('next').hidden=false;el('next').onclick=()=>result.complete?o.close():render();o.persist();el('next').focus();
    }
    el('send').onclick=submit;answer.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!composing&&!justComposed){e.preventDefault();submit();}};
    el('stop').onclick=()=>{o.recorder.stop();el<HTMLButtonElement>('stop').disabled=true;};
    el('record').onclick=async()=>{
      cancel();const token=generation,draft=changed;el<HTMLButtonElement>('record').disabled=true;feedback.textContent='Đang xin quyền microphone…';
      try{
        await o.recorder.start(blob=>{void (async()=>{
          if(!active()||token!==generation)return;el<HTMLButtonElement>('stop').disabled=true;
          if(recordedUrl)URL.revokeObjectURL(recordedUrl);recordedUrl=URL.createObjectURL(blob);const playback=el<HTMLAudioElement>('playback');playback.src=recordedUrl;playback.hidden=false;
          let context:AudioContext|undefined;
          try{
            context=new AudioContext();const decoded=await context.decodeAudioData(await blob.arrayBuffer());
            if(!active()||token!==generation||draft!==changed)return;
            const pcm=toMono16k(Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i)),decoded.sampleRate);
            if(!hasAudibleSignal(pcm)){feedback.textContent='Bản thu quá nhỏ hoặc im lặng. Hãy thử lại hoặc gõ.';return;}
            feedback.textContent='Đang chép lời tại máy; bạn có thể gõ để tiếp tục.';const text=await o.model.transcribe(pcm);
            if(!active()||token!==generation||draft!==changed)return;
            raw=text;answer.value=text;feedback.textContent='Kiểm tra bản chép rồi bấm Trả lời. Bạn có thể sửa hoặc thu lại.';
          }catch{if(active()&&token===generation&&draft===changed)feedback.textContent='Chưa chép được giọng nói. Bạn có thể tiếp tục bằng cách gõ.';}
          finally{await context?.close();if(active()&&token===generation)el<HTMLButtonElement>('record').disabled=false;}
        })();});
        if(active()&&token===generation){feedback.textContent='Đang thu âm… Bấm Dừng thu khi nói xong.';el<HTMLButtonElement>('stop').disabled=false;}
      }catch{if(active()&&token===generation){feedback.textContent='Chưa dùng được microphone. Bạn có thể gõ câu trả lời.';el<HTMLButtonElement>('record').disabled=false;}}
    };
    answer.focus({preventScroll:true});const dialog=section.closest('dialog');if(dialog)dialog.scrollTop=0;
  }
  render();
  return ()=>{disposed=true;cancel();if(recordedUrl)URL.revokeObjectURL(recordedUrl);const playback=section.querySelector<HTMLAudioElement>('[data-chat="playback"]');playback?.pause();};
}
