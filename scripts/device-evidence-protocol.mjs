// Interpret production worker messages without treating initialization as inference.
export function classifyWorkerMessage(data, id, session) {
  if (!data || typeof data !== 'object' || data.id !== id || data.session !== session)
    return { event: 'error', error: 'Malformed or mismatched worker message' };
  if (data.phase === 'progress' && typeof data.file === 'string' && Number.isFinite(data.loaded) && Number.isFinite(data.total) && data.loaded >= 0 && data.total > 0 && data.loaded <= data.total)
    return data.loaded === data.total ? { event: 'asset-read-complete', file: data.file, bytes: data.total } : { event: 'progress', file: data.file, loaded: data.loaded, total: data.total };
  if ((data.phase === 'backend' || data.phase === 'running') && typeof data.backend === 'string' && data.backend.trim())
    return { event: data.phase === 'backend' ? 'backend' : 'inference-start', backend: data.backend };
  if (data.phase === undefined && typeof data.error === 'string' && data.error.trim())
    return { event: 'error', error: data.error };
  if (data.phase === undefined && data.error === undefined && typeof data.text === 'string' && data.text.trim())
    return { event: 'result', output: data.text };
  return { event: 'error', error: 'Malformed worker message or empty result' };
}

export function createWorkerTracker(id, session) {
  let running = false, finished = false;
  return data => {
    if (finished) return null;
    const phase = classifyWorkerMessage(data, id, session);
    if (phase.event === 'inference-start') running = true;
    if (phase.event === 'result' && !running) return (finished = true, { event: 'error', error: 'Result received before inference-start' });
    if (phase.event === 'result' || phase.event === 'error') finished = true;
    return phase;
  };
}
