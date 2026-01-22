/**
 * AKITO Warranty App
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar, NativeModules } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/config/theme';

const { SplashScreen } = NativeModules;

function App(): React.JSX.Element {
  useEffect(() => {
    SplashScreen?.hide();
  }, []);

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
