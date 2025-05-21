import { StorageInterface } from './StorageInterface';
import { Message } from '../message';
import { Profile } from '../types';
import { STORAGE } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('LOCALSTORAGE');

/**
 * Implementation of StorageInterface using browser's localStorage
 * This adapter is for web platforms only
 */
export class LocalStorageAdapter implements StorageInterface {
  constructor() {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available in this environment');
    }
    logger.debug('LocalStorageAdapter initialized');
  }

  async loadLastN(n = STORAGE.DEFAULT_LOAD_COUNT): Promise<Message[]> {
    logger.debug(`Loading last ${n} messages from localStorage`);
    try {
      const raw = localStorage.getItem(STORAGE.MSG_KEY);
      logger.debug("Raw storage data", { raw: raw ? `${raw.substring(0, 50)}...` : null });
      
      const all: Message[] = raw ? JSON.parse(raw) : [];
      logger.debug("Parsed messages", { count: all.length });
      
      const result = all.slice(-n);
      logger.debug("Returning messages", { count: result.length });
      
      return result;
    } catch (error) {
      logger.error("Error loading messages", error);
      return [];
    }
  }

  async saveMessage(m: Message): Promise<void> {
    logger.debug("Saving message", { id: m.id, role: m.role });
    try {
      const raw = localStorage.getItem(STORAGE.MSG_KEY);
      logger.debug("Existing storage data", { exists: !!raw });
      
      const all: Message[] = raw ? JSON.parse(raw) : [];
      logger.debug("Existing message count", { count: all.length });
      
      all.push(m);
      const keep = all.slice(-STORAGE.HARD_LIMIT);
      logger.debug("Updated storage", { newCount: keep.length, trimmed: all.length - keep.length });
      
      localStorage.setItem(STORAGE.MSG_KEY, JSON.stringify(keep));
      logger.debug("Successfully saved message");
    } catch (error) {
      logger.error("Error saving message", error);
    }
  }

  async loadProfile(): Promise<Profile | null> {
    logger.debug("Loading profile");
    try {
      const raw = localStorage.getItem(STORAGE.PROFILE_KEY);
      logger.debug("Raw profile data", { exists: !!raw });
      
      const profile = raw ? JSON.parse(raw) : null;
      logger.debug("Parsed profile", { name: profile?.name });
      
      return profile;
    } catch (error) {
      logger.error("Error loading profile", error);
      return null;
    }
  }

  async saveProfile(p: Profile): Promise<void> {
    logger.debug("Saving profile", { name: p.name });
    try {
      localStorage.setItem(STORAGE.PROFILE_KEY, JSON.stringify(p));
      logger.debug("Successfully saved profile");
    } catch (error) {
      logger.error("Error saving profile", error);
    }
  }
} 