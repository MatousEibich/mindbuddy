import Dexie, { Table } from "dexie";
import { Message } from "./message";

class MindBuddyDB extends Dexie {
  messages!: Table<Message, string>;
  constructor() {
    super("mindbuddy.v1");
    this.version(1).stores({ messages: "id, ts" });
  }
}
export const db = new MindBuddyDB();

/** keep last N (default 20) */
export async function loadLastN(n = 20): Promise<Message[]> {
  return db.messages.orderBy("ts").reverse().limit(n).toArray().then(r => r.reverse());
}

export async function saveMessage(msg: Message) {
  await db.messages.put(msg);
  // hard-trim here so DB never balloons
  const extra = await db.messages.count() - 40;
  if (extra > 0) await db.messages.orderBy("ts").limit(extra).delete();
} 