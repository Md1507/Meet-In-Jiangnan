/** A single local microphone recording. Audio is returned in memory only. */
export class LocalRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending = false;
  private generation = 0;

  async start(onRecording = this.onRecording): Promise<void> {
    if (this.pending || this.recorder) throw new Error('Recording already active');
    this.pending = true;
    const generation = ++this.generation;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== this.generation) {
        throw new Error('Recording cancelled');
      }
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.addEventListener('dataavailable', event => { if (event.data.size) chunks.push(event.data); });
      this.stream = stream;
      this.recorder = recorder;
      recorder.addEventListener('stop', () => {
        if (this.recorder === recorder) this.cleanup();
        if (generation === this.generation) onRecording?.(new Blob(chunks, { type: recorder.mimeType }));
      }, { once: true });
      recorder.addEventListener('error', () => { if (this.recorder === recorder) this.cleanup(); }, { once: true });
      recorder.start();
      this.timer = setTimeout(() => this.stop(), 20_000);
    } catch (error) {
      if (stream && this.stream !== stream) stream.getTracks().forEach(track => track.stop());
      this.cleanup();
      throw error;
    } finally {
      this.pending = false;
    }
  }

  onRecording: ((audio: Blob) => void) | null = null;

  cancel(): void {
    ++this.generation;
    this.stop();
  }

  stop(): void {
    if (this.pending && !this.recorder) ++this.generation;
    const recorder = this.recorder;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    this.cleanup();
  }

  private cleanup(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.recorder = null;
  }
}
