export interface ScenarioContext {id:string;goal:string;positive:string[];negative:string[]}
export class ModelManager {
  onProgress: ((file:string,loaded:number,total:number)=>void) | null = null;
  lastBackend: string | null = null;
  private readonly makeWorker: () => Worker;
  constructor(makeWorker: () => Worker = () => new Worker(new URL('./model.worker.ts', import.meta.url), {type:'module'})) { this.makeWorker = makeWorker; }
  private worker: Worker | null = null;
  private session = 0;
  private pending: { reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  cancel(): void {
    this.session++;
    this.worker?.terminate(); this.worker = null;
    const pending = this.pending; this.pending = null;
    if (pending) { clearTimeout(pending.timer); pending.reject(new Error('Đã hủy')); }
  }
  private run(kind: 'transcribe' | 'evaluate', input: Float32Array | string | {text:string;scenario:ScenarioContext}): Promise<string> {
    this.cancel(); const session = this.session, id = crypto.randomUUID();
    const worker = this.worker = this.makeWorker();
    return new Promise((resolve, reject) => {
      const finish = (error?: Error, text?: string) => {
        if (session !== this.session || this.worker !== worker) return;
        if (this.pending) clearTimeout(this.pending.timer);
        this.pending = null; this.worker = null; worker.terminate();
        error ? reject(error) : resolve(text ?? '');
      };
      const timer = setTimeout(() => finish(new Error('Model quá thời gian tải')), 120000);
      this.pending = {reject, timer};
      worker.onmessage = e => {
        if (session !== this.session || this.worker !== worker || e.data.id !== id || e.data.session !== session) return;
        if (e.data.phase === 'progress') { this.onProgress?.(e.data.file,e.data.loaded,e.data.total);return; }
        if (e.data.phase === 'backend') { this.lastBackend=typeof e.data.backend==='string'?e.data.backend:null;return; }
        if (e.data.phase === 'running') { this.lastBackend=typeof e.data.backend==='string'?e.data.backend:null;if (this.pending) { clearTimeout(this.pending.timer); this.pending.timer = setTimeout(() => finish(new Error('Model quá thời gian suy luận')), 20000); } return; }
        finish(e.data.error ? new Error(e.data.error) : undefined, String(e.data.text ?? ''));
      };
      worker.onerror = () => finish(new Error('Lỗi worker'));
      worker.postMessage({id, session, kind, input});
    });
  }
  transcribe(audio: Float32Array): Promise<string> { return this.run('transcribe', audio); }
  evaluate(text: string,scenario?:ScenarioContext): Promise<string> { return this.run('evaluate',scenario?{text,scenario}:text); }
}
