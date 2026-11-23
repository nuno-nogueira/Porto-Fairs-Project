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

import type { RouteCalculation, TransportMode } from '@/types/Route';
import {getRouteSummary, getRouteDurationLabel} from '@/utils/routeFormatting';

// Item Definition
interface FairItem {
    id: string | number;
    title: string;
    schedule: string;
    address: string;
}

interface FullMapViewProps {
    fair: FairItem;
    onEndRoute: () => void;
    routeInfo: RouteCalculation | null;
    routeLoading: boolean;
    routeError: string | null;
    selectedMode: TransportMode;
    onModeChange: (mode: TransportMode) => void;
}

interface TransportOption {
    mode: TransportMode;
    icon: ImageSourcePropType;
}

const transportOptions: TransportOption[] = [
    {
        mode: 'walking',
        icon: require('../../assets/map-icons/walk-icon.png'),
    },
    {
        mode: 'driving',
        icon: require('../../assets/map-icons/car-icon.png'),
    },
    {
        mode: 'transit',
        icon: require('../../assets/map-icons/bus-icon.png'),
    },
];

export default function FullMap({
    fair,
    onEndRoute,
    routeInfo,
    routeLoading,
    routeError,
    selectedMode,
    onModeChange,
}: FullMapViewProps) {
    const displayedRoute = getRouteSummary(selectedMode, routeInfo);
    const displayedDuration = getRouteDurationLabel(selectedMode, routeInfo, routeLoading);
    const displayedDistance = displayedRoute?.distance ?? (routeLoading ? 'A calcular...' : '--');
    const displayedArrival = displayedRoute?.arrivalTime ?? (routeLoading ? 'A calcular...' : '--');
    const selectedAttribution = selectedMode === 'transit' ? null : routeInfo?.[selectedMode]?.attribution ?? null;

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
                        {displayedDuration}
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
                            {displayedDistance}
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
                            {displayedArrival}
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
                                getRouteDurationLabel(option.mode, routeInfo, routeLoading)
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

                {routeLoading && (
                    <Text style={styles.routeStatusText}>A calcular percursos...</Text>
                )}

                {routeError && (
                    <Text style={styles.routeErrorText}>{routeError}</Text>
                )}

                {selectedAttribution && (
                    <Text style={styles.attributionText}>{selectedAttribution}</Text>
                )}
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
        left: 70
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
        marginTop: 40
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

    
    disabledButton: {
        opacity: 0.6,
    },

    routeStatusText: {
        fontSize: 11,
        color: '#C64F23',
        textAlign: 'center',
        marginTop: -9,
        marginBottom: 10,
    },

    routeErrorText: {
        fontSize: 11,
        color: '#B42318',
        textAlign: 'center',
        marginBottom: 10,
    },

    attributionText: {
        fontSize: 9,
        color: '#8A807C',
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 14,
    },
});