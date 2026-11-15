import {openNearbyChapterTopic} from './diagnostic-faults.mjs';
// Automation only: replace the microphone boundary, keep the production
// LocalRecorder, chapter callback, decode/resampling and ASR worker unchanged.
export function installSyntheticAudio({canary=false}={}) {
  if(!navigator.mediaDevices)return; // Initial about:blank has no media boundary.
  const log=window.syntheticAudio={kind:'synthetic-oscillator-not-physical-microphone',events:[],streams:[],workers:[]};
  const record=(type,data={})=>log.events.push({...data,type});
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async constraints=>{
    record('synthetic-getUserMedia',{constraints});
    const context=new AudioContext(),destination=context.createMediaStreamDestination(),oscillator=context.createOscillator();
    oscillator.frequency.value=440;oscillator.connect(destination);oscillator.start();await context.resume();
    log.streams.push(destination.stream);
    const track=destination.stream.getAudioTracks()[0],stop=track.stop.bind(track);
    let stopped=false;
    track.stop=()=>{stop();if(!stopped){stopped=true;oscillator.stop();void context.close();}};
    return destination.stream;
  }});
  const Recorder=window.MediaRecorder;
  window.MediaRecorder=new Proxy(Recorder,{construct(Target,args){
    const recorder=new Target(...args);
    for(const type of ['start','dataavailable','stop','error'])recorder.addEventListener(type,event=>record('recorder-'+type,{bytes:event.data?.size,mime:recorder.mimeType}));
    return recorder;
  }});
  const decode=BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData=function(bytes,...args){
    record('callback-decode',{bytes:bytes.byteLength});
    // Negative regression only: attempted leakage must remain in the trace.
    if(canary)log.canary=fetch('/?recording=callback-canary',{method:'POST',headers:{'x-audio-canary':'callback-secret'},body:bytes.slice(0,32)}).catch(()=>{});
    return decode.call(this,bytes,...args);
  };
  const WorkerClass=window.Worker;
  window.Worker=new Proxy(WorkerClass,{construct(Target,args){
    const worker=new Target(...args),send=worker.postMessage.bind(worker);
    let transcribing=false;
    worker.postMessage=(message,...rest)=>{
      if(message?.kind==='transcribe'){transcribing=true;record('production-transcribe',{samples:message.input?.length,pcmType:message.input?.constructor?.name});}
      return send(message,...rest);
    };
    worker.addEventListener('message',event=>{
      if(transcribing&&(event.data.error||Object.hasOwn(event.data,'text')))record('production-asr-result',{error:event.data.error??null,text:event.data.text??null});
    });
    return worker;
  }});
}

export async function runSyntheticChapterAudio(page,origin) {
  await page.addInitScript(installSyntheticAudio,{canary:false});
  await page.goto(origin);await page.waitForSelector('#chapter-canvas canvas');
  await openNearbyChapterTopic(page,'Nhận phòng');
  await page.click('#chapter-record');
  await page.waitForFunction(()=>window.syntheticAudio.events.some(e=>e.type==='recorder-start'));
  await page.waitForTimeout(1000);await page.click('#chapter-stop');
  await page.waitForFunction(()=>window.syntheticAudio.events.some(e=>e.type==='production-asr-result')||/Không chép|im lặng|Không dùng được mic/.test(document.querySelector('#chapter-feedback')?.textContent??''),null,{timeout:180000});
  const result=await page.evaluate(()=>({kind:window.syntheticAudio.kind,events:window.syntheticAudio.events,tracksStopped:window.syntheticAudio.streams.length>0&&window.syntheticAudio.streams.every(s=>s.getTracks().every(t=>t.readyState==='ended')),playbackBlob:document.querySelector('#chapter-playback')?.src.startsWith('blob:'),feedback:document.querySelector('#chapter-feedback')?.textContent,answer:document.querySelector('#chapter-answer')?.value}));
  const events=result.events,asr=events.find(e=>e.type==='production-asr-result');
  result.completed=['synthetic-getUserMedia','recorder-start','recorder-dataavailable','recorder-stop','callback-decode','production-transcribe'].every(type=>events.some(e=>e.type===type))&&result.tracksStopped&&result.playbackBlob&&!!asr&&!asr.error&&/Hãy kiểm tra bản chép/.test(result.feedback);
  result.limitation='Synthetic stream through actual chapter recorder/callback/PCM/ASR; no physical microphone, speaker acceptance or OS IME';
  return result;
}
