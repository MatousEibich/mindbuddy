export * from './StorageInterface';
export * from './AsyncStorageAdapter';
export * from './LocalStorageAdapter';

// Re-export functions to maintain backward compatibility
import { StorageInterface } from './StorageInterface';
import { STORAGE } from '../config';

// Default storage instance to be set by platform-specific code
let _defaultStorage: StorageInterface | null = null;

/**
 * Set the default storage implementation
 */
export function setDefaultStorage(storage: StorageInterface) {
  _defaultStorage = storage;
}

/**
 * Get the default storage implementation
 */
export function getDefaultStorage(): StorageInterface {
  if (!_defaultStorage) {
    throw new Error('Default storage not set. Call setDefaultStorage first.');
  }
  return _defaultStorage;
}

/**
 * Load the last N messages (compatibility function)
 */
export async function loadLastN(n = STORAGE.DEFAULT_LOAD_COUNT) {
  return getDefaultStorage().loadLastN(n);
}

/**
 * Save a message (compatibility function)
 */
export async function saveMessage(message: any) {
  return getDefaultStorage().saveMessage(message);
}

/**
 * Load profile (compatibility function)
 */
export async function loadProfile() {
  return getDefaultStorage().loadProfile();
}

/**
 * Save profile (compatibility function)
 */
export async function saveProfile(profile: any) {
  return getDefaultStorage().saveProfile(profile);
} 