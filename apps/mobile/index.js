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
    debug('REDUCE', `Called on: ${this}, type: ${typeof this}`);
    
    if (this === null || this === undefined) {
      debug('REDUCE', 'Array is null/undefined, returning initial value');
      return initialValue;
    }
    
    var array = Object(this);
    var length = array.length >>> 0;
    var value = initialValue;
    var i = 0;
    
    debug('REDUCE', `Array length: ${length}, initial value: ${initialValue}`);
    
    if (arguments.length < 2) {
      if (length === 0) {
        debug('REDUCE', 'Empty array without initial value, returning undefined');
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
    
    debug('REDUCE', `Reduce completed, result: ${value}`);
    return value;
  };
}

// Import and register the app
try {
  debug('APP', 'Importing React Native');
  const { AppRegistry } = require('react-native');
  
  debug('APP', 'Importing App component');
  const { App } = require('./src');
  
  debug('APP', `App component: ${App}`);
  
  // Important: The component name MUST be 'main' for Expo
  debug('APP', 'Registering component');
  AppRegistry.registerComponent('main', () => App);
  debug('APP', 'App registered successfully');
} catch (e) {
  console.error('[FATAL] Failed to register app:', e);
  console.error('[FATAL] Stack trace:', e.stack);
} 