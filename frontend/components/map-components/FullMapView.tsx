// Imports
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';


// Item Definition
interface FairItem {id: number, title: string; schedule: string; address: string}
interface RouteData {
    driving?: { distance: string; duration: string; arrivalTime: string};
    walking?: { distance: string, duration: string};
    transit?: { distance: string, duration: string};
}
interface FullMapViewProps {
    fair: FairItem;
    onEndRoute: () => void;
    routeInfo: RouteData | null;
    selectedMode: TransportMode;
    onModeChange: (mode: TransportMode) => void;
}
type TransportMode = 'driving' | 'walking' | 'transit';


export default function FullMap({ onEndRoute, routeInfo, selectedMode, onModeChange }: FullMapViewProps) {
    const drivingDuration = routeInfo?.driving?.duration || '....';
    const walkingDuration = routeInfo?.walking?.duration || '....';
    const transitDuration = routeInfo?.transit?.duration || '....';

    const displayedRoute = useMemo(() => {
        const data = routeInfo?.[selectedMode];

        const duration = data?.duration || '...';
        const distance = data?.distance || '...';

        const arrivalTime = (data && 'arrivalTime' in data) ? data.arrivalTime : 'N/A';

        return {duration, distance, arrivalTime}
    }, [selectedMode, routeInfo])
    

    const renderTransportButton = (mode: TransportMode, icon: ImageSourcePropType, duration: string) => (
        <TouchableOpacity
            style={[
                styles.distanceSection,
                selectedMode === mode && styles.selectedMode
            ]}
            onPress={() => onModeChange(mode)}
            activeOpacity={0.7}
        >
            <Image
                source={icon}
                style={[
                    styles.iconStyle,
                    selectedMode === mode && styles.iconActive
                ]}
            />
            <Text
                style={[
                    styles.durationText,
                    selectedMode === mode && styles.durationActiveText
                ]}
            >
                {duration}
            </Text>
        </TouchableOpacity>
    )
    
    return(
        <View style={styles.container}>
            <View style={styles.detailsColumn}>
                <Text style={styles.mainDurationText}>{displayedRoute.duration}</Text>
                <View style={styles.routeDetails}>
                    <Text style={styles.detailText}>{displayedRoute.distance}</Text>
                    <View style={styles.detailSeparator}></View>
                    <Text style={styles.detailText}>{displayedRoute.arrivalTime}</Text>
                </View>

                <View style={styles.transportContainer}> 
                    <View style={styles.distanceInfo}>
                        {renderTransportButton('walking', require('../../assets/map-icons/walk-icon.png'), walkingDuration)}
                        {renderTransportButton('driving', require('../../assets/map-icons/car-icon.png'), drivingDuration)}
                        {renderTransportButton('transit', require('../../assets/map-icons/bus-icon.png'), transitDuration)}
                    </View>
                    <View style={styles.line}>
                        {selectedMode === 'walking' && <View style={[styles.activeLineBase, styles.activeLineWalking]} />}
                        {selectedMode === 'driving' && <View style={[styles.activeLineBase, styles.activeLineDriving]} />}
                        {selectedMode === 'transit' && <View style={[styles.activeLineBase, styles.activeLineTransit]} />}
                    </View>
                </View>
            </View>
            <View>
                <TouchableOpacity style={styles.endRouteButton} onPress={onEndRoute}>
                    <Text style={{color: 'white', fontWeight: 600}}>Sair</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    detailsColumn: {
        flex: 1, 
        flexDirection: 'column',
    },
    buttonColumn: {
        marginLeft: 20,
        alignSelf: 'flex-end',
    },
    mainDurationText: {
        fontSize: 22, 
        fontWeight: 'bold', 
        marginLeft: 15
    },
    routeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        marginTop: 15,
        columnGap: 10
    },
    transportContainer: { 
        marginLeft: 15, 
        marginTop: 20, 
        width: 300,
    },
    distanceInfo: {
        marginBottom: 10,
        columnGap: 20,
        flexDirection: 'row',
    },
    line: {
        width: '100%', 
        backgroundColor: 'rgba(250, 182, 171, 0.5)',
    },
    activeLineBase: { 
        height: 2,
        backgroundColor: '#C64F23', 
    },
    activeLineWalking: {
        width: 90,
        marginLeft: 0,
    },
    activeLineDriving: {
        width: 110,
        marginLeft: 90,
    },
    activeLineTransit: {
        width: 100,
        marginLeft: 210, 
    },
    detailText: {
        color: '#7A716E', 
        fontSize: 18
    },
    detailSeparator: {
        width: 5, 
        height: 5, 
        borderRadius: 50, 
        backgroundColor: '#C64F23'
    },
    transportButtonsContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginLeft: 15,
        columnGap: 20,
    },
    distanceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    selectedMode: {
        backgroundColor: '#FAE8E1'
    },
    iconStyle: {
        tintColor: '#7A716E',
        width: 18, 
        height: 18,
    },
    iconActive: {
        tintColor: '#C64F23', 
    },
    durationText: {
        color: '#7A716E',
        marginLeft: 5,
        fontWeight: '500',
        fontSize: 14
    },
    durationActiveText: {
        color: '#C64F23',
        fontWeight: 'bold',
    },
    endRouteButton: {
        backgroundColor: '#C64F23',
        margin: 'auto',
        width: 90,
        height: 35,
        marginBottom: 30,
        marginLeft: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
})