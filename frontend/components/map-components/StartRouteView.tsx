// Imports
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';

// Item Definitions
interface FairItem {id: number, title: string; schedule: string; address: string}
type TransportMode = "driving" | "walking" | "transit";
interface RouteData {
    driving?: { distance: string; duration: string; arrivalTime: string};
    walking?: { distance: string, duration: string};
    transit?: { distance: string, duration: string};
}
interface DisplayedRouteData {
    distance: string;
    duration: string;
    arrivalTime: string;
}
interface StartRouteProps {
    fair: FairItem;
    onBeginRoute: () => void;
    routeInfo: RouteData | null;
    selectedMode: TransportMode;
    onModeChange: (mode: TransportMode) => void;
}
interface RoutePointsProps {
    title: string;
    address: string;
    isOrigin: boolean;
}

// Route Marker Definition
const RoutePoint = ({ title, address, isOrigin}: RoutePointsProps) => {
    return (
        <View>
            <Text style={styles.pointTitle}>{isOrigin ? 'A tua localização' : title}</Text>
            <Text style={styles.pointAddress}>{isOrigin ? 'Localização Atual' : address}</Text>
        </View>
    )
}

export default function StartRoute({ fair, onBeginRoute, routeInfo, selectedMode, onModeChange }: StartRouteProps) {
    // Use Sate for default marker order
    const [isDefaultOrder, setIsDefaultOrder] = useState(true);

    // Get duration & distance with Google Maps API
    const displayedRoute: DisplayedRouteData = useMemo(() => {
        const data = routeInfo?.[selectedMode];

        const distance = data?.distance || '...';
        const duration = data?.duration || '...';

        const arrivalTime = (data && 'arrivalTime' in data) ? data.arrivalTime : 'N/A';
        return { distance, duration, arrivalTime}
    }, [selectedMode, routeInfo])

    // Get duration for driving, walking & transit mode
    const drivingDuration = routeInfo?.driving?.duration || '...';
    const walkingDuration = routeInfo?.walking?.duration || '...';
    const transitDuration = routeInfo?.transit?.duration || '...';

    // Origin & Destination Points
    const originPoint = {
        title: 'A tua localização',
        address: 'Localização Atual',
        isOrigin: true
    }

    const destinationPoint = {
        title: fair.title,
        address: fair.address,
        isOrigin: false
    }

    // Define first & second points based on the point coordinates
    const firstPoint = isDefaultOrder ? originPoint : destinationPoint;
    const secondPoint = isDefaultOrder ? destinationPoint : originPoint;

    // Swap origin & destination points
    const handleSwap = () => {
        setIsDefaultOrder(prev => !prev)
    }

    // Render transport mode buttons
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

    return (
        <View style={styles.container}>
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
            
            <View>
                <Text style={styles.title}>{fair.title}</Text>
                <View style={styles.details}>
                    <Image source={require('../../assets/map-icons/distance-icon.png')} />
                    <Text style={{color: '#7A716E'}}>{displayedRoute.distance}</Text>
                    {displayedRoute.distance !== '...' && (
                        <View style={styles.detailSeparator}></View>
                    )}
                    
                    <Text>{displayedRoute.arrivalTime}</Text>
                </View>
            </View>

            <View style={styles.routeHeader}>
                <View style={styles.addressSection}>
                    <View style={styles.pointContainer}>
                        <View style={styles.iconColumn}>
                            <Image
                                source={require('../../assets/map-icons/yellow-dot-icon.png')}
                                style={styles.dotImage}
                            />
                        </View>
                        <View style={styles.dottedLineContainer}>
                            <View style={styles.dottedLine}/>
                        </View>

                        <RoutePoint
                            title={firstPoint.title}
                            address={firstPoint.address}
                            isOrigin={firstPoint.isOrigin}
                        />
                    </View>
                
                    <View style={styles.pointContainer}>
                        <View style={styles.iconColumn}>
                            <Image
                                source={require('../../assets/map-icons/orange-dot-icon.png')}
                                style={styles.dotImage}
                            />
                        </View>

                        <RoutePoint
                            title={secondPoint.title}
                            address={secondPoint.address}
                            isOrigin={secondPoint.isOrigin}
                        />
                    </View>
                </View>

                <TouchableOpacity onPress={handleSwap} style={styles.swapButton}>
                    <Image source={require('../../assets/map-icons/swap-route-icon.png')} style={styles.swapIcon} />
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={styles.startRouteButton} onPress={onBeginRoute}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Iniciar Rota</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    distanceInfo: {
        flexDirection: 'row',
        columnGap: 40,
        marginBottom: 10
    },
    distanceSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    selectedMode: {
        backgroundColor: '#FAE8E1'
    },
    iconStyle: {
        tintColor: '#7A716E',
    },
    iconActive: {
        tintColor: '#C64F23', 
    },
    durationText: {
        color: '#7A716E',
        marginLeft: 5,
        fontWeight: '500',
    },
    durationActiveText: {
        color: '#C64F23',
        fontWeight: 'bold',
    },
    line: {
        width: 300,
        height: 2,
        backgroundColor: 'rgba(250, 182, 171, 0.5)',
        position: 'relative'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 30
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        marginTop: 15,
        columnGap: 5
    },
    detailSeparator: {
        width: 5, 
        height: 5, 
        borderRadius: 50, 
        backgroundColor: '#C64F23'
    },
    routeHeader: {
        flexDirection: 'row',
        paddingRight: 10,
        paddingLeft: 15,
        marginBottom: 10,
        marginTop: 40
    },
    addressSection: {
        flex: 1, 
    },
    pointContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    iconColumn: {
        marginRight: 15,
    },
    pointTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pointAddress: {
        fontSize: 14,
        color: '#7A716E',
    },
    dotImage: {
        width: 18, 
        height: 18,
    },
    dottedLineContainer: {
        position: 'absolute',
        top: 5, 
        bottom: -15, 
        width: '100%',
        marginLeft: 8
        
    },
    dottedLine: {
        width: 1, 
        flex: 1, 
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#FFB800', 
    },
    swapButton: {
        paddingTop: 30,
        marginRight: 15
    },
    swapIcon: {
        width: 18,
        height: 40,
        resizeMode: 'contain',
        tintColor: '#C64F23', 
    },
    startRouteButton: {
        backgroundColor: '#C64F23',
        margin: 'auto',
        width: 280,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },

    transportContainer: { 
        alignSelf: 'center',
        width: 300, 
        marginTop: 20
    },

    activeLineBase: { 
        height: 2,
        backgroundColor: '#C64F23', 
        position: 'absolute',
        bottom: 0,
    },

    activeLineWalking: {
        width: 80,
        marginLeft: 0,
    },
    activeLineDriving: {
        width: 130,
        marginLeft: 80
    },
    activeLineTransit: {
        width: 90,
        marginLeft: 210, 
    },
});