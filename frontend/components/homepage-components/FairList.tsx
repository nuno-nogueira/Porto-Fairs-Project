// Imports
import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';

// Object Definitions
type ItemProps = {
    id: number, 
    title: string; 
    schedule: string; 
    address: string;
    category: string;
    //onPress: (item: FairItem) => void
}
interface FairItem {
    id: number, 
    title: string; 
    schedule: string; 
    address: string, 
    category: string;
    county: string;
    people: any[];
}
interface MapListViewProps {
    data: FairItem[];
    //onSelect: (item: FairItem) => void;
}

// Card Item Definition
const Item = ({id, title, schedule, address, category}: ItemProps) => {
    // Heart Icon state
    const [isFavorite, setIsFavorite] = useState(false);
    
    // Change state
    const handleFavorite = () => {
        setIsFavorite(prev => !prev);

        // backend later
    };

    // Change Heart Icon on click
    const favoriteIconSource = isFavorite 
    ? require('../../assets/map-icons/favorite-icon.png')
    : require('../../assets/map-icons/favorite-outlined-icon.png')
    
    return(
    <TouchableOpacity
    style={styles.card}
    //onPress={() => onPress({ id, title, schedule, address, category})}
    >
        <View>
            <Image
                style={styles.image}
                source={require('../../assets/images/fair-default-image.png')}
            />
        </View>
        <View>
            <View style={{flexDirection: 'row'}}>
                <Text style={styles.schedule}>{schedule}</Text>
                <TouchableOpacity onPress={handleFavorite} style={{position: 'absolute'}}>
                    <Image style={styles.favoriteIcon} source={favoriteIconSource}/>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.addressDiv}>
                <Image
                    source={require('../../assets/map-icons/address-icon.png')}
                    style={styles.locationIcon}
                />
                <Text style={styles.address}>{address}</Text>
            </View>
        </View>
    </TouchableOpacity>
    )
}

// Fair List Component Definition
export default function FairList({ data }: MapListViewProps) {
    
    return(
        <FlatList<FairItem> 
        data= {data}
        renderItem={({item}: {item: FairItem}) => 
        <Item
            id={item.id}
            title={item.title} 
            schedule={item.schedule} 
            address={item.address}
            category={item.category}
            //onPress={onSelect}    
        />}
        keyExtractor={(item: FairItem) => item.id.toString()}
        />
    )
}

const styles = StyleSheet.create({
    image: {
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    card: {
        flexDirection: 'row',
        padding: 5,
        width: '100%',
        marginBottom: 10,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        backgroundColor: 'white'
    },
    schedule: {
        color: '#F88B72',
        fontSize: 12,
        marginLeft: 15,
        marginTop: 5
    },
    favoriteIcon: {
        marginLeft: 180,
        marginTop: 5
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        padding: 5,
        marginLeft: 10,
        marginTop: 5
    },
    locationIcon: {
        marginLeft: 12,
        marginTop: 5
    },
    addressDiv: {
        flexDirection: 'row'
    },
    address: {
        fontSize: 12,
        marginTop: 5,
        paddingRight: 25,
        paddingLeft: 5,
    }
})