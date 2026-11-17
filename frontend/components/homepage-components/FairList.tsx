// Imports
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { categoryIcons } from '@/app/(tabs)/categoryIcons';

// maps categoryIcons.ts to DB
const categoryToIcon: { [key: string]: string } = {
    "Alimentação": "alimentacao",
    "Peixaria": "alimentacao",
    "Gourmet": "alimentacao",

    "Vestuário": "artesanato",
    "Artesanato": "artesanato",
    "Decoração": "artesanato",

    "Velharias": "velharias",

    "Cultura": "cultura",
    "Turismo": "cultura",
    
    "default": "cultura" 
};

// Object Definitions
type ItemProps = {
    id: string; // MUDOU de number para string
    title: string; 
    schedule: string; 
    address: string;
    category: string;
    iconKey: string;
    onPress: (id: string) => void
}
interface FairItem {
    id: string;
    name: string;
    openingHours: string;
    address: string;
    categories: string[];
    imageUrl: string;
    latitude: number;
    longitude: number;
    // Back-end
    title?: string;
    county?: string;
    category?: string;
    iconKey?: string;
    schedule?: string;
}
interface MapListViewProps {
    data: FairItem[];
    onSelect: (item: FairItem) => void;
}

// Card Item Definition
const Item = ({id, title, schedule, address, iconKey}: ItemProps) => {
    // Heart Icon state
    const [isFavorite, setIsFavorite] = useState(false);
    
    // Change state
    const handleFavorite = () => {
        setIsFavorite(prev => !prev);
    };
    
    // Change Heart Icon on click
    const favoriteIconSource = isFavorite 
    ? require('../../assets/map-icons/favorite-icon.png')
    : require('../../assets/map-icons/favorite-outlined-icon.png')
    
    return(
    <TouchableOpacity
    style={styles.card}
    onPress={() => {router.push(`/market/${id}`)}}
    >
        <View>
            <Image
                style={styles.image}
                source={require('../../assets/images/fair-default-image.png')}
            />
        </View>
        <View style={styles.cardContent}>
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
            <View style={styles.categoriesDiv}>
                <View style={styles.categoryIcon}>
                    <Image
                        source={categoryIcons[iconKey] || categoryIcons.default}
                        style={{ width: 18, height: 18, resizeMode: "contain"}}
                    />
                </View>
            </View>
        </View>
    </TouchableOpacity>
    )
}

// Fair List Component Definition
export default function FairList({ data, onSelect }: MapListViewProps) {
    return (
        <FlatList<FairItem>
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                const category = item.categories?.[0] || "default";

                const iconKey =
                    categoryToIcon[category] || categoryToIcon.default;

                return (
                    <Item
                        id={item.id}
                        title={item.name}
                        schedule={item.openingHours}
                        address={item.address}
                        category={category}
                        iconKey={iconKey}
                        onPress={() => onSelect(item)}
                    />
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    cardContent: {
        flex: 1,
        minWidth: 0,
        paddingRight: 0
    },
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
        marginTop: 5,
        flexShrink: 1,
        flexWrap: 'wrap'
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
    },
    categoriesDiv: {
        padding: 10,
    },
    categoryIcon: {
        width: 30,
        height: 30,
        padding: 12,
        borderColor: '#C64F23',
        borderWidth: 0.5,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    }
})