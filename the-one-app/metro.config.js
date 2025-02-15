const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root directory
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Add the micro-apps directory to the watch folders
config.watchFolders = [
  ...config.watchFolders || [],
  path.resolve(workspaceRoot, 'micro-apps'),
];

// Configure extra node_modules to look for dependencies
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add any additional module paths
config.resolver.extraNodeModules = {
  '@react-navigation/native': path.resolve(projectRoot, 'node_modules/@react-navigation/native'),
  '@react-navigation/native-stack': path.resolve(projectRoot, 'node_modules/@react-navigation/native-stack'),
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-safe-area-context': path.resolve(projectRoot, 'node_modules/react-native-safe-area-context'),
  'react-native-screens': path.resolve(projectRoot, 'node_modules/react-native-screens'),
};

module.exports = config; 