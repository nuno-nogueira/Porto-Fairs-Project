import React,  { useState, useEffect } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, FlatList, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { categoryIcons } from './categoryIcons';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SearchBarComponent from '@/components/homepage-components/SearchBar';
import FairList from '@/components/homepage-components/FairList';
//import data from '../data/locations.json';
import categories from '../data/categories.json';
import * as Notifications from 'expo-notifications';

// Query resolver 'markets'
const GET_MARKETS = gql`
  query GetMarkets {
    markets {
      id
      name
      openingHours
      address
      categories
      latitude
      longitude
      imageUrl
      iconKey
    }
  }
`

// Object Definitions
interface Person {
  id: number;
  name: string
}
interface FairItem {
  id: string;
  name: string;
  openingHours: string;
  address: string;
  categories: string[];
  imageUrl: string;
  latitude: number;
  longitude: number;
  // Back-end
  title?: string;
  county?: string;
  people?: Person[];
  category?: string;
  iconKey?: string;
  schedule?: string;
}
interface HomepageProps {
  onSelect: (item: FairItem) => void; 
}

// Homepage Screen Definition
export default function HomepageScreen({ onSelect }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { data, loading, error } = useQuery<{ markets: FairItem[] }>(GET_MARKETS);

  console.log("Status Query:", { loading, error: error?.message, count: data?.markets?.length });
  // NOTIFICATIONS LOGIC
  useEffect(() => {
    if (data && data.markets) {
      console.log(`Data received from the Microservice: Scheduling...`);
      scheduleMarket(data.markets);
    }
  }, [data])

  const scheduleMarket = async(markets: FairItem[]) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      markets.forEach(async (market) => {
      
      try {

        // Extract the time string (ex. Saturdays: mm:hh)
        const match = market.openingHours?.match(/(\d{1,2}):(\d{2})/);

        if (match) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);

          let newDate: Date = new Date();
          newDate.setHours(hours, minutes, 0, 0);

          // Subtract x minutes
          const notificationTime = new Date(newDate.getTime() - 1 * 60000);

          // Schedule a market if necessary
          if (notificationTime > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "A feira está quase a começar!",
                body: `A feira ${market.name} começa em breve!`,
                priority: 'high',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE, 
                date: notificationTime,
              } as Notifications.DateTriggerInput,
            });
            console.log('Scheduled successfully!');
            
          }
        }      
      } catch (error) {
        console.log('Error in processing the schedule of:', error);
      }
    })
    } catch (error) {
      console.log('Error in processing the schedule of:', error);
    }
    
  }

  const marketList = data?.markets || [];
  console.log(marketList);
  
  // Filter search bar
  const filteredData = marketList.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const name = item.name?.toLowerCase() || '';
    const address = item.address?.toLowerCase() || '';

    // Filter by fair name
    const matchesTitle = name.includes(query);

    // Filter by county
    const matchesCounty = address.includes(query);

    // Filter by fair vendor
    const matchesVendor = item.people?.some(person => 
      person.name.toLowerCase().includes(query)
    ) || false

    const matchesSearch = matchesTitle || matchesCounty || matchesVendor;

    // Filter by category
    const matchesCategory = selectedCategory === '' || (item.categories && item.categories.includes(selectedCategory));
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
          <FairList data= {filteredData} onSelect={onSelect as any} />
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

// import React from 'react';
// import { View, Text } from 'react-native';

// export default function Home() {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Text>Olá</Text>
//         </View>
//     );
// }

