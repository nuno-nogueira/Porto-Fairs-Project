// Imports
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../themed-view';
import { Searchbar } from 'react-native-paper';

// Search Bar Component parameter definitions
interface SearchBarProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string
}

// Search Bar Component
export default function SearchBarComponent({value, onChange, placeholder}: SearchBarProps) {
    return(
        <ThemedView>
            <Searchbar
                placeholder={placeholder || "Procura por nome, concelho..."}
                onChangeText={onChange}
                value={value}
            
                iconColor="#C64F23"           // Cor da lupa (Laranja)
                rippleColor="#FAE8E1"         // Cor do efeito de clique
                selectionColor="#C64F23"      // Cor do cursor ao digitar
                placeholderTextColor="#7A716E" // Cor do texto de exemplo
            
                style={styles.searchBar}
                inputStyle={styles.input}
            />
        </ThemedView>
    )
}
const styles= StyleSheet.create({
    searchBar: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F0F0',
    borderWidth: 1,
    borderRadius: 12,
    width: 300,
    height: 45,
  },
  input: {
    fontSize: 15,
    minHeight: 0,
    color: '#333',
  },
})