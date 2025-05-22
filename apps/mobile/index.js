/**
 * Main entry point for MindBuddy mobile app
 */

// Setup global variables needed to prevent crashes
if (typeof global.process === 'undefined') {
  global.process = { browser: false, env: {} };
} else {
  global.process.browser = false;
}

// Create a simple debug log function
const DEBUG = true;
const debug = (tag, msg) => {
  if (DEBUG) {
    console.log(`[${tag}] ${msg}`);
  }
};

debug('INIT', 'Starting MindBuddy mobile app');

// Polyfill Array.prototype.reduce since it's causing problems
if (!Array.prototype.reduce || global.__patchReduce) {
  debug('PATCH', 'Adding Array.reduce polyfill');
  Array.prototype.reduce = function(callback, initialValue) {
    if (this === null || this === undefined) {
      return initialValue;
    }
    
    var array = Object(this);
    var length = array.length >>> 0;
    var value = initialValue;
    var i = 0;
    
    if (arguments.length < 2) {
      if (length === 0) {
        return undefined;
      }
      value = array[0];
      i = 1;
    }
    
    for (; i < length; i++) {
      if (i in array) {
        value = callback(value, array[i], i, array);
      }
    }
    
    return value;
  };
}

// Import and register the app
try {
  debug('APP', 'Registering React component');
  const { AppRegistry } = require('react-native');
  const { App } = require('./src');
  
  // Important: The component name MUST be 'main' for Expo
  AppRegistry.registerComponent('main', () => App);
  debug('APP', 'App registered successfully');
} catch (e) {
  console.error('[FATAL] Failed to register app:', e);
} 