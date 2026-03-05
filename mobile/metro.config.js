// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for resolving assets
config.resolver.assetExts.push(
  // Add any additional asset extensions here
  'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'
);

module.exports = config;
