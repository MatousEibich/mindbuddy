import { Profile } from "./types";
import { loadProfile as loadProfileStorage, saveProfile as saveProfileStorage } from "./storage/index";
import { createLogger } from "./utils/logger";

const logger = createLogger('PROFILE');

/**
 * Load the profile from storage
 */
export const loadProfileFromStorage = async (): Promise<Profile | null> => {
  logger.debug("Loading profile from storage");
  return loadProfileStorage();
};

/**
 * Save the profile to storage
 */
export const saveProfileToStorage = async (profile: Profile): Promise<void> => {
  logger.debug("Saving profile to storage", { name: profile.name });
  return saveProfileStorage(profile);
}; 