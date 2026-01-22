import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { ApolloProvider } from '@apollo/client/react';
import { Host } from 'react-native-portalize'
import { LogBox } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import * as Notifications from 'expo-notifications';

const httpLink = createHttpLink({
  uri: 'http://172.23.113.213:4000/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

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
  
  useEffect(() => {
    async function requestPermissions() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log("Permission for notifications has been denied!");
        return;
      }
    }

    requestPermissions();
  }, [])

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1}}>
          <Host>
              <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
          </Host>
          </GestureHandlerRootView>
      </AuthProvider>
    </ApolloProvider>
  );
}
