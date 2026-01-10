import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Notifications from 'expo-notifications';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Loop function to push notifications every 30 seconds
    const setupLoop = async() => {
      // Clears scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedules a repetitive notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notificação Teste! :)",
          body: "Esta notificação repete-se a cada X segundos.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 30,
          repeats: true
        },
      });
    };
    setupLoop();
  }, [])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 90,
          paddingBottom: 30,
          paddingTop: 30,
          paddingLeft: 10,
          borderTopEndRadius: 35,
          borderTopStartRadius: 35
        }
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
          <View
            style={{
              padding: 14,
              borderRadius: 50,
              backgroundColor: focused ? 'rgba(250, 128, 114, 0.3)' : 'transparent'
            }}
          >
            
            <Image
              source={require('../../assets/navbar-icons/homepage-icon.png')}
              style={{
                width: 28,
                height: 28
              }}
              resizeMode='contain'
            />
          </View>
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
          <View
            style={{
              padding: 14,
              borderRadius: 50,
              backgroundColor: focused ? 'rgba(250, 128, 114, 0.3)' : 'transparent'
            }}
          >
            
            <Image
              source={require('../../assets/navbar-icons/map-icon.png')}
              style={{
                width: 28,
                height: 28
              }}
              resizeMode='contain'
            />
          </View>
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
          <View
            style={{
              padding: 14,
              borderRadius: 50,
              backgroundColor: focused ? 'rgba(250, 128, 114, 0.3)' : 'transparent'
            }}
          >
            
            <Image
              source={require('../../assets/navbar-icons/notes-icon.png')}
              style={{
                width: 28,
                height: 28
              }}
              resizeMode='contain'
            />
          </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
          <View
            style={{
              padding: 14,
              borderRadius: 50,
              backgroundColor: focused ? 'rgba(250, 128, 114, 0.3)' : 'transparent'
            }}
          >
            
            <Image
              source={require('../../assets/navbar-icons/profile-icon.png')}
              style={{
                width: 28,
                height: 28
              }}
              resizeMode='contain'
            />
          </View>
          ),
        }}
      />
    </Tabs>
  );
}
