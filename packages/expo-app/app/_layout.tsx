import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { PinStoreProvider } from '@/state/pins';
import { UiBusProvider } from '@/state/ui-bus';
import { ChatHistoryProvider } from '@/state/chat-history';
import { AuthProvider } from '@/state/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <UiBusProvider>
              <PinStoreProvider>
                <ChatHistoryProvider>
                  <Stack screenOptions={{ contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background } }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="signup" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  </Stack>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                </ChatHistoryProvider>
              </PinStoreProvider>
            </UiBusProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
