// Imports
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, Dimensions, View, FlatList, TouchableOpacity, Image, Text, Linking } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ThemedView } from '@/components/themed-view';
import FairDetails from '@/components/map-components/MarketView';
import StartRoute from '@/components/map-components/StartRouteView';
import FullMap from '@/components/map-components/FullMapView';
import SearchBar from '@/components/homepage-components/SearchBar';
import * as Location from 'expo-location';
import { categoryIcons } from './categoryIcons';
import categories from '../data/categories.json';

import { Map, Camera, Marker, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client/react';
import { GET_MAP_MARKETS } from '@/graphql/marketQueries';
import type { MapMarket } from '@/types/MapMarket';
import MapListView from '@/components/map-components/ListView';

import {calculateRoutes, getRoutingErrorMessage} from '@/api/routing';
import type { RouteCalculation } from '@/types/Route';
import { useAuth } from '@/context/AuthContext';

const STADIA_MAP_STYLE = process.env.EXPO_PUBLIC_STADIA_MAPS_API_KEY
  ? `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${process.env.EXPO_PUBLIC_STADIA_MAPS_API_KEY}`
  : null;


const ROUTE_TEST_ORIGIN = {
  latitude: 41.1579,
  longitude: -8.6291
}
  
type LocationStatus = 'loading' | 'ready' | 'permission-denied' | 'services-disabled' | 'error';
 
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
  const [userLocation, setUserLocation] = useState<{
    latitude: number,
    longitude: number;
  } | null>(null);

  const [locationStatus, setLocationStatus] = useState<LocationStatus>('loading');

  // Map View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTransportMode, setActiveTransportMode] = useState<'driving' | 'walking' | 'transit'>('driving');

  // Search Bar Query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [locationRetry, setLocationRetry] = useState(0);

  const [routeInfo, setRouteInfo] = useState<RouteCalculation | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const routeRequestIdRef = useRef(0);
  const previousCameraStateRef = useRef({
    routeVisible: false,
    transportMode: activeTransportMode,
    marketId: selectedFair?.id ?? null
  })

  const {user, loading: authLoading } = useAuth();
  const isAuthenticated = user !== null;

  const {
    data: marketsResponse,
    loading: marketsLoading,
    error: marketsError,
} = useQuery<{ markets: MapMarket[] }>(GET_MAP_MARKETS);

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
    const normalizedQuery = normalizeCategory(searchQuery);

  return mapMarkets.filter((market) => {
    // Category filter
    const matchesCategory =
      !selectedCategory ||
      (market.categories ?? []).some(
        (category) =>
          normalizeCategory(category) === normalizeCategory(selectedCategory)
      );

    // Search filter
    const searchableValues = [
      market.name,
      market.address,
      market.description,
      ...(market.categories ?? []),
      ...(market.sellers ?? []).map((seller) => seller.full_name),
    ];

    const matchesSearch =
      !normalizedQuery ||
      searchableValues.some((value) =>
        normalizeCategory(value ?? '').includes(normalizedQuery)
      );

    return matchesCategory && matchesSearch;
  });
  }, [mapMarkets, selectedCategory, searchQuery])

  // Get the device's screen height
  const screenHeight = Dimensions.get('window').height;

  // Get user location with geolocation API
  useEffect(() => {
    let isMounted = true;
    let locationSubscription: Location.LocationSubscription | null = null
    let hasReceivedLocation = false;

    // Update the user's coordinates
    const updateUserLocation = (location: Location.LocationObject) => {
      if (!isMounted) return;

      hasReceivedLocation = true;

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      setLocationStatus('ready');
    };

    const startWatchingLocation = async() => {
      try {
        // Check existing foreground permission
        let permission = await Location.getForegroundPermissionsAsync();

        if (!permission.granted && permission.canAskAgain) permission = await Location.requestForegroundPermissionsAsync();

        if (!isMounted) return;

        if (!permission.granted) {
          setLocationStatus('permission-denied');
          return;
        }

        // Check whether device location services are enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();

        if (!isMounted) return;

        if (!servicesEnabled) {
          setLocationStatus('services-disabled');
          return;
        }

        // Try to get a recent cached position first
        try {
          const lastknownPosition = await Location.getLastKnownPositionAsync({
            maxAge: 60000,
            requiredAccuracy: 100
          });

          if (!isMounted) return;

          if (lastknownPosition) updateUserLocation(lastknownPosition);
        } catch (err) {
          console.warn(`[Location] Could not retrieve last known position ->`, err);
        }

        // Start listening for continuous location updates
        try {
          const subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10
            },
            updateUserLocation,
            (reason) => {
              console.error('[Location] Watch error ->', reason);

              if (isMounted && !hasReceivedLocation)setLocationStatus('error');
            }
          );

          if (!isMounted) {
            subscription.remove();
            return;
          }

          locationSubscription = subscription;
        } catch (err) {
          console.error('[Location] Could not start location watcher ->', err);
          
        }

        // Request a new position independently of the watcher
        try {
          const currentPosition = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});

          updateUserLocation(currentPosition);
        } catch (err) {
          console.error('[Location] Could not retrieve current position ->', err);

          if (isMounted && !hasReceivedLocation) setLocationStatus('error');
        }

        // If both initial position methods failed
        if (isMounted && !hasReceivedLocation) setLocationStatus('error');
      } catch (err) {
        console.error('[Location] Location setup failed ->', err);

        if (isMounted && !hasReceivedLocation) setLocationStatus('error');
        
      }
    };

    startWatchingLocation();

    return () => {
      isMounted = false;
      locationSubscription?.remove();
    }
  }, [locationRetry]);


  const handleLocationNoticePress = async() => {
    try {
      const permission = await Location.getForegroundPermissionsAsync();

      if (!permission.granted && !permission.canAskAgain) {
        await Linking.openSettings();
        return;
      }

      setLocationStatus('loading');
      setLocationRetry((previous) => previous + 1);
    } catch (err) {
      console.error('[Location] Could not retry location access -> ', err);
      
    }
  }

  // Component Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const cameraRef = useRef<CameraRef | null>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ({
    listMin: 30,
    listExpanded: screenHeight * 0.42,
    details: screenHeight * 0.48,
    route: screenHeight * 0.52,
    fullRoute: screenHeight * 0.23,
  }), [screenHeight]);
  
  const routeCameraPadding = {
    top: 24,
    right: 24,
    bottom: snapPoints.fullRoute + 24,
    left: 24
  }

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
          initialIndex: 1,
        };
      default:
        return { dynamicSnapPoints: [snapPoints.listMin], initialIndex: 0 };
    }
  }, [viewMode, snapPoints]);

  // selected route geometry
  const routeFeature = useMemo(() => {
    if (viewMode !== 'fullRoute' || activeTransportMode === 'transit') return null;

    const selectedRoute = routeInfo?.[activeTransportMode];
    const coordinates = selectedRoute?.geometry.coordinates;

    if (!coordinates || coordinates.length < 2) return null;

    return {
      type: 'Feature' as const,
      properties: {transportMode: activeTransportMode},
      geometry: {
        type: 'LineString' as const,
        coordinates
      }
    }
  }, [viewMode, activeTransportMode, routeInfo])

  const isRouteLineVisible = routeFeature !== null;

  useEffect(() => {
    const camera = cameraRef.current;

    const previousState = previousCameraStateRef.current;

    const currentMarketId = selectedFair?.id ?? null;

    const modeChanged =
        previousState.transportMode !== activeTransportMode;

    const marketChanged =
        previousState.marketId !== currentMarketId;

    const currentState = {
        routeVisible: isRouteLineVisible,
        transportMode: activeTransportMode,
        marketId: currentMarketId,
    };

    if (!camera) {
        previousCameraStateRef.current = currentState;
        return;
    }

    // 1. Entering navigation
    if (isRouteLineVisible && !previousState.routeVisible) {
        camera.flyTo({
            center: [
                ROUTE_TEST_ORIGIN.longitude,
                ROUTE_TEST_ORIGIN.latitude,
            ],
            zoom: 16,
            pitch: 55,
            bearing: 0,
            padding: routeCameraPadding,
            duration: 1500,
            easing: 'fly',
        });
    }

    // 2. Switching transport mode or selecting another market
    else if (
        isRouteLineVisible &&
        previousState.routeVisible &&
        (modeChanged || marketChanged)
    ) {
        camera.easeTo({
            center: [
                ROUTE_TEST_ORIGIN.longitude,
                ROUTE_TEST_ORIGIN.latitude,
            ],
            zoom: 16,
            pitch: 55,
            bearing: 0,
            padding: routeCameraPadding,
            duration: 900,
            easing: 'ease',
        });
    }

    // 3. Exiting navigation
    else if (
        !isRouteLineVisible &&
        previousState.routeVisible
    ) {
        camera.flyTo({
            center: [-8.6291, 41.1579],
            zoom: 12,
            pitch: 0,
            bearing: 0,
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
            duration: 1000,
            easing: 'ease',
        });
    }

    previousCameraStateRef.current = currentState;

    }, [
        isRouteLineVisible,
        activeTransportMode,
        selectedFair?.id,
    ]);

  // Handling Card Press Button
  const handleCardPress = (fair: FairItem) => {
    // INvalidate any pending route request
    routeRequestIdRef.current += 1;

    setSelectedFair(fair);
    setRouteInfo(null);
    setRouteLoading(false);
    setRouteError(null);

    setViewMode('details');
  };

  const handleMarketMarkerPress = (market: MapMarket) => {
    handleCardPress(toFairItem(market));
  };

  // Handling Back to List Button
  const handleBackToList = () => {
    routeRequestIdRef.current += 1;

    setRouteInfo(null);
    setRouteLoading(false);
    setRouteError(null);

    setViewMode('list');
    setSelectedFair(null);
  };

  // Handling Back to Details
  const handleBackToDetails = () => {
    setViewMode('details');
  };

  // Handling Start Route Button
  const handleStartRoute = async() => {
    if (!selectedFair) return;

    setViewMode('route');

    // Wait for authentication state to be restored
    if (authLoading) {
      setRouteInfo(null);
      setRouteLoading(false);
      return;
    }

    // check if user is not authenticated
    if (!isAuthenticated) {
      setRouteInfo(null);
      setRouteLoading(false);
      setRouteError(null);
      return;
    }

    // Reuse a route that was already calculated for a market
    if (routeInfo) return;

    const requestId = ++routeRequestIdRef.current;

    setRouteInfo(null);
    setRouteLoading(true);
    setRouteError(null);

    try {
      const routes = await calculateRoutes({
        origin: ROUTE_TEST_ORIGIN,
        destination: {
          latitude: selectedFair.latitude,
          longitude: selectedFair.longitude
        }
      })

      if (requestId !== routeRequestIdRef.current) return;

      setRouteInfo(routes);

      console.log('[Routing] Routes calculated successfully.');
    } catch (err) {
      if (requestId !== routeRequestIdRef.current) return;

      const message = getRoutingErrorMessage(err);

      setRouteError(message);
      setRouteInfo(null);

      console.error('[Routing] Route calculation failed:', message);
    } finally {
      if (requestId === routeRequestIdRef.current) setRouteLoading(false);
    }
  };

  // Handling View Route Button
  const handleRouteView = () => {
    setViewMode('fullRoute');
  };

  // Handling Remove Route Button
  const handleEndRoute = () => {
    routeRequestIdRef.current += 1;

    setRouteInfo(null);
    setRouteLoading(false);
    setRouteError(null);

    setViewMode('list');
    setSelectedFair(null);
  };

  const handleRecenter = () => {
    if (!userLocation) {
      console.warn('[Map] User Location is not available yet.');
      return;
    }

    cameraRef.current?.flyTo({
      center: [
        userLocation.longitude,
        userLocation.latitude
      ],
      duration: 1000,
      easing: 'fly'
    });
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
      return <MapListView data={filteredMarkets.map(toFairItem)} onSelect={handleCardPress} loading={marketsLoading} error={!!marketsError} />
    } else if (viewMode === 'details' && selectedFair) {
      return <FairDetails fair={selectedFair} routeInfo={null} onBack={handleBackToList} onStartRoute={handleStartRoute} />;
    } else if (viewMode === 'route' && selectedFair) {
      return  (
      <StartRoute
        fair={selectedFair}
        routeInfo={routeInfo}
        routeLoading={routeLoading}
        routeError={routeError}
        isAuthenticated={isAuthenticated}
        authLoading={authLoading}
        onBack={handleBackToDetails}
        onBeginRoute={handleRouteView}
        onModeChange={setActiveTransportMode}
        selectMode={activeTransportMode}
    />);
    } else if (viewMode === 'fullRoute' && selectedFair) {
      return <FullMap
        fair={selectedFair}
        routeInfo={routeInfo}
        routeLoading={routeLoading}
        routeError={routeError}
        onEndRoute={handleEndRoute}
        selectedMode={activeTransportMode}
        onModeChange={setActiveTransportMode}
    />;
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
          placeholder='Procura por nome, morada, vendedor...'
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
              ref={cameraRef}
              initialViewState={{
                center: [-8.6291, 41.1579],
                zoom: 12,
                bearing: 0,
                pitch: 0
              }}
            />

            {/* Selected route from openrouteservice */}
            {routeFeature && (
              <GeoJSONSource
                id="selected-route-source"
                data={routeFeature}
              >
                <Layer
                  id="selected-route-outline"
                  type="line"
                  source="selected-route-source"
                  layout={{
                    'line-cap': 'round',
                    'line-join': 'round',
                  }}
                  paint={{
                    'line-color': '#FFFFFF',
                    'line-width': 9,
                    'line-opacity': 0.95
                  }}
                />

                <Layer
                  id="selected-route-line"
                  type="line"
                  source="selected-route-source"
                  layout={{
                      'line-cap': 'round',
                      'line-join': 'round',
                  }}
                  paint={{
                      'line-color': '#C64F23',
                      'line-width': 5,
                      'line-opacity': 1,
                  }}
        />
              </GeoJSONSource>
            )}

            {filteredMarkets
              .filter((market) => {

                  return !(
                      isRouteLineVisible &&
                      selectedFair?.id === market.id
                  );
              })
              .map((market) => (
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
                              isRouteLineVisible && styles.marketMarkerInRouteView,
                          ]}
                      >
                          <View style={styles.marketMarkerCenter} />
                      </View>
                  </Marker>
              ))}

            {/* User location marker */}
            {userLocation && (
              <Marker
                id="user-location"
                lngLat={[userLocation.longitude, userLocation.latitude]}
                anchor='center'
              >
                <View style={styles.userLocationMarker}>
                  <View style={styles.userLocationMarkerCenter} />
                </View>
              </Marker>
            )}

            {isRouteLineVisible && selectedFair && (
              <>
                  {/* Point A - Route origin */}
                  <Marker
                      id="route-origin-marker"
                      lngLat={[
                          ROUTE_TEST_ORIGIN.longitude,
                          ROUTE_TEST_ORIGIN.latitude,
                      ]}
                      anchor="center"
                  >
                      <View style={[styles.routeEndpointMarker, styles.routeOriginMarker]}>
                          <Text style={styles.routeEndpointText}>A</Text>
                      </View>
                  </Marker>

                  {/* Point B - Selected market */}
                  <Marker
                      id="route-destination-marker"
                      lngLat={[
                          selectedFair.longitude,
                          selectedFair.latitude,
                      ]}
                      anchor="center"
                  >
                      <View style={[styles.routeEndpointMarker, styles.routeDestinationMarker]}>
                          <Text style={styles.routeEndpointText}>B</Text>
                      </View>
                  </Marker>
              </>
          )}
          </Map>
        ) : (
          <View style={[styles.map, styles.mapMessage]}>
            <Text style={styles.mapMessageText}>
              Chave API do Stadia Maps em falta. Verifica o ficheiro .env.
            </Text>
          </View>
        )}

        {/* Recenter map on user location */}
        {userLocation && (
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={handleRecenter}
            activeOpacity={0.75}
            accessibilityRole='button'
            accessibilityLabel='Centrar mapa na minha localização'
            accessibilityHint='Move o mapa para a tua posição atual'
          >
            <Ionicons
              name='locate-outline'
              size={25}
              color='#C64F23'
            />
          </TouchableOpacity>
        )}

        {locationStatus !== 'loading' && locationStatus !== 'ready' && (
          <TouchableOpacity
            style={styles.locationNotice}
            onPress={handleLocationNoticePress}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.locationNoticeText}>
              {locationStatus === 'permission-denied'
                ? 'Permite o acesso à localização para mostrar a tua posição.'
                : locationStatus === 'services-disabled'
                  ? 'Ativa os serviços de localização do teu dispositivo.'
                  : 'Não foi possível obter a localização. Toca para tentar novamente.'}
            </Text>

            <Text style={styles.locationNoticeAction}>
              {locationStatus === 'permission-denied'
                ? 'Ativar localização'
                : 'Tentar novamente'}
            </Text>
          </TouchableOpacity>
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
              loading={marketsLoading}
              error={!!marketsError}           
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
  locationNotice: {
    position: 'absolute',
    top: 160,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    zIndex: 3,
    elevation: 4,
  },

  locationNoticeText: {
    color: '#C64F23',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },

  locationNoticeAction: {
    color: '#C64F23',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },

  recenterButton: {
    position: 'absolute',
    top: 180,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },

  marketMarkerInRouteView: {
    backgroundColor: '#B8ADA6',
    opacity: 0.6,
  },

  routeEndpointMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },

  routeOriginMarker: {
    backgroundColor: '#2878D0',
  },

  routeDestinationMarker: {
    backgroundColor: '#C64F23',
  },

  routeEndpointText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
