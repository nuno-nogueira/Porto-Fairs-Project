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
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { SetupProvider } from '@/context/SetupContext';

const httpLink = createHttpLink({
  uri: `http://${process.env.EXPO_PUBLIC_HOST}:8080/api/markets`,
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

function AppNavigator() {
  const {user, loading} = useAuth();

  // wait until the authentication check finishes
  if (loading) {
    return (
      <View
        style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff'
        }}
        >
          <ActivityIndicator size="large" color="#c23727ff" />
      </View>
    );
  }

  return (
    <Stack>
      {/* the authentication pages are only accessible for logged out users */}
      <Stack.Protected
        guard={!user}
        redirectTo="/">
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}/>
      </Stack.Protected>

      <Stack.Screen 
        name="(tabs)"
        options={{ headerShown: false }}/>
    </Stack>
  )
}

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
          <SetupProvider>
            <GestureHandlerRootView style={{ flex: 1}}>
              <Host>
                  <Stack>
                      <Stack.Screen name='(auth)' options={{headerShown: false}} />

                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                      <Stack.Screen
                        name="maplibre-test"
                        options={{ headerShown: false}}
                      />
                  </Stack>
              </Host>
            </GestureHandlerRootView>
          </SetupProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
