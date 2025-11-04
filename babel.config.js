module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // This line is required for Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};