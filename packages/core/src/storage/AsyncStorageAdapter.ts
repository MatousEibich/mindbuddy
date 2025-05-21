import { StorageInterface } from './StorageInterface';
import { Message } from '../message';
import { Profile } from '../types';
import { STORAGE } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('STORAGE');

/**
 * Implementation of StorageInterface using AsyncStorage
 * This adapter requires AsyncStorage to be passed in, making it platform-agnostic
 */
export class AsyncStorageAdapter implements StorageInterface {
  constructor(private asyncStorage: any) {
    if (!asyncStorage) {
      throw new Error('AsyncStorage instance is required');
    }
    logger.debug('AsyncStorageAdapter initialized');
  }

  async loadLastN(n = STORAGE.DEFAULT_LOAD_COUNT): Promise<Message[]> {
    logger.debug(`Loading last ${n} messages from storage`);
    try {
      const raw = await this.asyncStorage.getItem(STORAGE.MSG_KEY);
      logger.debug("Raw storage data", { 
        raw: typeof raw === 'string' && raw ? `${raw.substring(0, 50)}...` : null,
        type: typeof raw
      });
      
      const all: Message[] = typeof raw === 'string' && raw ? JSON.parse(raw) : [];
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
      const raw = await this.asyncStorage.getItem(STORAGE.MSG_KEY);
      logger.debug("Existing storage data", { 
        exists: !!raw,
        type: typeof raw
      });
      
      const all: Message[] = typeof raw === 'string' && raw ? JSON.parse(raw) : [];
      logger.debug("Existing message count", { count: all.length });
      
      all.push(m);
      const keep = all.slice(-STORAGE.HARD_LIMIT);
      logger.debug("Updated storage", { newCount: keep.length, trimmed: all.length - keep.length });
      
      await this.asyncStorage.setItem(STORAGE.MSG_KEY, JSON.stringify(keep));
      logger.debug("Successfully saved message");
    } catch (error) {
      logger.error("Error saving message", error);
    }
  }

  async loadProfile(): Promise<Profile | null> {
    logger.debug("Loading profile");
    try {
      const raw = await this.asyncStorage.getItem(STORAGE.PROFILE_KEY);
      logger.debug("Raw profile data", { 
        exists: !!raw,
        type: typeof raw
      });
      
      const profile = typeof raw === 'string' && raw ? JSON.parse(raw) : null;
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
      await this.asyncStorage.setItem(STORAGE.PROFILE_KEY, JSON.stringify(p));
      logger.debug("Successfully saved profile");
    } catch (error) {
      logger.error("Error saving profile", error);
    }
  }
} 