import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Colors } from '@/constants/theme'; 

interface SearchBarProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string
}

export default function SearchBarComponent({ value, onChange, placeholder }: SearchBarProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder={placeholder || "Procura por nome, concelho..."}
                onChangeText={onChange}
                value={value}
                
                // Cores dinâmicas
                iconColor={colors.tint}
                rippleColor={colors.tint}
                selectionColor={colors.tint}
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#7A716E'}
                
                style={[
                    styles.searchBar, 
                    { 
                        backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                        borderColor: colors.border
                    }
                ]}
                inputStyle={[styles.input, { color: colors.text }]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%', 
        paddingHorizontal: 0, 
    },
    searchBar: {
        borderWidth: 1,
        borderRadius: 12,
        height: 50,
        elevation: 0, 
    },
    input: {
        fontSize: 15,
        minHeight: 0,
       
    },
});