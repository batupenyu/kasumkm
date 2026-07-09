import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/src/toast';

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastHost>
          <StatusBar barStyle="dark-content" backgroundColor="#F7F8F7" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F8F7' } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
            <Stack.Screen name="edit-transaction" options={{ presentation: 'modal' }} />
            <Stack.Screen name="receipt-preview" options={{ presentation: 'modal' }} />
            <Stack.Screen name="manage-categories" options={{ presentation: 'modal' }} />
          </Stack>
        </ToastHost>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
