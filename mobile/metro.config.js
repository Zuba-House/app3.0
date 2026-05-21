// Learn more https://docs.expo.io/guides/customizing-metro
const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Optional @expo/ngrok-bin platform packages are listed in package-lock but often
// not installed on Windows/OneDrive. Metro's file watcher crashes if those paths are missing.
const ngrokOptionalPlatforms = [
  'darwin-arm64',
  'darwin-x64',
  'freebsd-ia32',
  'freebsd-x64',
  'linux-arm',
  'linux-arm64',
  'linux-ia32',
  'linux-x64',
  'sunos-x64',
  'win32-ia32',
];
for (const platform of ngrokOptionalPlatforms) {
  const dir = path.join(__dirname, 'node_modules', '@expo', `ngrok-bin-${platform}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Broken npm temp folders on OneDrive can crash Metro's file watcher.
config.resolver.blockList = [/node_modules[\\/]\.jest-expo-.*/];

// Add support for resolving assets
config.resolver.assetExts.push(
  // Add any additional asset extensions here
  'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'
);

module.exports = config;
