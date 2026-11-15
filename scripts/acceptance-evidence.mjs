// Diagnostic capture: retain payloads, including requests blocked by routing.
// These traces can contain sensitive input and must stay local.
export function captureRequests(context) {
  const requests = [], pending = new Set(), errors = [];
  const entries = new WeakMap();
  const track = promise => { pending.add(promise); promise.finally(() => pending.delete(promise)); };
  context.on('request', request => {
    const entry = { at: new Date().toISOString(), url: request.url(), method: request.method(), status: 'started' };
    if(request.serviceWorker) entry.initiator=request.serviceWorker()?'service-worker':'frame-or-dedicated-worker';
    requests.push(entry); entries.set(request, entry);
    track((async () => {
      try {
        const body = request.postDataBuffer();
        entry.bodyBytes = body?.length ?? 0;
        entry.bodyBase64 = body?.toString('base64') ?? null;
        entry.headers = await request.headersArray();
        const declared=entry.headers.find(h=>h.name.toLowerCase()==='content-length');
        if(declared && (!/^\d+$/.test(declared.value)||Number(declared.value)!==entry.bodyBytes))throw Error('Captured body length differs from Content-Length');
        if(!body && entry.headers.some(h=>h.name.toLowerCase()==='content-type'&&/multipart\/form-data/i.test(h.value)))throw Error('Multipart body unavailable');
      } catch (error) { entry.captureError = String(error); errors.push(entry.captureError); }
    })());
  });
  context.on('requestfinished', request => { const entry = entries.get(request); if (entry) {entry.status = 'finished'; entry.finishedAt=new Date().toISOString();} });
  context.on('requestfailed', request => { const entry = entries.get(request); if (entry) { entry.status = 'failed'; entry.failure = request.failure()?.errorText ?? 'unknown'; } });
  return { requests, errors, async flush() { while (pending.size) await Promise.all([...pending]); } };
}

// Refuse incomplete/invalid phases before calculating a nearest-rank p95.
export function benchmarkSummary(cold,warmups,samples,limitMs,profile={warmups:3,samples:20}){
  const valid=r=>r&&!r.error&&Number.isFinite(r.initMs)&&r.initMs>=0&&Number.isFinite(r.inferenceMs)&&r.inferenceMs>=0;
  if(!Number.isInteger(profile.warmups)||profile.warmups<2||!Number.isInteger(profile.samples)||profile.samples<12||!valid(cold)||warmups.length!==profile.warmups||samples.length!==profile.samples||!warmups.every(valid)||!samples.every(valid))return {status:'incomplete',p95Ms:null,latencyWithinLimit:null};
  const p95Ms=samples.map(x=>x.inferenceMs).sort((a,b)=>a-b)[Math.ceil(.95*samples.length)-1];
  return {status:'measured',p95Ms,latencyWithinLimit:p95Ms<=limitMs};
}
