export type Role = "user" | "assistant";

export interface Message {
  id: string;          // Generated with uuid v4
  role: Role;
  content: string;
  ts: number;          // Date.now()
} 