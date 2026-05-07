import type { Capsule } from "./types";

/**
 * Tiny IndexedDB wrapper for local capsule storage.
 * Keyed by capsule.id. Capsules with pendingSync=true are still in the
 * sync queue waiting to reach the server.
 */
const DB_NAME = "dropdat";
const DB_VERSION = 1;
const STORE = "capsules";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
        store.createIndex("pendingSync", "pendingSync");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    Promise.resolve(fn(store)).then(
      (val) => {
        t.oncomplete = () => resolve(val);
        t.onerror = () => reject(t.error);
      },
      reject
    );
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const capsuleStore = {
  async put(c: Capsule) {
    return tx("readwrite", (s) => reqToPromise(s.put(c)));
  },
  async get(id: string): Promise<Capsule | undefined> {
    return tx("readonly", async (s) => (await reqToPromise<Capsule | undefined>(s.get(id))) ?? undefined);
  },
  async all(): Promise<Capsule[]> {
    return tx("readonly", (s) => reqToPromise<Capsule[]>(s.getAll()));
  },
  async pendingSync(): Promise<Capsule[]> {
    const all = await this.all();
    return all.filter((c) => c.pendingSync);
  },
  async markSynced(id: string) {
    const c = await this.get(id);
    if (!c) return;
    delete c.pendingSync;
    await this.put(c);
  },
  async delete(id: string) {
    return tx("readwrite", (s) => reqToPromise(s.delete(id)));
  },
};
