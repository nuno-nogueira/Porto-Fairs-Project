// imports
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Main component for the User Notes Tab
export default function UserNotesTab() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {/* Empty state illustration */}
        <Image
          source={require('../../assets/notes/addNotes.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Messaging section (Title and Description) */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ainda sem notas</Text>
          <Text style={styles.description}>
            Começa uma lista ou aponta algo para não te esqueceres mais tarde.
          </Text>
        </View>

        {/* Button to add new notes */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <Ionicons name="add" size={40} color="white" />
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.25, 
    paddingHorizontal: 50,
  },
  illustration: {
    width: width * 0.60,
    height: width * 0.60,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D1A12',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#C64F23',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});