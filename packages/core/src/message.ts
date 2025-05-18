export type Role = "user" | "assistant";

export interface Message {
  id: string;          // `crypto.randomUUID()`
  role: Role;
  content: string;
  ts: number;          // Date.now()
} 