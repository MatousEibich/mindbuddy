// Simple test script to verify core functionality
import { createLogger } from "./utils/logger";
import { STORAGE } from "./config";
import { Profile } from "./types";

const logger = createLogger('TEST');

logger.info("MindBuddy Core Test Script");
logger.info("-------------------------");
logger.info(`Storage default load count: ${STORAGE.DEFAULT_LOAD_COUNT}`);
logger.info(`Storage message key: ${STORAGE.MSG_KEY}`);

// Test profile
const profile: Profile = {
  name: "Test User",
  pronouns: "they/them",
  style: "middle",
  core_facts: [
    { id: 1, text: "This is a test fact" }
  ]
};

logger.info(`Profile name: ${profile.name}`);
logger.info(`Profile style: ${profile.style}`);

logger.info("Test completed successfully!");

// This will be compiled as part of the core package build 