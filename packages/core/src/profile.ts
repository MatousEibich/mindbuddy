import { Profile } from "./types";
import { loadProfile as loadProfileAsync, saveProfile as saveProfileAsync } from "./storage";

export const loadProfile = loadProfileAsync;
export const saveProfile = saveProfileAsync; 