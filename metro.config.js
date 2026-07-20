// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * react-native-view-shot di web membutuhkan html2canvas.
 * Karena kita tidak menggunakan ViewShot di web (fitur capture hanya
 * dipakai di native build), kita arahkan import-nya ke module kosong
 * agar bundler web tidak error.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'html2canvas') {
    // Kembalikan modul kosong untuk web
    return {
      filePath: require.resolve('./shims/html2canvas.web.js'),
      type: 'sourceFile',
    };
  }
  // Delegasikan ke resolver default untuk semua kasus lainnya
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
