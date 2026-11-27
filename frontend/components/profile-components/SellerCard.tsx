import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// theme imports
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export interface SellerItemData {
  id: string | number;
  name: string;
  avatar: string | null;
}

interface SellerCardProps {
  item: SellerItemData;
  onPress ?: (item: SellerItemData) => void;
}

export function SellerCard({ item, onPress }: SellerCardProps) {
    const theme = useColorScheme() ?? 'light';
    const backgroundColor = Colors[theme].background;

    const [imageError, setImageError] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={() => onPress?.(item)}
    >
      {item.avatar && !imageError ? (
        <Image
          source={{ uri: item.avatar }}
          style={[styles.avatar, { borderColor: backgroundColor }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.avatarFallback,
            { borderColor: backgroundColor },
          ]}
        >
          <Ionicons
            name="person"
            size={32}
            color="#A0A0A0"
          />
        </View>
      )}

      <ThemedText
      style={styles.name}
      numberOfLines={2}
      type='small'>
        {item.name}
      </ThemedText>
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', 
    marginRight: 20,      
    width: 80,            
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35, 
    backgroundColor: '#eee', 
    marginBottom: 8,
    borderWidth: 2,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    textAlign: 'center',
    fontWeight: '400',
  },
});