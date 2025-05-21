import type { Profile } from "@mindbuddy/core";

// Temporary placeholder functions to work around linter errors
// These will use localStorage directly until the core package is fully built

const PROFILE_KEY = "mindbuddy.profile.v1";

/**
 * Load profile from localStorage
 */
export async function loadProfileFromStorage(): Promise<Profile | null> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error loading profile:", error);
    return null;
  }
}

/**
 * Save profile to localStorage
 */
export async function saveProfileToStorage(profile: Profile): Promise<void> {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving profile:", error);
  }
} 