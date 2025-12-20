// Imports
import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

// Item Definitions
type ItemProps = {id: number, title: string; schedule: string; address: string, latitude: number, longitude: number, onPress: (item: FairItem) => void}
interface FairItem {id: number, title: string; schedule: string; address: string, latitude: number, longitude: number}
interface MapListViewProps {
    data: FairItem[];
    onSelect: (item: FairItem) => void;
}

const Item = ({id, title, schedule, address, latitude, longitude, onPress}: ItemProps) => (
  <TouchableOpacity 
  // Fair Card Info
  style={styles.card}
  onPress={() => onPress({ id, title, schedule, address, latitude, longitude })}>
    <View>
        <Image
            source={require('../../assets/images/fair-default-image.png')}
            style={styles.image}
        />
    </View>
    <View>
        <Text style={styles.schedule}>{schedule}</Text>
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
);

export default function MapListView({ data, onSelect }: MapListViewProps) {
  return (
        <BottomSheetFlatList<FairItem>
        data = {data}
        // Iterate through each fair to render the cards
        renderItem={({item}: {item: FairItem}) => 
        <Item 
            id={item.id}
            title={item.title} 
            schedule={item.schedule} 
            address={item.address}
            latitude={item.latitude}
            longitude={item.longitude}
            onPress={onSelect}    
        />}
        horizontal={true}
        keyExtractor={(item: FairItem) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        />
  );
};

const styles = StyleSheet.create({
    image: {
        width: '90%',
        height: 120,
        marginBottom: 8,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        margin: 'auto'
    },
    card: {
        backgroundColor: 'white',
        padding: 5,
        height: 250,
        width: 180,
        marginRight: 15,
        marginBottom: -15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    schedule: {
        fontSize: 12,
        color: '#F88B72',
        marginLeft: 15
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 5,
        marginLeft: 10
    },
    locationIcon: {
        marginLeft: 12,
        marginTop: 3
    },
    addressDiv: {
        flexDirection: 'row'
    },
    address: {
        paddingRight: 25,
        paddingLeft: 5 
    }
});
