const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add watchFolders pointing to repo root
config.watchFolders = [path.resolve(__dirname, '../..')];

// Add Node.js polyfills for React Native
config.resolver.extraNodeModules = {
  path: require.resolve('path-browserify'),
  fs: require.resolve('react-native-fs'),
  os: require.resolve('os-browserify/browser'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  events: require.resolve('events'),
  inherits: require.resolve('inherits'),
  process: require.resolve('process/browser'),
  zlib: require.resolve('browserify-zlib'),
  util: require.resolve('util'),
  assert: require.resolve('assert/'),
};

module.exports = config; 