import { Profile } from "./types";
import { db } from "./db";

// one-row table for now
export async function loadProfile(): Promise<Profile | null> {
  const p = await db.profile.toCollection().first();
  return p ?? null;
}

export async function saveProfile(p: Profile) {
  await db.profile.clear();
  await db.profile.add(p);
} 