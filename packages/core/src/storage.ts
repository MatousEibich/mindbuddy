import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message } from "./message";
import { Profile } from "./types";

const MSG_KEY = "mindbuddy.messages.v1";
const PROFILE_KEY = "mindbuddy.profile.v1";
const HARD_LIMIT = 40;

// Debug log function
const debug = (message: string, data?: any) => {
  const logMessage = data ? `${message}: ${JSON.stringify(data, null, 2)}` : message;
  console.log(`[STORAGE DEBUG] ${logMessage}`);
};

export async function loadLastN(n = 20): Promise<Message[]> {
  debug(`Loading last ${n} messages from storage`);
  try {
    const raw = await AsyncStorage.getItem(MSG_KEY);
    debug("Raw storage data", { raw: raw ? `${raw.substring(0, 50)}...` : null });
    
    const all: Message[] = raw ? JSON.parse(raw) : [];
    debug("Parsed messages", { count: all.length });
    
    const result = all.slice(-n);
    debug("Returning messages", { count: result.length });
    
    return result;
  } catch (error) {
    debug("Error loading messages", { error: String(error) });
    console.error("[STORAGE] Error loading messages:", error);
    return [];
  }
}

export async function saveMessage(m: Message) {
  debug("Saving message", { id: m.id, role: m.role });
  try {
    const raw = await AsyncStorage.getItem(MSG_KEY);
    debug("Existing storage data", { exists: !!raw });
    
    const all: Message[] = raw ? JSON.parse(raw) : [];
    debug("Existing message count", { count: all.length });
    
    all.push(m);
    const keep = all.slice(-HARD_LIMIT);
    debug("Updated storage", { newCount: keep.length, trimmed: all.length - keep.length });
    
    await AsyncStorage.setItem(MSG_KEY, JSON.stringify(keep));
    debug("Successfully saved message");
  } catch (error) {
    debug("Error saving message", { error: String(error) });
    console.error("[STORAGE] Error saving message:", error);
  }
}

export async function loadProfile(): Promise<Profile | null> {
  debug("Loading profile");
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    debug("Raw profile data", { exists: !!raw });
    
    const profile = raw ? JSON.parse(raw) : null;
    debug("Parsed profile", { name: profile?.name });
    
    return profile;
  } catch (error) {
    debug("Error loading profile", { error: String(error) });
    console.error("[STORAGE] Error loading profile:", error);
    return null;
  }
}

export async function saveProfile(p: Profile) {
  debug("Saving profile", { name: p.name });
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    debug("Successfully saved profile");
  } catch (error) {
    debug("Error saving profile", { error: String(error) });
    console.error("[STORAGE] Error saving profile:", error);
  }
} 