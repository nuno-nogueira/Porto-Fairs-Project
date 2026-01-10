import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme'; 
import { ThemedText } from '../themed-text';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textColor?: string;        
}

export function PrimaryButton({ 
  title, 
  onPress, 
  iconName, 
  style, 
  textColor 
}: PrimaryButtonProps) {
  
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  const finalTextColor = textColor || '#FFFFFF';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: themeColors.primary }, 
        style 
      ]} 
      activeOpacity={0.8} 
      onPress={onPress}
    >
      <ThemedText type="defaultSemiBold" style={[{ color: finalTextColor }]}>{title}</ThemedText>
      
      {iconName && (
        <Ionicons 
          name={iconName} 
          size={20} 
          color={finalTextColor} 
          style={styles.icon} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    borderWidth: 1,
    borderColor: 'transparent', 
  },
  icon: {
    marginLeft: 8,
  },
});