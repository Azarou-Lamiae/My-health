const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase 11 ships CommonJS builds that break with Metro's package exports resolution.
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
