import React from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize'
import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';

// Ignores specific notification warning
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
Notifications.setNotificationHandler({
  handleNotification: async() => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  
  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <Host>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
      </Host>
    </GestureHandlerRootView>
  );
}
