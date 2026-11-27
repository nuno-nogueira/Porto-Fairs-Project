import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, useColorScheme, FlatList, Linking, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useFavorite } from "@/hooks/useFavorite";

// components & themes
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import {
  SellerCard,
  type SellerItemData
} from '@/components/profile-components/SellerCard';

const GET_MARKET = gql`
query GetMarket($id: ID!) {
  market(id: $id) {
    id
    name
    description
    imageUrl
    address
    latitude
    longitude
    openingHours
    categories

    sellers {
      id
      full_name
      description
      avatar
      alert
    }

    averageRating

    ratings {
      id
      user_id
      full_name
      rating
      comment
    }
  }
}`;

interface Market {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  categories: string[];
  sellers: SellerItemData[];
  averageRating: number | null;
  ratings: MarketRating[];
}

interface MarketRating {
  id: string;
  user_id: string;
  full_name: string;
  rating: number;
  comment: string | null;
}

interface MarketQueryData {
  market: Market | null;
}



export default function MarketDetailsScreen() {
  const { id } = useLocalSearchParams(); 

  const theme = useColorScheme() ?? 'light';
  const currentColors = Colors[theme];
  const { user, loading: authLoading } = useAuth();

  const {data, loading, error, refetch} = useQuery<MarketQueryData>(GET_MARKET, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network'
  });

  const market = data?.market ?? null;
  const {
    isFavorite,
    loading: favoriteLoading,
    updating: favoriteUpdating,
    toggleFavorite
} = useFavorite("market", market?.id ?? null);

  const [rating, setRating] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleToggleFavorite = async () => {
    if (authLoading) return;

    if (!user) {
        Alert.alert(
            "Iniciar Sessão",
            "Precisas de ter uma conta para adicionar feiras aos favoritos.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Iniciar Sessão",
                    onPress: () => router.push("/login")
                },
                {
                    text: "Criar Conta",
                    onPress: () => router.push("/signup")
                }
            ]
        );

        return;
    }

    try {
        await toggleFavorite();
    } catch (err) {
        console.error("Error toggling market favorite:", err);

        Alert.alert(
            "Favoritos",
            "Não foi possível atualizar os teus favoritos. Tenta novamente."
        );
    }
  };

  // Loading Screen
  if (loading && !market) {
    return(
      <ThemedView
        style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Stack.Screen options={{ headerShown: false }} />

        <ActivityIndicator size="large" color="#C64F23" />
      </ThemedView>
    );
  }

  // Error or market not found
  if (!market) {
    return(
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 25
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <Ionicons
          name="alert-circle-outline"
          size={45}
          color="#C64F23"
        />

        <ThemedText
          style={{ textAlign: "center", marginTop: 15}}>
            {error
            ? "Não foi possível carregar as informações desta feira."
            : "Feira não encontrada"}
        </ThemedText>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
            <ThemedText style={{ color: "#C64F23", fontWeight: "bold"}}>Voltar</ThemedText>

        </TouchableOpacity>

      </ThemedView>
    )
  }

  const description = market.description || "Esta feira ainda não tem descrição disponível.";

  //Google Calendar
  const handleCalendarFunction = () => {
    const baseURL = 'https://www.google.com/calendar/render?action=TEMPLATE'
    
    // Data format
    const title = encodeURIComponent(`Visitar: ${market.name}`);
    const location = encodeURIComponent(market.address);
    const details = encodeURIComponent(`Horário da feira: ${market.openingHours}`);

    // Define start & ending dates for the event to be added in the calendar
    const now = new Date();
    const startDate = now.toISOString().replace(/-|:|\.\d+/g, '');

    now.setHours(now.getHours() + 2);
    const endDate = now.toISOString().replace(/-|:|\.\d+/g, '');

    const dates = `${startDate}/${endDate}`;
    const url = `${baseURL}&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    // Link the event to Google Calendar
    Linking.openURL(url).catch((err) => console.error('Erro ao abrir calendário', err));
    
  }
  // ...


  const renderStars = () => {
    return (
      <View style={{ flexDirection: 'row', gap: 5, marginBottom: 20, margin: "auto" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons 
              name="star" 
              size={45} 
              color={star <= rating ? "#FFB800" : "#E0E0E0"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmitRating = async() => {
    if (!user) {
      Alert.alert("Iniciar Sessão",
        "Precisas de ter uma conta para avaliar esta feira!",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Inciar Sessão",
            onPress: () => router.push("/login")
          },
          {
            text: "Criar Conta",
            onPress: () => router.push("/signup")
          }
        ]
      );
      return;
    }

    if (rating === 0) {
      Alert.alert("Avaliação", "Seleciona uma classificação de 1 a 5 estrelas.");
      return;
    }

    try {
      setSubmittingRating(true);

      await api.post("/ratings", {
        market_id: market.id,
        rating,
        comment: ratingComment.trim()
      });

      setRating(0);
      setRatingComment("");

      await refetch();

      Alert.alert("Obrigado!", "A tua avaliação foi submetida com sucesso!");
    } catch (err) {
      console.error("Error submitting rating:", err);

      Alert.alert("Erro", "Não foi possível submeter a avaliação. Tenta outra vez!")
      
    } finally {
      setSubmittingRating(false);

    }
  }

  return (
    <ThemedView style={styles.container}>
      {/* transparent header */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEARDER */}
        <View style={styles.imageContainer}>
          <Image
            source={imageError || !market.imageUrl
              ? require("../../assets/images/fair-default-image.png")
              : { uri: market.imageUrl }
            }
            style={styles.headerImage}
            resizeMode='cover'
            onError={() => setImageError(true)}
          />
          
          {/* Overlay  */}
          <View style={styles.overlay} />

          {/* Navigation buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={currentColors.primary} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="share-social" size={24} color={currentColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={handleToggleFavorite}
                disabled={authLoading || favoriteLoading || favoriteUpdating}
              >
                <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorite ? "#C64F23" : currentColors.primary}
                />
            </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* === Market info === */}
        <View style={styles.content}>
          <ThemedText type="title" style={{ fontSize: 26, marginBottom: 15 }}>{market.name}</ThemedText>

          {/* location */}
          <View style={styles.row}>
            <Ionicons name="location-sharp" size={24} color={currentColors.primary} />
            <ThemedText style={styles.rowText}>{market.address}</ThemedText>
          </View>

          {/* Time */}
          <View style={styles.row}>
            <Ionicons name="time" size={24} color={currentColors.primary} />
            <ThemedText style={styles.rowText}>{market.openingHours}</ThemedText>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {market.categories.map((category) => (
              <View key={category} style={styles.tag} >
                <Ionicons
                  name="pricetag-outline"
                  size={12}
                  color="#C05528"
                />
                <ThemedText style={styles.tagText}>
                  {category}
                </ThemedText>

              </View>
            ))}
          </View>

          {/* Description */}
       <ThemedText style={{ lineHeight: 22, color: 'gray', marginBottom: 5 }}>
            {isExpanded ? description : description.slice(0, 100) + (description.length > 100 ? '...' : '')}
            {/* "see more btn - if text > 100 caracters" */}
            {description.length > 100 && ( 
                <ThemedText 
                    onPress={() => setIsExpanded(!isExpanded)}
                    style={{ color: currentColors.primary, fontWeight: 'bold' }}
                >
                   {isExpanded ? ' Ver menos' : ' Ver mais'}
                </ThemedText>
            )}
          </ThemedText>

          {/* === Action buttons === */}
          <View style={styles.actionButtonsRow}>
            <PrimaryButton 
              title="Ver no Mapa" 
              iconName="navigate" 
              onPress={() => router.push('/(tabs)/map')} 
              style={{ flex: 1, marginRight: 10 }}
            />
            {/* Map button */}
            <TouchableOpacity style={styles.calendarBtn} onPress={handleCalendarFunction}>
               <Ionicons name="calendar" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* === Sellers === */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>Os nossos participantes</ThemedText>
          {market.sellers && market.sellers.length > 0 ? (
            <FlatList
              horizontal
              data={market.sellers}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <SellerCard
                  item={item}
                  onPress={(seller) =>
                    router.push(`/sellers/${seller.id}`)
                  }
                />
              )}
            />
          ) : (
            <ThemedText style={{ color: 'gray', marginBottom: 15 }}>
              Ainda não existem vendedores associados a esta feira.
            </ThemedText>
          )}

          {/* === Rating === */}
          <View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Avaliações</ThemedText>

            <View style={styles.averageRatingContainer}>
              <ThemedText type="title" style={styles.averageRating}>
                {(market.averageRating ?? 0).toFixed(1)}
              </ThemedText>

              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={18}
                    color={
                      star <= Math.round(market.averageRating ?? 0)
                        ? "#FFB800"
                        : "#E0E0E0"
                    }
                  />
                ))}
              </View>

              <ThemedText style={styles.reviewCount}>
                {market.ratings.length} avaliações
              </ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>
              A tua avaliação
            </ThemedText>

            <TextInput
              style={styles.commentInput}
              placeholder='Escreve a tua opinião acerca desta feira...'
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              value={ratingComment}
              onChangeText={setRatingComment}
              textAlignVertical='top'
            />

            <ThemedText style={styles.characterCount}>
              {ratingComment.length}/500
            </ThemedText>

            {renderStars()}

            <PrimaryButton
              title={submittingRating ? "A enviar..." : "Submeter Avaliação"}
              style={{marginBottom: 30}}
              iconName='paper-plane'
              onPress={handleSubmitRating}
            />

            <ThemedText type='subtitle' style={styles.sectionTitle}>
                Comentários
            </ThemedText>

            {
              market.ratings.length > 0 ? (
                market.ratings.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>

                    <View style={styles.reviewHeader}>
                      <ThemedText style={{ fontWeight: "bold"}}>
                        {review.full_name || "Utilizador"}
                      </ThemedText>

                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name="star"
                            size={14}
                            color={
                              star <= review.rating
                                ? "#FFB800"
                                : "#E0E0E0"
                            }
                          />
                        ))}
                      </View>
                    </View>

                    <ThemedText style={styles.reviewComment}>
                        {review.comment || "Sem comentário."}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={{ color: "gray", marginBottom: 20 }} >
                  Esta feira não recebeu avaliações.
                </ThemedText>
              )
            }
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header Image Styles
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerButtons: {
    position: 'absolute',
    top: 50, 
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
  },

  // Content Styles
  content: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowText: { marginLeft: 10, fontSize: 16, color: '#555' },
  
  tagsRow: { flexDirection: 'row', gap: 10, marginTop: 5, marginBottom: 20 },
  tag: { 
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF0E5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 
  },
  tagText: { color: '#C05528', fontWeight: 'bold', fontSize: 12 },

  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  calendarBtn: {
    width: 50, height: 50,
    backgroundColor: '#FFB800', // Aquele amarelo da imagem
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionTitle: { marginBottom: 15, fontSize: 20 },

  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
  },

  averageRating: {
    fontSize: 35,
    color: '#32170F',
  },

  reviewCount: {
    color: '#858080',
    fontSize: 12,
    marginTop: 4,
  },

  reviewCard: {
    backgroundColor: '#FAF7F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },

  reviewComment: {
    color: '#666',
    fontSize: 14,
    lineHeight: 21,
  },

  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    color: '#333',
  },

  characterCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 15,
  },
});