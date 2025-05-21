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

// Create mock implementations for crypto-related modules
const createMockImplementation = (moduleName) => {
  console.log(`Creating mock implementation for ${moduleName}`);
  return path.resolve(projectRoot, `./mocks/${moduleName}.js`);
};

// Add Node.js polyfills for React Native
config.resolver.extraNodeModules = {
  path: require.resolve('path-browserify'),
  fs: require.resolve('react-native-fs'),
  os: require.resolve('os-browserify/browser'),
  // Provide safe mock implementations for crypto modules
  crypto: path.resolve(projectRoot, './mocks/crypto.js'),
  'browserify-sign': path.resolve(projectRoot, './mocks/browserify-sign.js'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  events: require.resolve('events'),
  inherits: require.resolve('inherits'),
  process: require.resolve('process/browser'),
  zlib: require.resolve('browserify-zlib'),
  util: require.resolve('util'),
  assert: require.resolve('assert/'),
  // Add workspace packages
  '@mindbuddy/core': path.resolve(workspaceRoot, 'packages/core'),
  '@mindbuddy/ui': path.resolve(workspaceRoot, 'packages/ui')
};

// Don't try to resolve symlinks
config.resolver.disableHierarchicalLookup = true;

// Configure symlink resolution
config.resolver.unstable_enableSymlinks = true;

module.exports = config; 