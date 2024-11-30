// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       ['module:react-native-dotenv'],
//       'nativewind/babel',  // NativeWind Babel plugin
//       'react-native-reanimated/plugin', // If you are using reanimated
//     ],
//   };
// };

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
