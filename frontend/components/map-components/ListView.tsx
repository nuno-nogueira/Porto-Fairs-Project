import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  BottomSheetFlatList,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';

interface Person {
    id: string | number;
    name: string;
}

interface MapLIstItem {
    id: string | number;
    title: string;
    schedule: string;
    address: string;
    latitude: number;
    longitude: number;
    // category: string;
    // county: string;
    // people: Person[];
    imageUrl ?: string | null;
}

interface MapListViewProps {
    data: MapLIstItem[];
    onSelect: (item: MapLIstItem) => void;
    loading: boolean;
    error: boolean;
}

interface ItemProps {
    item: MapLIstItem;
    onPress: (item: MapLIstItem) => void;
}

const Item = ({ item, onPress }: ItemProps) => {
    const [imageError, setImageError] = React.useState(false);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item)}
            activeOpacity={0.8}
        >
            <Image
                source={
                    imageError || !item.imageUrl
                        ? require('../../assets/images/fair-default-image.png')
                        : { uri: item.imageUrl }
                }
                style={styles.image}
                resizeMode="cover"
                onError={(error) => {
                    console.log(
                        `Failed to load image for ${item.title}:`,
                        item.imageUrl,
                        error.nativeEvent.error
                    );

                    setImageError(true);
                }}
            />

            <View style={styles.infoContainer}>
                <Text style={styles.schedule} numberOfLines={1}>
                    {item.schedule || "Horário não disponível"}
                </Text>

                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>

                <View style={styles.addressContainer}>
                    <Image
                        source={require('../../assets/map-icons/address-icon.png')}
                        style={styles.locationIcon}
                    />

                    <Text style={styles.address} numberOfLines={2}>
                        {item.address}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function MapListView({data, onSelect, loading, error}: MapListViewProps) {
  return (
    <BottomSheetFlatList
      data={data}
      renderItem={({ item }) => (
        <Item item={item} onPress={onSelect} />
      )}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#C64F23" />
              <Text style={styles.emptyText}>
                A carregar feiras...
              </Text>
            </>
          ) : error ? (
            <Text style={styles.emptyText}>
              Não foi possível carregar as feiras. Tenta novamente.
            </Text>
          ) : (
            <Text style={styles.emptyText}>
              Não foram encontradas feiras.
            </Text>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        gap: 12
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 3
    },

    image: {
        width: 88,
        height: 88,
        borderRadius: 10,
        backgroundColor: '#F0F0F0'
    },

    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
        gap: 5
    },

    schedule: {
        fontSize: 11,
        color: '#C64F23',
        fontWeight: '600'
    },

    title: {
        fontSize: 15,
        color: '#292929',
        fontWeight: '700'
    },

    emptyText: {
        textAlign: 'center',
        color: '#777777',
        fontSize: 14,
        paddingVertical: 30,
    },

    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },

    locationIcon: {
        width: 12,
        height: 13,
        resizeMode: 'contain'
    },

    address: {
        flex: 1,
        fontSize: 12,
        color: '#777777'
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 35,
        paddingHorizontal: 20,
    },
})