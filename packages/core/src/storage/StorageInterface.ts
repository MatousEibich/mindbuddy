import { Message } from "../message";
import { Profile } from "../types";

/**
 * Storage interface for platform-agnostic data persistence
 */
export interface StorageInterface {
  /**
   * Load the last N messages from storage
   */
  loadLastN(n: number): Promise<Message[]>;
  
  /**
   * Save a message to storage
   */
  saveMessage(message: Message): Promise<void>;
  
  /**
   * Load the user profile
   */
  loadProfile(): Promise<Profile | null>;
  
  /**
   * Save the user profile
   */
  saveProfile(profile: Profile): Promise<void>;
} 