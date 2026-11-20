// Imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Item Definitions
interface FairItem {
    id: number | string;
    title: string;
    schedule: string;
    address: string;
}

type TransportMode = 'driving' | 'walking' | 'transit';

interface RouteData {
    driving ?: { distance: string, duration: string; arrivalTime: string};
    walking ?: { distance: string; duration: string};
    transit ?: { distance: string; duration: string};
}

interface StartRouteProps {
    fair: FairItem;
    onBeginRoute: () => void;
    onBack: () => void;
    routeInfo: RouteData | null;
    selectMode: TransportMode;
    onModeChange: (mode: TransportMode) => void;
}

interface StartRouteProps {
    fair: FairItem;
    onBeginRoute: () => void;
    onBack: () => void;
    routeInfo: RouteData |  null;
    selectMode: TransportMode;
    onModeChange: (mode: TransportMode) => void;
}

interface RoutePointProps {
    title: string;
    address: string;
    isOrigin: boolean;
}

const transportOptions: {
    mode: TransportMode;
    label: string;
    duration: string;
    icon: ImageSourcePropType
}[] = [
    {
        mode: 'walking',
        label: 'A pé',
        duration: '25 min',
        icon: require('../../assets/map-icons/walk-icon.png'),
    }, 
    {
        mode: 'driving',
        label: 'Carro',
        duration: '12 min',
        icon: require('../../assets/map-icons/car-icon.png'),
    },
    {
        mode: 'transit',
        label: 'Transportes',
        duration: '30 min',
        icon: require('../../assets/map-icons/bus-icon.png'),
    },
]

const RoutePoint = ({ title, address, isOrigin }: RoutePointProps) => {
    return(
        <View style={styles.pointRow}>
            <View style={styles.markerColumn}>
                <View
                    style={[
                        styles.marker,
                        isOrigin ? styles.originMarker : styles.destinationMarker
                    ]}
                />
            </View>

            <View style={styles.pointTextContainer}>
                <Text style={styles.pointTitle} numberOfLines={1}>{title}</Text>

                <Text style={styles.pointAddress} numberOfLines={1}>{address}</Text>
            </View>
        </View>
    );
}

export default function StartRoute({
    fair,
    onBeginRoute,
    onBack,
    selectMode,
    onModeChange
}: StartRouteProps) {
    const [isDefaultOrder, setIsDefaultOrder] = useState(true);

    const originPoint = {
        title: 'A tua localização',
        address: 'Localização atual',
        isOrigin: true,
    };

    const destinationPoint = {
        title: fair.title,
        address: fair.address,
        isOrigin: false
    }

    const firstPoint = isDefaultOrder ? originPoint : destinationPoint;
    const secondPoint = isDefaultOrder ? destinationPoint : originPoint;

    const handleSwap = () => {
        setIsDefaultOrder(prev => !prev);
    }

    return(
        <View style={styles.container}>
            { /* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Planear Rota</Text>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onBack}
                    activeOpacity={0.7}
                    accessibilityRole='button'
                    accessibilityLabel='Fechar'
                >
                    <Ionicons name="close" size={21} color='#7A716E' />
                </TouchableOpacity>
            </View>

            { /* Transport Options */ }
            <View style={styles.transportContainer}>
                {transportOptions.map(option => {
                    const isSelected = selectMode === option.mode;

                    return(
                        <TouchableOpacity
                            key={option.mode}
                            style={[
                                styles.transportOption,
                                isSelected && styles.selectedTransportOption
                            ]}
                            onPress={() => onModeChange(option.mode)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                        >
                            <Image
                                source={option.icon}
                                style={[
                                    styles.transportIcon,
                                    isSelected && styles.activeTransportIcon
                                ]}
                                resizeMode="contain"
                            />

                            <Text
                                style={[
                                    styles.transportLabel,
                                    isSelected && styles.activeTransportLabel
                                ]}
                                numberOfLines={1}
                            >
                                {option.label}
                            </Text>

                            <Text
                                style={[
                                    styles.transportDuration,
                                    isSelected && styles.activeTransportLabel,
                                ]}
                            >
                                {option.duration}
                            </Text>

                        </TouchableOpacity>
                    )
                })}
            </View>

            <View style={styles.routeSummary}>
                <View style={styles.summaryItem}>
                    <Ionicons name="navigate-outline" size={16} color="#7A716E" />
                    <Text style={styles.summaryText}>3,6 km</Text>
                </View>

                <View style={styles.summarySeparator} />

                <View style={styles.summaryItem}>
                    <Ionicons name="time-outline" size={16} color="#7A716E" />
                    <Text style={styles.summaryText}>Chegada às 12:45</Text>
                </View>
            </View>

            {/* Route Points */}
            <View style={styles.routeSection}>
                <View style={styles.routeHeader}>
                    <Text style={styles.sectionTitle}>Percurso</Text>

                    <TouchableOpacity
                        onPress={handleSwap}
                        style={styles.swapButton}
                        activeOpacity={0.7}
                        accessibilityRole='button'
                        accessibilityLabel='Inverter origem e destino'
                    >
                        <Ionicons
                            name="swap-vertical"
                            size={18}
                            color='#C64F23'
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.routePoints}>
                    <View style={styles.connector}/>

                    <RoutePoint
                        title={firstPoint.title}
                        address={firstPoint.address}
                        isOrigin={firstPoint.isOrigin}
                    />

                    <RoutePoint
                        title={secondPoint.title}
                        address={secondPoint.address}
                        isOrigin={secondPoint.isOrigin}
                    />

                </View>
            </View>

            { /* Start Route */ }
            <TouchableOpacity
                style={styles.startRouteButton}
                onPress={onBeginRoute}
                activeOpacity={0.85}
                accessibilityRole='button'
            >
                <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />

                <Text style={styles.startRouteButtonText}>Iniciar Rota</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 14,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#302824',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F0ED',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Transport options
    transportContainer: {
        flexDirection: 'row',
        gap: 9,
        marginBottom: 17,
    },
    transportOption: {
        flex: 1,
        height: 65,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE5E1',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 3,
        paddingHorizontal: 4,
    },
    selectedTransportOption: {
        backgroundColor: '#FAE8E1',
        borderColor: '#E8B6A2',
    },
    transportIcon: {
        width: 19,
        height: 19,
        tintColor: '#7A716E',
    },
    activeTransportIcon: {
        tintColor: '#C64F23',
    },
    transportLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#7A716E',
    },
    activeTransportLabel: {
        color: '#C64F23',
        fontWeight: '700',
    },

    // Route section
    routeSection: {
        marginBottom: 16,
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 11,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#302824',
    },
    swapButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FAE8E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    routePoints: {
        gap: 11,
        position: 'relative',
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 38,
    },
    markerColumn: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        zIndex: 1,
    },
    marker: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
    },
    originMarker: {
        borderColor: '#FFB800',
    },
    destinationMarker: {
        borderColor: '#C64F23',
    },
    connector: {
        position: 'absolute',
        top: 19,
        bottom: 19,
        left: 11,
        borderLeftWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#E5C5B8',
    },
    pointTextContainer: {
        flex: 1,
    },
    pointTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#302824',
    },
    pointAddress: {
        fontSize: 11,
        color: '#8A807C',
        marginTop: 2,
    },

    // Start route button
    startRouteButton: {
        height: 45,
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#C64F23',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    startRouteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    transportDuration: {
        fontSize: 10,
        color: '#7A716E',
        fontWeight: '500',
    },

    routeSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        marginTop: -5,
        marginBottom: 16,
    },

    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    summaryText: {
        fontSize: 12,
        color: '#7A716E',
        fontWeight: '500',
    },

    summarySeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C64F23',
    },
});