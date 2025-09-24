const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure assets are properly bundled
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg', 'ico');

module.exports = config;