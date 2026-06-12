const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Alias native-only modules to web stubs when building for web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const stubs = {
      'expo-haptics': `${__dirname}/web-stubs/expo-haptics.js`,
      'expo-secure-store': `${__dirname}/web-stubs/expo-secure-store.js`,
      'expo-notifications': `${__dirname}/web-stubs/expo-notifications.js`,
      'react-native-purchases': `${__dirname}/web-stubs/react-native-purchases.js`,
      'react-native-gesture-handler': `${__dirname}/web-stubs/react-native-gesture-handler.js`,
      'react-native-reanimated': `${__dirname}/web-stubs/react-native-reanimated.js`,
    };
    if (stubs[moduleName]) {
      return { filePath: stubs[moduleName], type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
