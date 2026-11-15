import {migrateChapter,newChapter,validChapter,type ChapterSave} from './engine.ts';
export class ChapterStore {
  private db!:IDBDatabase;
  async open():Promise<ChapterSave>{
    this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('jiangnan-chapter',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    const stored=await new Promise<ChapterSave|undefined>((resolve,reject)=>{const tx=this.db.transaction('state','readwrite'),store=tx.objectStore('state'),r=store.get('current');let result:ChapterSave|undefined;
      r.onsuccess=()=>{if(r.result===undefined)result=undefined;else if(validChapter(r.result))result=r.result;else{const b=store.get('backup');b.onsuccess=()=>{if(!validChapter(b.result)){tx.abort();return;}result=b.result;store.put(result,'current');};}};
      tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(Error('Bản lưu và bản dự phòng đều không hợp lệ; hãy nhập bản đã xuất.'));tx.onerror=()=>reject(tx.error);});
    if(stored)return stored;
    // Read the original M1 database without overwriting it or creating a new one.
    if(indexedDB.databases && (await indexedDB.databases()).some(db=>db.name==='jiangnan-m1')){
      const old=await new Promise<unknown>((resolve,reject)=>{const r=indexedDB.open('jiangnan-m1');r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('save')){db.close();resolve(undefined);return;}const tx=db.transaction('save'),q=tx.objectStore('save').get('current');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);tx.oncomplete=()=>db.close();};r.onerror=()=>reject(r.error);});
      if(old!==undefined)return migrateChapter(old);
    }
    return newChapter();
  }
  async save(snapshot:ChapterSave):Promise<ChapterSave>{
    if(!validChapter(snapshot))throw Error('Không ghi dữ liệu sai schema.');
    return new Promise((resolve,reject)=>{const tx=this.db.transaction('state','readwrite'),store=tx.objectStore('state'),r=store.get('current');const next=structuredClone(snapshot);let conflict=false;
      r.onsuccess=()=>{if(r.result!==undefined&&(!validChapter(r.result)||r.result.revision!==snapshot.revision)){conflict=true;tx.abort();return;}if(r.result!==undefined)store.put(r.result,'backup');next.revision++;store.put(next,'current');};
      tx.oncomplete=()=>resolve(next);tx.onabort=()=>reject(Error(conflict?'Bản lưu đã đổi ở cửa sổ khác. Hãy xuất phiên này rồi tải lại để tránh ghi đè.':'Không thể lưu; hãy xuất JSON để giữ tiến độ.'));tx.onerror=()=>reject(tx.error);});
  }
  async importJSON(text:string):Promise<ChapterSave>{
    if(text.length>2*1024*1024)throw Error('Bản lưu quá lớn.');const next=migrateChapter(JSON.parse(text));
    return new Promise((resolve,reject)=>{const tx=this.db.transaction('state','readwrite'),store=tx.objectStore('state'),r=store.get('current');r.onsuccess=()=>{if(validChapter(r.result)){store.put(r.result,'backup');next.revision=r.result.revision+1;}else next.revision++;store.put(next,'current');};tx.oncomplete=()=>resolve(next);tx.onabort=()=>reject(tx.error);tx.onerror=()=>reject(tx.error);});
  }
  exportJSON(s:ChapterSave){if(!validChapter(s))throw Error('Bản lưu không hợp lệ.');return JSON.stringify(s,null,2);}
}
