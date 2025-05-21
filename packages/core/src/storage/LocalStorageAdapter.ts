import { StorageInterface } from './StorageInterface';
import { Message } from '../message';
import { Profile } from '../types';
import { STORAGE } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('LOCALSTORAGE');

/**
 * Interface for the minimal localStorage functionality we need
 */
export interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Implementation of StorageInterface using browser's localStorage
 * This adapter is for web platforms only
 */
export class LocalStorageAdapter implements StorageInterface {
  private storage: SimpleStorage;

  constructor(mockStorage?: SimpleStorage) {
    // If mockStorage is provided, use it (for testing)
    if (mockStorage) {
      this.storage = mockStorage;
      logger.debug('LocalStorageAdapter initialized with mock storage');
      return;
    }

    // Otherwise use the real localStorage
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available in this environment');
    }
    this.storage = localStorage;
    logger.debug('LocalStorageAdapter initialized with real localStorage');
  }

  async loadLastN(n = STORAGE.DEFAULT_LOAD_COUNT): Promise<Message[]> {
    logger.debug(`Loading last ${n} messages from storage`);
    try {
      const raw = this.storage.getItem(STORAGE.MSG_KEY);
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
      const raw = this.storage.getItem(STORAGE.MSG_KEY);
      logger.debug("Existing storage data", { exists: !!raw });
      
      const all: Message[] = raw ? JSON.parse(raw) : [];
      logger.debug("Existing message count", { count: all.length });
      
      all.push(m);
      const keep = all.slice(-STORAGE.HARD_LIMIT);
      logger.debug("Updated storage", { newCount: keep.length, trimmed: all.length - keep.length });
      
      this.storage.setItem(STORAGE.MSG_KEY, JSON.stringify(keep));
      logger.debug("Successfully saved message");
    } catch (error) {
      logger.error("Error saving message", error);
    }
  }

  async loadProfile(): Promise<Profile | null> {
    logger.debug("Loading profile");
    try {
      const raw = this.storage.getItem(STORAGE.PROFILE_KEY);
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
      this.storage.setItem(STORAGE.PROFILE_KEY, JSON.stringify(p));
      logger.debug("Successfully saved profile");
    } catch (error) {
      logger.error("Error saving profile", error);
    }
  }
} 