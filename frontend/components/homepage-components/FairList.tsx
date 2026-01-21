import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { categoryIcons } from '@/app/(tabs)/categoryIcons';
import { ThemedText } from '@/components/themed-text'; 
import { Colors } from '@/constants/theme'; 


interface FairItem {
    id: number;
    title: string;
    schedule: string;
    address: string;
    category: string;
    county: string;
    iconKey: string;
    people: any[];
}

interface ItemProps extends Omit<FairItem, 'people' | 'county'> {
    onPress: () => void;
}

interface MapListViewProps {
    data: FairItem[];
    onSelect: (item: FairItem) => void;
}

const Item = ({ id, title, schedule, address, category, iconKey, onPress }: ItemProps) => {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavorite = () => {
        setIsFavorite(prev => !prev);
    };

    const cardBackgroundColor = theme === 'light' ? '#fff' : 'rgba(29, 37, 49, 0.61)';

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBackgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Image */}
            <View>
                <Image
                    style={styles.image}
                    source={require('../../assets/images/fair-default-image.png')}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.contentContainer}>
                
                {/* Linha do Topo: Horário e Coração */}
                <View style={styles.headerRow}>
                    <ThemedText type="small" style={{ color: colors.tint, fontWeight: '600' }}>
                        {schedule}
                    </ThemedText>
                    
                    <TouchableOpacity onPress={handleFavorite} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Ionicons 
                            name={isFavorite ? "heart" : "heart-outline"} 
                            size={25} 
                            color={colors.tint} 
                        />
                    </TouchableOpacity>
                </View>

                {/* title */}
                <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
                    {title}
                </ThemedText>

                {/* address */}
                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color={colors.icon} style={{ marginRight: 4 }} />
                    <ThemedText type="small" lightColor="#666" darkColor="#ccc" numberOfLines={1} style={{ flex: 1 }}>
                        {address}
                    </ThemedText>
                </View>

                {/* category */}
                <View style={styles.footerRow}>
                    <View style={[styles.categoryIconContainer, { borderColor: colors.tint }]}>
                        <Image 
                            source={categoryIcons[iconKey]} 
                            style={{ width: 18, height: 18, tintColor: theme === 'dark' ? '#fff' : undefined }} 
                            resizeMode="contain"
                        />
                    </View>
                </View>

            </View>
        </TouchableOpacity>
    );
};

export default function FairList({ data, onSelect }: MapListViewProps) {
    return (
        <FlatList<FairItem>
            data={data}
            renderItem={({ item }) => (
                <Item
                    id={item.id}
                    title={item.title}
                    schedule={item.schedule}
                    address={item.address}
                    category={item.category}
                    iconKey={item.iconKey}
                    onPress={() => router.push(`/market/${item.id}`)}
                />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }} 
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 12,
        borderRadius: 16,
        padding: 8,
        paddingRight: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#e1e1e1',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        marginBottom: 2,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIconContainer: {
        width: 28,
        height: 28,
        borderWidth: 1,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});