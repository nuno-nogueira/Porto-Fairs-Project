import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
