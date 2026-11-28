
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Image,
    View,
    TouchableOpacity,
    FlatList,
    Text,
    Alert
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { categoryIcons } from './categoryIcons';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SearchBarComponent from '@/components/homepage-components/SearchBar';
import FairList from '@/components/homepage-components/FairList';

import categories from '../data/categories.json';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import api from '@/api/axios';

// Query resolver 'markets'
const GET_MARKETS = gql`
    query GetMarkets {
        markets {
            id
            name
            openingHours
            address
            categories
            latitude
            longitude
            imageUrl
        }
    }
`;

// Object Definitions
interface Person {
    id: string | number;
    name: string;
}

interface FavoriteRecord {
    id: string;
    userId: string;
    targetValue: 'market' | 'seller';
    targetId: string;
}

interface ServiceResponse<T> {
    message?: string;
    data: T | null;
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

    // Back-end / optional properties
    title?: string;
    county?: string;
    people?: Person[];
    category?: string;
    iconKey?: string;
    schedule?: string;
}

interface FavoritesState {
    userId: string;
    records: FavoriteRecord[];
}

// Homepage Screen Definition
export default function HomepageScreen() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const {
        user,
        logout,
        loading: authLoading
    } = useAuth();

    // Favorites state is associated with the authenticated user.
    const [favoritesState, setFavoritesState] =
        useState<FavoritesState | null>(null);

    const [updatingFavoriteIds, setUpdatingFavoriteIds] =
        useState<Set<string>>(new Set());

    const handleSelectMarket = (item: FairItem) => {
        router.push(`/market/${item.id}`);
    };

    const loadFavorites = useCallback(
        async (userId: string): Promise<FavoriteRecord[]> => {
            try {
                const response = await api.get<ServiceResponse<FavoriteRecord[]>>(
                    `/favorites/user/${userId}`
                );

                return response.data?.data ?? [];

            } catch (error) {
                // The backend returns 404 when the user has no favorites.
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    return [];
                }

                throw error;
            }
        },
        []
    );

    /*
     * Load favorites when the authenticated user becomes available.
     *
     * State updates happen inside the Promise callbacks,
     * not synchronously inside the effect.
     */
    useEffect(() => {
        if (authLoading || !user?._id) return;

        let isActive = true;
        const userId = user._id;

        void loadFavorites(userId)
            .then((records) => {
                if (isActive) {
                    setFavoritesState({
                        userId,
                        records
                    });
                }
            })
            .catch((error) => {
                console.error(
                    '[Favorites] Could not load favorites:',
                    error
                );

                if (isActive) {
                    setFavoritesState({
                        userId,
                        records: []
                    });
                }
            });

        return () => {
            isActive = false;
        };
    }, [authLoading, user?._id, loadFavorites]);

    // Only use records belonging to the currently authenticated user.
    const favoritesReady =
        !!user && favoritesState?.userId === user._id;

    const favoriteRecords = favoritesReady
        ? favoritesState.records
        : [];

    // Extract favorite market IDs for FairList.
    const favoriteMarketIds = favoriteRecords
        .filter((favorite) => favorite.targetValue === 'market')
        .map((favorite) => favorite.targetId);

    /*
     * Add or remove a market from favorites.
     */
    const handleToggleFavorite = async (marketId: string) => {
        if (authLoading) return;

        if (!user) {
            Alert.alert(
                'Iniciar Sessão',
                'Precisas de ter uma conta para adicionar feiras aos favoritos.',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    },
                    {
                        text: 'Iniciar Sessão',
                        onPress: () => router.push('/login')
                    },
                    {
                        text: 'Criar Conta',
                        onPress: () => router.push('/signup')
                    }
                ]
            );

            return;
        }

        // Avoid modifying favorites before the initial request completes.
        if (!favoritesReady) {
            Alert.alert(
                'Favoritos',
                'Os teus favoritos ainda estão a carregar. Tenta novamente.'
            );

            return;
        }

        if (updatingFavoriteIds.has(marketId)) return;

        setUpdatingFavoriteIds((current) => {
            const next = new Set(current);
            next.add(marketId);
            return next;
        });

        try {
            const existingFavorite = favoriteRecords.find(
                (favorite) =>
                    favorite.targetValue === 'market' &&
                    favorite.targetId === marketId
            );

            if (existingFavorite) {
                // Remove existing favorite.
                await api.delete(`/favorites/${existingFavorite.id}`);

                setFavoritesState((current) => {
                    if (!current || current.userId !== user._id) {
                        return current;
                    }

                    return {
                        ...current,
                        records: current.records.filter(
                            (favorite) =>
                                favorite.id !== existingFavorite.id
                        )
                    };
                });

            } else {
                // Create new favorite.
                const response = await api.post<ServiceResponse<FavoriteRecord>>(
                    '/favorites',
                    {
                        userId: user._id,
                        targetValue: 'market',
                        targetId: marketId
                    }
                );

                if (response.data?.data) {
                    const createdFavorite = response.data.data;

                    setFavoritesState((current) => {
                        if (!current || current.userId !== user._id) {
                            return current;
                        }

                        return {
                            ...current,
                            records: [
                                ...current.records,
                                createdFavorite
                            ]
                        };
                    });

                } else {
                    // Fallback if the creation response has no favorite object.
                    const records = await loadFavorites(user._id);

                    setFavoritesState({
                        userId: user._id,
                        records
                    });
                }
            }

        } catch (error) {
            console.error(
                '[Favorites] Could not update favorite:',
                error
            );

            Alert.alert(
                'Favoritos',
                'Não foi possível atualizar os teus favoritos. Tenta novamente.'
            );

        } finally {
            setUpdatingFavoriteIds((current) => {
                const next = new Set(current);
                next.delete(marketId);
                return next;
            });
        }
    };

    // Fetch markets from GraphQL.
    const {
        data,
        loading,
        error
    } = useQuery<{ markets: FairItem[] }>(GET_MARKETS);

    console.log('Status Query:', {
        loading,
        error: error?.message,
        count: data?.markets?.length
    });

    /*
     * Schedule notifications for markets.
     */
    const scheduleMarket = useCallback(async (markets: FairItem[]) => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            await Promise.all(
                markets.map(async (market) => {
                    try {
                        // Extract the time string (e.g. 10:30).
                        const match = market.openingHours?.match(
                            /(\d{1,2}):(\d{2})/
                        );

                        if (!match) return;

                        const hours = parseInt(match[1], 10);
                        const minutes = parseInt(match[2], 10);

                        const newDate = new Date();
                        newDate.setHours(hours, minutes, 0, 0);

                        // Schedule notification one minute before opening.
                        const notificationTime = new Date(
                            newDate.getTime() - 1 * 60000
                        );

                        if (notificationTime > new Date()) {
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: 'A feira está quase a começar!',
                                    body: `A feira ${market.name} começa em breve!`,
                                    priority: 'high'
                                },
                                trigger: {
                                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                                    date: notificationTime
                                } as Notifications.DateTriggerInput
                            });

                            console.log('Scheduled successfully!');
                        }

                    } catch (error) {
                        console.log(
                            'Error in processing the schedule of:',
                            error
                        );
                    }
                })
            );

        } catch (error) {
            console.log(
                'Error in processing the schedule of:',
                error
            );
        }
    }, []);

    // Notifications logic.
    useEffect(() => {
        if (data?.markets) {
            console.log(
                'Data received from the Microservice: Scheduling...'
            );

            void scheduleMarket(data.markets);
        }
    }, [data, scheduleMarket]);

    const marketList = data?.markets || [];

    // Filter search bar.
    const filteredData = marketList.filter((item) => {
        const query = searchQuery.toLowerCase().trim();

        const name = item.name?.toLowerCase() || '';
        const address = item.address?.toLowerCase() || '';

        // Filter by fair name.
        const matchesTitle = name.includes(query);

        // Filter by county.
        const matchesCounty = address.includes(query);

        // Filter by fair vendor.
        const matchesVendor = item.people?.some((person) =>
            person.name.toLowerCase().includes(query)
        ) || false;

        const matchesSearch =
            matchesTitle || matchesCounty || matchesVendor;

        // Filter by category.
        const matchesCategory =
            selectedCategory === '' ||
            (
                item.categories &&
                item.categories.includes(selectedCategory)
            );

        return matchesSearch && matchesCategory;
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemedView style={styles.container}>

                <View style={styles.appContainer}>
                    <Image
                        source={require('../../assets/images/app-logo.png')}
                    />
                </View>
                <View style={styles.searchBar}>
                    <SearchBarComponent
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Procura por nome, concelho..."
                    />
                </View>

                <View style={styles.categorySelection}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.categoriesContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === item.name &&
                                        styles.categoryItemActive
                                ]}
                                onPress={() =>
                                    setSelectedCategory((previous) =>
                                        previous === item.name
                                            ? ''
                                            : item.name
                                    )
                                }
                            >
                                <Image
                                    source={categoryIcons[item.iconKey]}
                                />

                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === item.name &&
                                            styles.categoryTextActive
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <FairList
                        data={filteredData}
                        onSelect={handleSelectMarket}
                        favoriteIds={favoriteMarketIds}
                        updatingFavoriteIds={updatingFavoriteIds}
                        onToggleFavorite={handleToggleFavorite}
                    />
                </View>

            </ThemedView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FCFBFA',
        flex: 1,
        paddingTop: 60
    },

    welcomeMessage: {
        fontSize: 24,
        fontWeight: '800',
        padding: 15
    },

    appContainer: {
        padding: 15
    },

    searchBar: {
        padding: 15
    },

    categorySelection: {
        marginLeft: 15,
        marginBottom: 40
    },

    categoriesContent: {
        gap: 10
    },

    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: 'white',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        gap: 5
    },

    categoryItemActive: {
        borderColor: '#C64F23'
    },

    categoryText: {
        color: '#C64F23',
        fontWeight: '700'
    },

    categoryTextActive: {
        color: '#C64F23',
        fontWeight: 'bold'
    },

    userWelcomeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginVertical: 10
    },

    logoutButton: {
        backgroundColor: '#C64F23',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 7
    },

    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600'
    }
});
