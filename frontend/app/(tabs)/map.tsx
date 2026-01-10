// Imports
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, Dimensions, View, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ThemedView } from '@/components/themed-view';
import MapListView from '@/components/map-components/ListView'
import FairDetails from '@/components/map-components/MarketView';
import StartRoute from '@/components/map-components/StartRouteView';
import FullMap from '@/components/map-components/FullMapView';
import SearchBar from '@/components/homepage-components/SearchBar';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import data from '../data/locations.json';
import { categoryIcons } from './categoryIcons';
import categories from '../data/categories.json';

// GOOGLE MAPS API KEY
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_APIKEY

// User Location by default (center of Porto)
const USER_LOCATION = {
  latitude: 41.144,
  longitude: -8.608
}

interface Person {
  id: number;
  name: string
}
interface FairItem {
  id: number; 
  title: string; 
  schedule: string; 
  address: string; 
  latitude: number; 
  longitude: number;
  category: string;
  county: string;
  people: Person[];
}


type ViewMode = 'list' | 'details' | 'route' | 'fullRoute';

const calculateArrivalTime = (durationMinutes: number) => {
  /**
   * Calculates the arrival time of the selected travel mode
   * Returns the arrival time in HH:MM format
   */
  if (!durationMinutes) return 'N/A';

  // Date format
  const arrivalTime = new Date();
  arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);

  // Gets hours & minutes
  const hours = arrivalTime.getHours().toString().padStart(2, '0')
  const  minutes = arrivalTime.getMinutes().toString().padStart(2, '0')

  return `${hours}:${minutes}`;
}

export default function MapScreen() {
  // Use States
  // Fair Selection
  const [selectedFair, setSelectedFair] = useState<FairItem | null>(null);
  const [userLocation, setUserLocation] = useState(USER_LOCATION);
  
  // Map View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTransportMode, setActiveTransportMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [routeData, setRouteData] = useState<{
    driving?: {distance: string, duration: string, arrivalTime: string};
    walking?: {distance: string, duration: string};
    transit?: {distance: string, duration: string};
  } | null>(null);
  
  // Search Bar Query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Get the phone's screen height
  const screenHeight = Dimensions.get('window').height;

  // Get user location with geolocation API
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startWatchingLocation = async() => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if ( status !== 'granted') {
        console.error('Permissão de localização negada');
        return
      }

      const options = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10
      }

      locationSubscription = await Location.watchPositionAsync(
        options,
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          })
        }
      )
    }
      startWatchingLocation();
      return() => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      } 
    

  }, []); 

  // Bottom Sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null)
  const mapRef = useRef<MapView>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ({
         listMin: 30,
         listExpanded: screenHeight * 0.30,
         details: screenHeight * 0.38,
         route: screenHeight * 0.60,
         fullRoute: screenHeight * 0.15
  }), [screenHeight]);

  // Dynamic Snap Points, depending on the component being displayed
  const { dynamicSnapPoints, initialIndex } = useMemo(() => {
    switch(viewMode) {
      // 1st  Component
      case 'list':
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.listExpanded],
          initialIndex: 1
        };
      // 2nd Component
      case 'details': 
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.listExpanded, snapPoints.details],
          initialIndex: 2
        };
      // 3rd Component
      case 'route': 
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.listExpanded, snapPoints.route],
          initialIndex: 2
        };
      // 4th Component
      case 'fullRoute':
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.fullRoute],
          initialIndex: 2
        }
        default: return { dynamicSnapPoints: [snapPoints.listMin], initialIndex: 0}
      }
  }, [viewMode, snapPoints])

  // Handling Card Press Button
  const handleCardPress = (fair: FairItem) => {
    setSelectedFair(fair);
    setViewMode('details');
  };

  // Handling Back to List Button
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedFair(null);
  }

  // Handling Back to Details
  const handleBackToDetails = () => {
    setViewMode('details')
  }

  // Handling Start Route Button
  const handleStartRoute = () => {
    setViewMode('route');
  }

  // Handling View Route Button
  const handleRouteView = () => {
    setViewMode('fullRoute')
  }

  // Handling Remove Route Button
  const handleEndRoute = () => {
    setViewMode('list');
    setSelectedFair(null);
  }

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

  // Handling content rendering
  const renderContent = () => {
    // Render content based on the component selected & respective props
    if (viewMode === 'list') {
      return <MapListView data={filteredData} onSelect={handleCardPress}/>
    } else if (viewMode === 'details' && selectedFair) {
      return <FairDetails fair={selectedFair} routeInfo={routeData} onBack={handleBackToList} onStartRoute={handleStartRoute}/>
    } else if (viewMode === 'route' && selectedFair) {
      return <StartRoute fair={selectedFair} routeInfo={routeData} onBack={handleBackToDetails} onBeginRoute={handleRouteView} onModeChange={setActiveTransportMode} selectedMode={activeTransportMode} />
    } else if (viewMode === 'fullRoute' && selectedFair) {
      return <FullMap fair={selectedFair} routeInfo={routeData} onEndRoute={handleEndRoute} selectedMode={activeTransportMode} onModeChange={setActiveTransportMode} />
    }
    return null;
  }



  // Google Maps Page Content
  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder='Procura por nome, concelho...'
        />
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
      </View>

      <ThemedView style={styles.container}>
        <MapView
        ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
                  latitude: 41.1579, 
                  longitude: -8.6291,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
        >
          
          
          {data.map((loc) => (
            // Iterate through every fair to create their map marker
            <Marker 
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              pinColor="#FFC301"
            />
          ))}

            <Marker
            // User location marker
            // Later shows the route & expected time on the selected mode (driving, walking or transit)
              coordinate={userLocation}
              title="A minha localização"
              pinColor='#C64F23'
            />
            
            {(viewMode === 'details' || viewMode === 'route' || viewMode === 'fullRoute') && selectedFair && (
              // DRIVING MODE
                <MapViewDirections
                origin={userLocation}
                destination={{
                  latitude: selectedFair.latitude,
                  longitude: selectedFair.longitude
                }}
                apikey={GOOGLE_MAPS_APIKEY!}
                // Route Display Style
                strokeColor={activeTransportMode === 'driving' ? '#C64F23' : '#FFB800'}
                strokeWidth={activeTransportMode === 'driving' ? 4 : 2}
                mode='DRIVING' 
                onReady={(result) => {
                        const durationMinutes = Math.round(result.duration);
                        const arrivalTime = calculateArrivalTime(durationMinutes);

                        // Saves car data & ETA state
                        setRouteData(prev => ({
                            ...prev,
                            driving: {
                              distance: result.distance.toFixed(1) + ' km',
                              duration: durationMinutes + ' mins',
                              arrivalTime: arrivalTime
                            }
                        }))

                        mapRef.current?.fitToCoordinates(result.coordinates, { edgePadding: {top: 100, right: 100, bottom: 100, left: 100}});
                    }}
                />
            ) }
            {(viewMode === 'route' || viewMode === 'fullRoute') && selectedFair && (
              // WALKING MODE
                <MapViewDirections
                origin={userLocation}
                destination={{
                  latitude: selectedFair.latitude,
                  longitude: selectedFair.longitude
                }}
                apikey={GOOGLE_MAPS_APIKEY!}
                strokeColor={activeTransportMode === 'walking' ? '#C64F23' : '#FFB800'}
                strokeWidth={activeTransportMode === 'walking' ? 4 : 2}
                mode='WALKING'
                onReady={(result) => {
                        const durationMinutes = Math.round(result.duration);
                        const arrivalTime = calculateArrivalTime(durationMinutes);

                        // Saves walking data & ETA state
                        setRouteData(prev => ({
                            ...prev,
                            walking: {
                              distance: result.distance.toFixed(1) + ' km',
                              duration: durationMinutes + ' mins',
                              arrivalTime: arrivalTime
                            }
                        }))
                    }}
                />
            ) }
            {(viewMode === 'route' || viewMode === 'fullRoute') && selectedFair && (
              // TRANSIT MODE 
                <MapViewDirections
                origin={userLocation}
                destination={{
                  latitude: selectedFair.latitude,
                  longitude: selectedFair.longitude
                }}
                apikey={GOOGLE_MAPS_APIKEY!}
                strokeColor={activeTransportMode === 'transit' ? '#C64F23' : '#FFB800'}
                strokeWidth={activeTransportMode === 'transit' ? 4 : 2}
                mode='TRANSIT'
                onReady={(result) => {
                        const durationMinutes = Math.round(result.duration);
                        const arrivalTime = calculateArrivalTime(durationMinutes);

                        // Saves transit data & ETA state
                        setRouteData(prev => ({
                            ...prev,
                            transit: {
                              distance: result.distance.toFixed(1) + ' km',
                              duration: durationMinutes + ' mins',
                              arrivalTime: arrivalTime
                            }
                        }))
                    }}
                />
            ) }
            
        </MapView>
        <BottomSheet
        // Bottom Sheet Definitions & Settings
          key={viewMode}
          ref={bottomSheetRef}
          index={initialIndex}
          snapPoints={dynamicSnapPoints}
          backgroundStyle={styles.background}
          handleIndicatorStyle={styles.indicator}
        >
          <BottomSheetView style={{flex: 1}}>
            {renderContent()}
          </BottomSheetView>
        </BottomSheet>
        </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1 },
  map: { flex: 1 },
  searchBarContainer: {
    position: 'absolute',
    top: 60,              
    left: 20,             
    right: 20,            
    zIndex: 2,           
    borderRadius: 25
  },
  categorySelection: {
    top: 10,
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
  background: {
      backgroundColor: '#FCFBFA',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
  },
  indicator: {
      backgroundColor: '#F88B72',
      width: 60,
      height: 6,
    },
});
