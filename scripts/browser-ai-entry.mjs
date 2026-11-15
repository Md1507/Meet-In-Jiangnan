// Diagnostic entry only. Vite bundles the unmodified production implementations.
import {ModelManager} from '../src/ai/ModelManager.ts';
import {toMono16k} from '../src/audio/pcm.ts';
import {LocalRecorder} from '../src/audio/recorder.ts';
window.diagnostic={ModelManager,toMono16k,LocalRecorder,workerUrl:new URL('../src/ai/model.worker.ts',import.meta.url).href};
