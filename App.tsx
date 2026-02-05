/**
 * AKITO Warranty App
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar, NativeModules } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import DraggableContact from './src/components/DraggableContact';
import { COLORS } from './src/config/theme';

const { SplashScreen } = NativeModules;

function App(): React.JSX.Element {
  useEffect(() => {
    SplashScreen?.hide();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.white}
        />
        <RootNavigator />
        <DraggableContact />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
