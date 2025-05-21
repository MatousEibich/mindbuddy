export * from './StorageMemory';

// Re-export functions to maintain backward compatibility
import { StorageMemory } from './StorageMemory';
import { Profile } from '../types';
import { getDefaultStorage } from '../storage/index';

// Default memory instance
let _defaultMemory: StorageMemory | null = null;

/**
 * Initialize the default memory with a profile
 */
export function initializeMemory(profile: Profile): StorageMemory {
  _defaultMemory = new StorageMemory(getDefaultStorage(), profile);
  return _defaultMemory;
}

/**
 * Get the default memory instance
 */
export function getDefaultMemory(): StorageMemory {
  if (!_defaultMemory) {
    throw new Error('Default memory not initialized. Call initializeMemory first.');
  }
  return _defaultMemory;
} 