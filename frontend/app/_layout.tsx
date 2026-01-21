import React from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize'
import { LogBox } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';

// Ignores specific notification warning
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
// Notifications.setNotificationHandler({
//   handleNotification: async() => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true, 
//     shouldShowList: true,
//   }),
// });

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
