import { openDB } from 'idb';
import type { Board } from '../types/board';

const DB_NAME = 'mathboard-studio';
const STORE = 'boards';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' });
    },
  });
}

export async function saveBoard(board: Board) {
  const db = await getDb();
  await db.put(STORE, board);
}

export async function loadBoard(id: string): Promise<Board | undefined> {
  const db = await getDb();
  return db.get(STORE, id);
}

export async function listBoards(): Promise<Board[]> {
  const db = await getDb();
  return db.getAll(STORE);
}
