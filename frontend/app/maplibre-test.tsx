import { Camera, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, Text, View } from 'react-native';

const stadiaApiKey = process.env.EXPO_PUBLIC_STADIA_MAPS_API_KEY;

const mapStyle = stadiaApiKey
  ? `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${stadiaApiKey}`
  : null;

export default function MapLibreTestScreen() {
    if (!mapStyle) {
        return(
            <View style={styles.messageContainer}>
                <Text>Stadia Maps API key is missing. Check your frontend .env file.</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Map
                style={styles.map}
                mapStyle={mapStyle}
                attribution={true}
            >
                <Camera
                    initialViewState={{center: [-8.608, 41.144], zoom: 12}}
                />
            </Map>

            <View pointerEvents='none' style={styles.attribution}>
                <Text style={styles.attributionText}>© Stadia Maps © OpenMapTiles © OpenStreetMap</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  attribution: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: '#333',
  },
});