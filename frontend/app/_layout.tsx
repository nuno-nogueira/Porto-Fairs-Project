import React from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize'
import { AuthProvider } from '@/context/AuthContext';


export default function RootLayout() {

  return (
    <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1}}>
        <Host>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </Host>
        </GestureHandlerRootView>
    </AuthProvider>
  );
}
