// Imports
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { ThemedView } from '@/components/themed-view';
import locations from '../data/locations.json';
import MapListView from '@/components/map-components/ListView'
import FairDetails from '@/components/map-components/MarketView';
import StartRoute from '@/components/map-components/StartRouteView';
import FullMap from '@/components/map-components/FullMapView';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

// GOOGLE MAPS API KEY
const GOOGLE_MAPS_APIKEY = 'AIzaSyBKIxxQyxvI-U933RiQgVOJQsTg8xiSWfM'

// User Location by default (center of Porto)
const USER_LOCATION = {
  latitude: 41.144,
  longitude: -8.608
}


interface FairItem {id: number; title: string; schedule: string; address: string; latitude: number; longitude: number}
type ViewMode = 'list' | 'details' | 'route' | 'fullRoute';

// Default fair & market locations
const data: FairItem[] = [
    {
        id: 1,
        title: 'Mercado do Bolhão',
        schedule: 'Seg - Sex 11:00 - 19:00',
        address: 'R. Formosa 322, 4000-248 Porto',
        latitude: 41.1496, 
        longitude: -8.6109
    },
    {
        id: 2,
        title: 'Time Out Market Porto',
        schedule: 'Todos os dias 10:00 - 00:00',
        address: 'Praça De Almeida Garrett, Porto 40',
        latitude: 41.1579, 
        longitude: -8.6291
    },
    {
      id: 3,
      title: 'Feira da Vandoma',
      schedule: 'Sáb 08:00 - 13:00',
      address: 'Avenida 25 de Abril, 4200 Porto',
      latitude: 41.1691,
      longitude: -8.5997
    },
    {
      id: 4,
      title: 'Mercado Municipal de Matosinhos',
      schedule: 'Ter - Sáb 06:00 - 18:00',
      address: 'R. França Júnior, 4450-142',
      latitude: 41.1780,
      longitude: -8.6881
    },
    {
      id: 5,
      title: 'Mercado Municipal de Gaia',
      schedule: 'Seg - Sab 08:00 - 13:00',
      address: 'Rua do Mercado, Vila Nova de Gaia',
      latitude: 41.1343,
      longitude: -8.6251
    }
]


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
  const [selectedFair, setSelectedFair] = useState<FairItem | null>(null);
  const [userLocation, setUserLocation] = useState(USER_LOCATION);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTransportMode, setActiveTransportMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [routeData, setRouteData] = useState<{
    driving?: {distance: string, duration: string, arrivalTime: string};
    walking?: {distance: string, duration: string};
    transit?: {distance: string, duration: string};
  } | null>(null);
  
  
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

  // Handling content rendering
  const renderContent = () => {
    // Render content based on the component selected & respective props
    if (viewMode === 'list') {
      return <MapListView data={data} onSelect={handleCardPress}/>
    } else if (viewMode === 'details' && selectedFair) {
      return <FairDetails fair={selectedFair} routeInfo={routeData} onBack={handleBackToList} onStartRoute={handleStartRoute}/>
    } else if (viewMode === 'route' && selectedFair) {
      return <StartRoute fair={selectedFair} routeInfo={routeData} onBeginRoute={handleRouteView} onModeChange={setActiveTransportMode} selectedMode={activeTransportMode} />
    } else if (viewMode === 'fullRoute' && selectedFair) {
      return <FullMap fair={selectedFair} routeInfo={routeData} onEndRoute={handleEndRoute} selectedMode={activeTransportMode} onModeChange={setActiveTransportMode} />
    }
    return null;
  }

  // Google Maps Page Content
  return (
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
        
        
        {locations.map((loc) => (
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
              apikey={GOOGLE_MAPS_APIKEY}
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
              apikey={GOOGLE_MAPS_APIKEY}
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
              apikey={GOOGLE_MAPS_APIKEY}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
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
