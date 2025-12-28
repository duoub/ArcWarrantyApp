module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
  // Only link MaterialCommunityIcons and Feather fonts
  assets: [
    './node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf',
    './node_modules/react-native-vector-icons/Fonts/Feather.ttf',
  ],
};
