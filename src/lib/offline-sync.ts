import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GameTrackerDB extends DBSchema {
  'offline-events': {
    key: string; // The offline ID
    value: {
      id: string; // The offline ID (UUID)
      url: string;
      method: string;
      body: string;
      timestamp: number;
    };
    indexes: {
      'by-timestamp': number;
    };
  };
}

const DB_NAME = 'GameTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline-events';

let dbPromise: Promise<IDBPDatabase<GameTrackerDB>> | null = null;

// Initialize the database only in the browser
if (typeof window !== 'undefined') {
  dbPromise = openDB<GameTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
}

/**
 * Saves a failed event request to IndexedDB for later synchronization.
 */
export async function saveOfflineEvent(
  id: string,
  url: string,
  method: string,
  body: string,
): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put(STORE_NAME, {
    id,
    url,
    method,
    body,
    timestamp: Date.now(),
  });
}

/**
 * Retrieves all offline events, sorted by timestamp (oldest first).
 */
export async function getOfflineEvents() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
}

/**
 * Removes an event from IndexedDB after it has been successfully synchronized.
 */
export async function deleteOfflineEvent(id: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
}

/**
 * Clears all offline events from the database.
 */
export async function clearOfflineEvents(): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.clear(STORE_NAME);
}
