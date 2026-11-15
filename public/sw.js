/* Cache only the verified static play bundle. AI caches and saves stay separate. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
let preparation=Promise.resolve();
self.addEventListener('message',event=>{
  if(event.data?.type!=='prepare-offline')return;
  preparation=preparation.catch(()=>{}).then(async()=>{
    let target;
    try{
      const response=await fetch('/offline-assets.json',{cache:'no-store'});if(!response.ok)throw Error('Missing offline manifest');
      const manifest=await response.json();target='jiangnan-world-'+manifest.version;const cache=await caches.open(target);
      if(await cache.match('/__offline_ready__')){event.ports[0]?.postMessage({ok:true});return;}
      for(const item of manifest.files){
        const response=await fetch(item.url,{cache:'no-store'});if(!response.ok)throw Error('Missing static asset');
        const bytes=await response.clone().arrayBuffer();
        const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
        if(bytes.byteLength!==item.bytes||digest!==item.sha256)throw Error('Static integrity mismatch');
        await cache.put(item.url,response);
      }
      await cache.put('/',await cache.match('/index.html'));
      await cache.put('/__offline_ready__',new Response('ready'));
      for(const name of await caches.keys())if(name.startsWith('jiangnan-world-')&&name!==target)await caches.delete(name);
      event.ports[0]?.postMessage({ok:true});
    }catch(error){if(target)await caches.delete(target);event.ports[0]?.postMessage({ok:false,error:String(error)});}
  });
  event.waitUntil(preparation);
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.search||/^\/(models|runtime)\//.test(url.pathname))return;
  event.respondWith((async()=>{
    const names=(await caches.keys()).filter(n=>n.startsWith('jiangnan-world-'));
    for(const name of names){const cache=await caches.open(name);if(!await cache.match('/__offline_ready__'))continue;const cached=await cache.match(url.pathname);if(cached)return cached;}
    return fetch(event.request);
  })());
});
