/**
 * AKITO Warranty App
 * Main App Component
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/config/theme';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}

export default App;
