import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuid } from "uuid";
import { Message } from "./message";
import { Thread } from "./types";

/* ───────── storage keys ───────── */
const THREAD_LIST_KEY = "mindbuddy.threads";
const threadMessagesKey = (id: string) => `mindbuddy.thread.${id}`;

/* ───────── meta list ───────── */
export async function listThreads(): Promise<Thread[]> {
  const raw = await AsyncStorage.getItem(THREAD_LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function createThread(name: string): Promise<Thread> {
  const thread: Thread = { id: uuid(), name, created: Date.now() };
  const all = await listThreads();
  await AsyncStorage.multiSet([
    [THREAD_LIST_KEY, JSON.stringify([...all, thread])],
    [threadMessagesKey(thread.id), JSON.stringify([])],
  ]);
  return thread;
}

export async function renameThread(id: string, newName: string) {
  const all = await listThreads();
  const next = all.map((t) => (t.id === id ? { ...t, name: newName } : t));
  await AsyncStorage.setItem(THREAD_LIST_KEY, JSON.stringify(next));
}

export async function deleteThread(id: string) {
  const all = (await listThreads()).filter((t) => t.id !== id);
  await AsyncStorage.multiRemove([THREAD_LIST_KEY, threadMessagesKey(id)]);
  await AsyncStorage.setItem(THREAD_LIST_KEY, JSON.stringify(all));
}

/* ───────── message helpers ───────── */
export async function loadThreadMessages(id: string): Promise<Message[]> {
  const raw = await AsyncStorage.getItem(threadMessagesKey(id));
  return raw ? JSON.parse(raw) : [];
}

export async function appendThreadMessages(id: string, msgs: Message[]) {
  const current = await loadThreadMessages(id);
  await AsyncStorage.setItem(
    threadMessagesKey(id),
    JSON.stringify([...current, ...msgs])
  );
} 