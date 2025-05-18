import { Message } from "./message";

const KEY = "mindbuddy.history.v1";
const LIMIT = 20;                       // keep last 20 turns

export function loadHistory(): Message[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Message[];
  } catch {
    return [];
  }
}

export function saveMessage(msg: Message) {
  if (typeof localStorage === "undefined") return;
  const all = [...loadHistory(), msg].slice(-LIMIT);
  localStorage.setItem(KEY, JSON.stringify(all));
} 