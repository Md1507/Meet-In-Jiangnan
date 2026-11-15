// Serialized into the page by Playwright. Never create or upgrade application storage.
export async function readChapterState() {
  if (!indexedDB.databases) throw Error('IndexedDB enumeration unavailable; observation incomplete');
  if (!(await indexedDB.databases()).some(x => x.name === 'jiangnan-chapter')) return {status:'not-created'};
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('jiangnan-chapter');
    request.onupgradeneeded = () => { request.transaction.abort(); reject(Error('Database disappeared; observer aborted creation')); };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('state')) { db.close(); resolve({status:'missing-store'}); return; }
      const tx = db.transaction('state','readonly'), get = tx.objectStore('state').get('current');
      tx.oncomplete = () => { db.close(); resolve({status:get.result ? 'snapshot' : 'empty',value:get.result??null,at:new Date().toISOString()}); };
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error??Error('Readonly transaction aborted')); };
    };
  });
}
