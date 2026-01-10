import React from 'react';
import { View, Image, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import components theme
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface ProfileHeaderProps {
  user: {
    name: string;
    location: string;
  };

  imageUri: any; 
  onEditImage: () => void; 
}

export function ProfileHeader({ user, imageUri, onEditImage }: ProfileHeaderProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = Colors[theme].background;
  const iconColor = Colors[theme].icon;
  const tintColor = Colors[theme].tint;
  return (
    <View style={styles.container}>     
      <View style={styles.imageContainer}>
        <Image 
          source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri} 
          style={[styles.profileImage, { borderColor: backgroundColor }]} 
        />

        {/* btn adit profile image */}
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: tintColor , borderColor: backgroundColor }]} 
          onPress={onEditImage}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
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
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
});