import React,  { useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, FlatList, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { categoryIcons } from './categoryIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SearchBarComponent from '@/components/homepage-components/SearchBar';
import FairList from '@/components/homepage-components/FairList';
import data from '../data/locations.json';
import categories from '../data/categories.json';


// Object Definitions
interface Person {
  id: number;
  name: string
}
interface FairItem {
  id: number;
  title: string;
  schedule: string;
  address: string;
  category: string;
  iconKey: string;
  county: string;
  people: Person[];
}
interface HomepageProps {
  onSelect: (item: FairItem) => void; 
}

// Homepage Screen Definition
export default function HomepageScreen({ onSelect }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Filter search bar
  const filteredData = (data as FairItem[]).filter((item) => {
    const query = searchQuery.toLowerCase();

    // Filter by fair name
    const matchesTitle = item.title.toLowerCase().includes(query);

    // Filter by county
    const matchesCounty = item.county.toLowerCase().includes(query);

    // Filter by fair vendor
    const matchesVendor = item.people?.some(person => 
      person.name.toLowerCase().includes(query)
    )

    const matchesSearch = matchesTitle || matchesCounty || matchesVendor;

    // Filter by category
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemedView style={styles.container}>
        <View style={styles.appContainer}>
          <Image
          source={require('../../assets/images/app-logo.png')}
          />
        </View>
        <Text style={styles.welcomeMessage}>Bem vindo (Nome)!</Text>
        <View style={styles.searchBar}>
          <SearchBarComponent
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder='Procura por nome, concelho...'
          />
        </View>
        
        <View style={styles.categorySelection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.categoriesContent}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[styles.categoryItem, selectedCategory === item.name && styles.categoryItemActive]}
                onPress={() => setSelectedCategory(prev => prev === item.name ? '' : item.name)}
              >
                <Image
                  source={categoryIcons[item.iconKey]}
                />
                <Text
                style={[styles.categoryText, selectedCategory === item.name && styles.categoryItemActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={{flex: 1}}>
          <FairList data= {filteredData} onSelect={onSelect} />
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCFBFA', 
    flex: 1, 
    paddingTop: 60
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: '800',
    padding: 15
  },
  appContainer: {
    padding: 15
  },
  searchBar: {
    padding: 15
  },
  categorySelection: {
    marginLeft: 15,
    marginBottom: 40
  },
  categoriesContent: {
    gap: 10, 
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 5,
  },
  categoryItemActive: {
    borderColor: '#C64F23',
  },
  categoryText: {
    color: '#C64F23',
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
