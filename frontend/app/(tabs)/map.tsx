// Imports
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, Dimensions, View, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ThemedView } from '@/components/themed-view';
import FairDetails from '@/components/map-components/MarketView';
import StartRoute from '@/components/map-components/StartRouteView';
import FullMap from '@/components/map-components/FullMapView';
import SearchBar from '@/components/homepage-components/SearchBar';
import * as Location from 'expo-location';
import { categoryIcons } from './categoryIcons';
import categories from '../data/categories.json';

import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import { useQuery } from '@apollo/client/react';
import { GET_MAP_MARKETS } from '@/graphql/marketQueries';
import type { MapMarket } from '@/types/MapMarket';
import MapListView from '@/components/map-components/ListView';

// User Location by default (center of Porto)
const USER_LOCATION = {
  latitude: 41.144,
  longitude: -8.608,
};

const STADIA_MAP_STYLE = process.env.EXPO_PUBLIC_STADIA_MAPS_API_KEY
  ? `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${process.env.EXPO_PUBLIC_STADIA_MAPS_API_KEY}`
  : null;

interface FairItem {
  id: string | number;
  title: string;
  schedule: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl ?: string | null;
}

const toFairItem = (market: MapMarket): FairItem => ({
  id: market.id,
  title: market.name,
  schedule: market.openingHours,
  address: market.address,
  latitude: market.latitude,
  longitude: market.longitude,
  imageUrl: market.imageUrl
});

/*
 * Calculates the arrival time of the selected travel mode
 * Returns the arrival time in HH:MM format
 */
// Date format
// Gets hours & minutes

type ViewMode = 'list' | 'details' | 'route' | 'fullRoute';

const normalizeCategory = (category: string) =>
  category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default function MapScreen() {
  // Use States
  // Fair Selection
  const [selectedFair, setSelectedFair] = useState<FairItem | null>(null);
  const [userLocation, setUserLocation] = useState(USER_LOCATION);

  // Map View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTransportMode, setActiveTransportMode] = useState<'driving' | 'walking' | 'transit'>('driving');

  // Search Bar Query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: marketsResponse } = useQuery<{ markets: MapMarket[] }>(GET_MAP_MARKETS);

  const mapMarkets = useMemo(() => {
    return (marketsResponse?.markets ?? []).filter((market) =>
      Number.isFinite(market.latitude) &&
      Number.isFinite(market.longitude) &&
      market.latitude >= -90 &&
      market.latitude <= 90 &&
      market.longitude >= -100 &&
      market.longitude <= 100
    );
  }, [marketsResponse]);

  const filteredMarkets = useMemo(() => {
    if (!selectedCategory) return mapMarkets;

    const normalizeSelectedCategory = normalizeCategory(selectedCategory);

    return mapMarkets.filter((market) => 
    (market.categories ?? []).some(
      (category) => normalizeCategory(category) === normalizeSelectedCategory
    ))
  }, [mapMarkets, selectedCategory])

  // Get the device's screen height
  const screenHeight = Dimensions.get('window').height;

  // Get user location with geolocation API
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startWatchingLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada');
        return;
      }

      const options = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      };

      locationSubscription = await Location.watchPositionAsync(
        options,
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    };

    startWatchingLocation();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Bottom Sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ({
    listMin: 30,
    listExpanded: screenHeight * 0.42,
    details: screenHeight * 0.38,
    route: screenHeight * 0.60,
    fullRoute: screenHeight * 0.15,
  }), [screenHeight]);

  // Dynamic Snap Points, depending on the component being displayed
  const { dynamicSnapPoints, initialIndex } = useMemo(() => {
    switch (viewMode) {
      // 1st  Component
      case 'list':
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.listExpanded],
          initialIndex: 1,
        };
      // 2nd Component
      case 'details':
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.listExpanded, snapPoints.details],
          initialIndex: 2,
        };
      // 3rd Component
      case 'route':
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.listExpanded, snapPoints.route],
          initialIndex: 2,
        };
      // 4th Component
      case 'fullRoute':
        return {
          dynamicSnapPoints: [snapPoints.listMin, snapPoints.fullRoute],
          initialIndex: 2,
        };
      default:
        return { dynamicSnapPoints: [snapPoints.listMin], initialIndex: 0 };
    }
  }, [viewMode, snapPoints]);

  // Handling Card Press Button
  const handleCardPress = (fair: FairItem) => {
    setSelectedFair(fair);
    setViewMode('details');
  };

  const handleMarketMarkerPress = (market: MapMarket) => {
    handleCardPress(toFairItem(market));
  };

  // Handling Back to List Button
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedFair(null);
  };

  // Handling Back to Details
  const handleBackToDetails = () => {
    setViewMode('details');
  };

  // Handling Start Route Button
  const handleStartRoute = () => {
    setViewMode('route');
  };

  // Handling View Route Button
  const handleRouteView = () => {
    setViewMode('fullRoute');
  };

  // Handling Remove Route Button
  const handleEndRoute = () => {
    setViewMode('list');
    setSelectedFair(null);
  };

  /*
   * Filter search bar
   * Filter by fair name
   * Filter by county
   * Filter by fair vendor
   * Filter by category
   */

  // Handling content rendering
  const renderContent = () => {
    // Render content based on the component selected & respective props
    if (viewMode === 'list') {
      return <MapListView data={filteredMarkets.map(toFairItem)} onSelect={handleCardPress}/>
    } else if (viewMode === 'details' && selectedFair) {
      return <FairDetails fair={selectedFair} routeInfo={null} onBack={handleBackToList} onStartRoute={handleStartRoute} />;
    } else if (viewMode === 'route' && selectedFair) {
      return <StartRoute fair={selectedFair} routeInfo={null} onBack={handleBackToDetails} onBeginRoute={handleRouteView} onModeChange={setActiveTransportMode} selectedMode={activeTransportMode} />;
    } else if (viewMode === 'fullRoute' && selectedFair) {
      return <FullMap fair={selectedFair} routeInfo={null} onEndRoute={handleEndRoute} selectedMode={activeTransportMode} onModeChange={setActiveTransportMode} />;
    }
    return null;
  };

  // MapLibre / Stadia Maps Page Content
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryItem, selectedCategory === item.name && styles.categoryItemActive]}
                onPress={() => setSelectedCategory((prev) => prev === item.name ? '' : item.name)}
              >
                <Image source={categoryIcons[item.iconKey]} />
                <Text
                  style={[styles.categoryText, selectedCategory === item.name && styles.categoryItemActive]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      <ThemedView style={styles.container}>
        {STADIA_MAP_STYLE ? (
          <Map
            style={styles.map}
            mapStyle={STADIA_MAP_STYLE}
            attribution={true}
            logo={true}
          >
            <Camera
              initialViewState={{
                center: [-8.6291, 41.1579],
                zoom: 12,
              }}
            />

            {/* Live market markers from GraphQL */}
            {filteredMarkets.map((market) => {
              const isSelected = selectedFair?.id === market.id;

              return (
                <Marker
                  key={market.id}
                  id={market.id}
                  lngLat={[market.longitude, market.latitude]}
                  anchor="bottom"
                  onPress={() => handleMarketMarkerPress(market)}
                >
                  <View
                    style={[
                      styles.marketMarker,
                      isSelected && styles.marketMarkerSelected,
                    ]}
                  >
                    <View style={styles.marketMarkerCenter} />
                  </View>
                </Marker>
              );
            })}

            {/* User location marker */}
            <Marker
              id="user-location"
              lngLat={[userLocation.longitude, userLocation.latitude]}
              anchor="center"
            >
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationMarkerCenter} />
              </View>
            </Marker>
          </Map>
        ) : (
          <View style={[styles.map, styles.mapMessage]}>
            <Text style={styles.mapMessageText}>
              Chave API do Stadia Maps em falta. Verifica o ficheiro .env.
            </Text>
          </View>
        )}

        <BottomSheet
          key={viewMode}
          ref={bottomSheetRef}
          index={initialIndex}
          snapPoints={dynamicSnapPoints}
          detached={true}
          enableDynamicSizing={false}
          enableOverDrag={false}
          backgroundStyle={styles.background}
          handleIndicatorStyle={styles.indicator}
          style={styles.detachedSheet}
        >
          { viewMode === 'list' ? (
            <MapListView
              data={filteredMarkets.map(toFairItem)}
              onSelect={handleCardPress}
            />
          ) : (
            <BottomSheetView style={{ flex: 1 }}>
              {renderContent()}
            </BottomSheetView>
          )}
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
    borderRadius: 25,
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
  marketMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFC301',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  marketMarkerSelected: {
    backgroundColor: '#C64F23',
  },
  marketMarkerCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C64F23',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  userLocationMarkerCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  mapMessage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detachedSheet: {
  marginHorizontal: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  mapMessageText: {
    color: '#C64F23',
    textAlign: 'center',
  },
});
