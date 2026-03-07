const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * This file merges the default Metro config and then wraps the final merged
 * config with NativeWind's `withNativeWind`. The previous version exported
 * the merged config and then overwrote module.exports with `withNativeWind`
 * but passed the wrong `config` object. We must pass the merged config into
 * `withNativeWind`.
 *
 * If you need to customize resolver/transformer/etc, add them into the 
 * `customConfig` object below.
 */

/** Get the default Metro config for this project root */
const defaultConfig = getDefaultConfig(__dirname);

/** Any project-specific Metro customizations */
const customConfig = {
  // Example:
  // resolver: {
  //   sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'],
  // },
};

/** Merge defaults with customizations */
const mergedConfig = mergeConfig(defaultConfig, customConfig);

/** Wrap the merged config with NativeWind and export */
module.exports = withNativeWind(mergedConfig, { input: './global.css' });
