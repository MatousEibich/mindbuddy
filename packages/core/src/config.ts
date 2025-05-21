/**
 * Configuration constants for MindBuddy
 */

export const STORAGE = {
  /** Key for storing messages in storage */
  MSG_KEY: "mindbuddy.messages.v1",
  
  /** Key for storing profile in storage */
  PROFILE_KEY: "mindbuddy.profile.v1",
  
  /** Maximum number of messages to keep in storage */
  HARD_LIMIT: 40,
  
  /** Default number of messages to load */
  DEFAULT_LOAD_COUNT: 20
};

export const LLM = {
  /** Default model to use */
  DEFAULT_MODEL: "gpt-4o",
  
  /** Default temperature */
  DEFAULT_TEMPERATURE: 0
};

export const DEBUG = {
  /** Enable debug logging */
  ENABLED: true
}; 