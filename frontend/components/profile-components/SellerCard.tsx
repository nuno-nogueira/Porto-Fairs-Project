import React from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

// theme imports
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export interface SellerItemData {
  id: number;
  name: string;
  avatar: string;
}

interface SellerCardProps {
  item: SellerItemData;
  onPress?: (item: SellerItemData) => void;
}

export function SellerCard({ item, onPress }: SellerCardProps) {
    //  current theme 
    const theme = useColorScheme() ?? 'light';
    const backgroundColor = Colors[theme].background;
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={() => onPress && onPress(item)}
    >

      <Image 
        source={{ uri: item.avatar }} 
        style={[styles.avatar, { borderColor: backgroundColor }]} 
      />
      
      <ThemedText style={styles.name} numberOfLines={2} type="small">
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
  name: {
    textAlign: 'center',
    fontWeight: '400',
  },
});