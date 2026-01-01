import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import components theme
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface ProfileHeaderProps {
  user: {
    name: string;
    location: string;
    avatar: string;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = Colors[theme].background;
  const iconColor = Colors[theme].icon;

  return (
    <View style={styles.container}>     
      <Image 
        source={{ uri: user.avatar }} 
        style={[styles.profileImage, { borderColor: backgroundColor }]} 
      />
      
      <ThemedText type="title" style={styles.name}>
        {user.name}
      </ThemedText>
      
      <View style={styles.locationContainer}>

        <Ionicons name="location-sharp" size={16} color={iconColor} />
        
        <ThemedText style={styles.location} lightColor="gray" darkColor="#ccc">
          {user.location}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    marginBottom: 15, 
    marginTop: 20 
  }, 
  profileImage: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    marginBottom: 10, 
    borderWidth: 3, 
    
  },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center' 
   
  },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  location: { 
    marginLeft: 4, 
    fontSize: 16 
    
  },
});