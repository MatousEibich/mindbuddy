const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Create a custom configuration based on expo defaults
const config = getDefaultConfig(projectRoot);

// Add workspace root to watch folders for monorepo setup
config.watchFolders = [workspaceRoot];

// Explicitly set the entry file
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];
config.resolver.resolverMainFields = ['browser', 'main'];

// Ensure we resolve node modules from the root for monorepo setup
config.resolver.resolveNodeModulesAtRoot = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

// Add Node.js polyfills for React Native - simplified approach
config.resolver.extraNodeModules = {
  // Essential polyfills
  buffer: require.resolve('buffer'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  process: require.resolve('process/browser'),
  
  // Use empty-module for problematic crypto dependencies that cause bundling issues
  'crypto-js': require.resolve('empty-module'),
  'node:crypto': require.resolve('empty-module'),
  'browserify-sign': require.resolve('empty-module'),
  'create-hmac': require.resolve('empty-module'),
  'pbkdf2': require.resolve('empty-module'),
  'randombytes': require.resolve('empty-module'),
  'ripemd160': require.resolve('empty-module'),
  'sha.js': require.resolve('empty-module'),
  
  // Other Node.js polyfills
  path: require.resolve('path-browserify'),
  fs: require.resolve('empty-module'), // React Native doesn't support fs
  os: require.resolve('os-browserify/browser'),
  events: require.resolve('events'),
  inherits: require.resolve('inherits'),
  zlib: require.resolve('browserify-zlib'),
  util: require.resolve('util'),
  assert: require.resolve('assert/'),
  
  // Add workspace packages
  '@mindbuddy/core': path.resolve(workspaceRoot, 'packages/core'),
  '@mindbuddy/ui': path.resolve(workspaceRoot, 'packages/ui')
};

// Don't try to resolve symlinks for stability
config.resolver.disableHierarchicalLookup = true;

// Configure symlink resolution
config.resolver.unstable_enableSymlinks = true;

module.exports = config; 