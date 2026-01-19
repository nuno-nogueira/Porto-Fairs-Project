// Imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Item Definitions
interface FairItem {id: number, title: string; schedule: string; address: string}
interface FairDetailsProps {
    fair: FairItem;
    onBack: () => void;
    onStartRoute: () => void;
    routeInfo: {driving?: { distance: string; duration: string; arrivalTime: string}} | null;
}

// Fair Details Definition
export default function FairDetails({ fair, onBack, onStartRoute, routeInfo }: FairDetailsProps) {
    // Heart Icon state
    const [isFavorite, setIsFavorite] = useState(false);
    const distanceDisplay = routeInfo?.driving?.distance || 'A calcular...'

    // Change state
    const handleFavorite = () => {
        setIsFavorite(prev => !prev);

        // backend later
    };

    // Change Heart Icon on click
    const favoriteIconSource = isFavorite 
    ? require('../../assets/map-icons/favorite-icon.png')
    : require('../../assets/map-icons/favorite-outlined-icon.png')

    // If no fair was selected or some error shows up
    if (!fair) return <View><Text>Nenhum detalhe selecionado.</Text></View>

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity style={{position: 'absolute',  marginTop: -40}} onPress={onBack}>
                    <Ionicons style={{backgroundColor: 'white', padding: 5, borderColor: '#C64F23', borderWidth: 0.5, borderRadius: 20}} name="chevron-back" size={24} color={'#C64F23'} />
                </TouchableOpacity>
                <Image
                    // Fair Default Image
                    source={require('../../assets/images/fair-default-image.png')}
                    style={styles.image}
                />
                <TouchableOpacity style={styles.seeMoreButton} onPress={onBack}>
                    <Text style={{color: '#C64F23', fontWeight: 700}}>Ver Mais</Text>
                </TouchableOpacity>
            </View>
            <View>
                <View>
                    <Text style={styles.title}>{fair.title}</Text>
                    <Text style={{fontSize: 14, color: '#F88B72'}}>{fair.schedule}</Text>
                    <View style={styles.fairInfo}>
                        <View style={styles.infoSection}>
                            <Image source={require('../../assets/map-icons/distance-icon.png')}
                        />
                            <Text style={{fontSize: 12, color: '#7A716E'}}>{distanceDisplay}</Text>
                        </View>
                        <View style={styles.infoSection}>
                            <Image source={require('../../assets/map-icons/schedule-icon.png')}/>
                            <Text style={{fontSize: 12, color: '#7A716E'}}>Das 08h - 12h</Text>
                        </View>
                    </View>
                    <View style={styles.actionSection}>
                        <Image source={require('../../assets/map-icons/share-icon.png')}/>
                        <TouchableOpacity onPress={handleFavorite}>
                            <Image source={favoriteIconSource}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.seeRouteButton} onPress={onStartRoute}>
                        <Image source={require('../../assets/map-icons/route-icon.png')} />
                        <Text style={{color: 'white', fontWeight: 'bold'}}>Ver Rota</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 120,
        height: 130,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    container: {
        flexDirection: 'row',
        columnGap: 15,
        padding: 20,
        marginTop: 20
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    seeMoreButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: 'rgba(161, 159, 159, 0.3)',
        borderWidth: 1,
        width: 120,
        height: 40,
        marginTop: 20,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    seeRouteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#C64F23',
        width: 190,
        height: 40,
        marginTop: 20,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        columnGap: 15
    },
    fairInfo: {
        flexDirection: 'row',
        marginTop: 15,
        columnGap: 10
    },
    infoSection: {
        flexDirection: 'row',
        columnGap: 5
    },
    actionSection: {
        flexDirection: 'row',
        marginTop: 20,
        columnGap: 20
    }
});