import { createServer } from 'vite';
const server=await createServer({server:{host:'127.0.0.1',port:4173,strictPort:true}});
try { await server.listen(); await import('../tests/browser-flow.mjs'); await import('../tests/review6-flow.mjs'); await import('../tests/chapter-flow.mjs'); await import('../tests/stroke-guide-flow.mjs'); } finally { await server.close(); }
