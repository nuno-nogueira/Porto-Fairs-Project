import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Item Definition
interface FairItem {
    id: string | number;
    title: string;
    schedule: string;
    address: string;
}

type TransportMode = 'driving' | 'walking' | 'transit';

interface RouteData {
    driving?: { distance: string; duration: string; arrivalTime: string };
    walking?: { distance: string; duration: string };
    transit?: { distance: string; duration: string };
}

interface FullMapViewProps {
    fair: FairItem;
    onEndRoute: () => void;
    routeInfo: RouteData | null;
    selectedMode: TransportMode;
    onModeChange: (mode: TransportMode) => void;
}

interface TransportOption {
    mode: TransportMode;
    icon: ImageSourcePropType;
    duration: string;
}

// Static route information
const STATIC_ROUTE_INFO: Record<
    TransportMode,
    { duration: string; distance: string; arrivalTime: string }
> = {
    walking: {
        duration: '25 min',
        distance: '3,2 km',
        arrivalTime: 'Chegada às 12:58',
    },
    driving: {
        duration: '12 min',
        distance: '3,6 km',
        arrivalTime: 'Chegada às 12:45',
    },
    transit: {
        duration: '30 min',
        distance: '4,2 km',
        arrivalTime: 'Chegada às 13:03',
    },
};

// Transport options
const transportOptions: TransportOption[] = [
    {
        mode: 'walking',
        icon: require('../../assets/map-icons/walk-icon.png'),
        duration: STATIC_ROUTE_INFO.walking.duration,
    },
    {
        mode: 'driving',
        icon: require('../../assets/map-icons/car-icon.png'),
        duration: STATIC_ROUTE_INFO.driving.duration,
    },
    {
        mode: 'transit',
        icon: require('../../assets/map-icons/bus-icon.png'),
        duration: STATIC_ROUTE_INFO.transit.duration,
    },
];

export default function FullMap({
    fair,
    onEndRoute,
    selectedMode,
    onModeChange,
}: FullMapViewProps) {
    // Static information for the selected transport mode
    const displayedRoute = STATIC_ROUTE_INFO[selectedMode];

    // Render transport selection buttons
    const renderTransportButton = (
        mode: TransportMode,
        icon: ImageSourcePropType,
        duration: string,
    ) => {
        const isSelected = selectedMode === mode;

        return (
            <TouchableOpacity
                key={mode}
                style={[
                    styles.distanceSection,
                    isSelected && styles.selectedMode,
                ]}
                onPress={() => onModeChange(mode)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
            >
                <Image
                    source={icon}
                    style={[
                        styles.iconStyle,
                        isSelected && styles.iconActive,
                    ]}
                    resizeMode="contain"
                />

                <Text
                    style={[
                        styles.durationText,
                        isSelected && styles.durationActiveText,
                    ]}
                >
                    {duration}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Route information */}
            <View style={styles.detailsColumn}>

                {/* Destination and main duration */}
                <View style={styles.destinationHeader}>
                    <View style={styles.destinationInfo}>
                        <Text style={styles.destinationLabel}>
                            A caminho de...
                        </Text>

                        <Text
                            style={styles.destinationTitle}
                            numberOfLines={1}
                        >
                            {fair.title}
                        </Text>
                    </View>

                    <Text style={styles.mainDurationText}>
                        {displayedRoute.duration}
                    </Text>
                </View>

                {/* Distance and arrival information */}
                <View style={styles.routeDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons
                            name="navigate-outline"
                            size={15}
                            color="#7A716E"
                        />

                        <Text style={styles.detailText}>
                            {displayedRoute.distance}
                        </Text>
                    </View>

                    <View style={styles.detailSeparator} />

                    <View style={styles.detailItem}>
                        <Ionicons
                            name="time-outline"
                            size={15}
                            color="#7A716E"
                        />

                        <Text style={styles.detailText}>
                            {displayedRoute.arrivalTime}
                        </Text>
                    </View>
                </View>

                {/* Transport options */}
                <View style={styles.transportContainer}>
                    <View style={styles.distanceInfo}>
                        {transportOptions.map(option =>
                            renderTransportButton(
                                option.mode,
                                option.icon,
                                option.duration,
                            ),
                        )}
                    </View>

                    {/* Selected transport indicator */}
                    <View style={styles.line}>
                        {selectedMode === 'walking' && (
                            <View
                                style={[
                                    styles.activeLineBase,
                                    styles.activeLineWalking,
                                ]}
                            />
                        )}

                        {selectedMode === 'driving' && (
                            <View
                                style={[
                                    styles.activeLineBase,
                                    styles.activeLineDriving,
                                ]}
                            />
                        )}

                        {selectedMode === 'transit' && (
                            <View
                                style={[
                                    styles.activeLineBase,
                                    styles.activeLineTransit,
                                ]}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* End route button */}
            <View style={styles.buttonColumn}>
                <TouchableOpacity
                    style={styles.endRouteButton}
                    onPress={onEndRoute}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Sair da rota"
                >
                    <Ionicons
                        name="close-outline"
                        size={17}
                        color="#FFFFFF"
                    />

                    <Text style={styles.endRouteText}>
                        Sair
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Main card
    container: {
        paddingHorizontal: 16,
        paddingTop: 13,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },

    detailsColumn: {
        flex: 1,
        flexDirection: 'column',
        minWidth: 0,
    },

    // Destination and duration
    destinationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    destinationInfo: {
        flex: 1,
        minWidth: 0,
    },

    destinationLabel: {
        fontSize: 10,
        color: '#8A807C',
        fontWeight: '500',
        marginBottom: 2,
    },

    destinationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#302824',
    },

    mainDurationText: {
        fontSize: 19,
        fontWeight: '800',
        color: '#C64F23',
    },

    // Route details
    routeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 9,
    },

    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    detailText: {
        color: '#7A716E',
        fontSize: 11,
        fontWeight: '500',
    },

    detailSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C64F23',
    },

    // Transport options
    transportContainer: {
        marginTop: 11,
        width: '100%',
    },

    distanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
    },

    distanceSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: '#F5F0ED',
    },

    selectedMode: {
        backgroundColor: '#FAE8E1',
    },

    iconStyle: {
        tintColor: '#7A716E',
        width: 16,
        height: 16,
    },

    iconActive: {
        tintColor: '#C64F23',
    },

    durationText: {
        color: '#7A716E',
        fontWeight: '500',
        fontSize: 10,
    },

    durationActiveText: {
        color: '#C64F23',
        fontWeight: '700',
    },

    // Active transport indicator
    line: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(250, 182, 171, 0.5)',
        position: 'relative',
        marginTop: 5,
    },

    activeLineBase: {
        height: 2,
        backgroundColor: '#C64F23',
        position: 'absolute',
        top: 0,
    },

    activeLineWalking: {
        width: '33.33%',
        left: 0,
    },

    activeLineDriving: {
        width: '33.33%',
        left: '33.33%',
    },

    activeLineTransit: {
        width: '33.33%',
        left: '66.66%',
    },

    // End route button
    buttonColumn: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    endRouteButton: {
        backgroundColor: '#C64F23',
        width: 66,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 2,
    },

    endRouteText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
});