import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useColorScheme,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { router, Redirect, useFocusEffect } from 'expo-router'; 
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import api from "@/api/axios";
import { useAuth } from '@/context/AuthContext'; 

// Import components
import { ProfileHeader } from "@/components/profile-components/ProfileHeader";
import { MarketCard } from "@/components/profile-components/MarketCard";
import { SellerCard } from "@/components/profile-components/SellerCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AnnouncementCard } from "@/components/profile-components/AnnouncementCard";

// Imports thematization
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { SELLERS, POSTS } from "@/constants/data";

// fetch the markets from the Markets GraphQL service
const GET_MARKETS = gql`
  query GetMarkets {
    markets {
      id
      name
      openingHours
      address
      imageUrl
    }
  }
`;

interface ProfileMarket {
  id: string | number;
  name: string;
  openingHours ?: string | null;
  address ?: string | null;
  imageUrl ?: string | null;
}

interface MarketsQueryData {
  markets: ProfileMarket[];
}

interface FavoriteRecord {
  id: string | number;
  userId: string;
  targetValue: "market" | "seller";
  targetId: string;
}

interface ServiceResponse<T> {
  message ?: string;
  data: T | null;
}

// response from GET /users/sellers/:id
interface SellerProfile {
  id: string | number;
  full_name: string;
  description: string;
  avatar: string | null;
} 

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const brandColors = Colors[colorScheme];

  const { user, loading } = useAuth();
  const isSeller = user?.role === "seller";

  // profile states
  const [profileImage, setProfileImage] = useState(SELLERS[0].avatar);
  const [announcements, setAnnouncements] = useState(POSTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState("");

  // favorite state
  const [favoriteRecords, setFavoriteRecords] = useState<FavoriteRecord[]>([]);
  const [favoriteSellers, setFavoriteSellers] = useState<SellerProfile[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // retrieve markets from GraphQL
  const {
    data: marketsResponse,
    loading: marketsLoading,
    error: marketsError
  } = useQuery<MarketsQueryData>(GET_MARKETS, {
    fetchPolicy: "cache-and-network"
  });

  const markets = marketsResponse?.markets ?? [];

  // Pick image from gallery
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  /*
   * load the current user's favourite records whenever the profile
   * screen becomes focused
   */
  useFocusEffect(
    useCallback(() => {
      if (!user?._id) return;

      let isActive = true;

      const loadFavorites = async () => {
        try {
          let records: FavoriteRecord[] = [];

          try {
            const response = await api.get<ServiceResponse<FavoriteRecord[]>>(
              `/favorites/user/${user._id}`
            );

            records = response.data?.data ?? [];
          } catch (error) {
            // The favourites service returns 404 when the user has no favourites.
            if (
              axios.isAxiosError(error) &&
              error.response?.status === 404
            ) {
              records = [];
            } else {
              throw error;
            }
          }

          // Get the details of each favourite seller.
          const sellerRecords = records.filter(
            (favorite) => favorite.targetValue === "seller"
          );

          const sellerResults = await Promise.all(
            sellerRecords.map(async (favorite) => {
              try {
                const response = await api.get<SellerProfile>(
                  `/users/sellers/${favorite.targetId}`
                );

                return response.data;
              } catch (error) {
                console.error(
                  `[Favorites] Could not load seller ${favorite.targetId}:`,
                  error
                );

                return null;
              }
            })
          );

          const sellers = sellerResults.filter(
            (seller): seller is SellerProfile => seller !== null
          );

          if (!isActive) return;

          setFavoriteRecords(records);
          setFavoriteSellers(sellers);
          setFavoritesError(null);
        } catch (error) {
          console.error("[Favorites] Could not load profile favourites:", error);

          if (isActive) {
            setFavoritesError(
              "Não foi possível carregar os teus favoritos."
            );
          }
        } finally {
          if (isActive) {
            setFavoritesLoading(false);
          }
        }
      };

      void loadFavorites();

      return () => {
        isActive = false;
      };
    }, [user])
  );

  const favoriteMarketRecords = favoriteRecords.filter((favorite) => favorite.targetValue === "market");
  const favoriteMarkets = favoriteMarketRecords
    .map((favorite) => markets.find((market) => market.id === favorite.targetId))
    .filter((market): market is ProfileMarket => market !== undefined);
  
  // remove a market from the user's favorite
  const removeMarketFromFavorites = async(marketId: string | number) => {
    const favorite = favoriteRecords.find(
      (record) =>
        record.targetValue === 'market' &&
        record.targetId === marketId.toString()
    );

    if (!favorite) return;

    try {
      await api.delete(`/favorites/${favorite.id}`);

      setFavoriteRecords((currentRecords) => currentRecords.filter((record) => record.id !== favorite.id));
    } catch (err) {
      console.error("[Favorites] Could not remove favorite market ->", err);
      
    }
  }

  // Create announcement
  function createAnnouncement() {
    if (newPostText.trim() === "") {
      Alert.alert("Erro", "Escreve alguma coisa antes de publicar!");
      return;
    }

    const newPost = {
      id: Date.now(), 
      text: newPostText,
      date: "Agora mesmo",
    };

    setAnnouncements((currentAnnouncements) => [
      newPost,
      ...currentAnnouncements,
    ]);
    setNewPostText(""); 
    setModalVisible(false);
  }

  function deleteAnnouncement(id: number | string) {
    Alert.alert("Apagar", "Tens a certeza que queres apagar este anúncio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: () =>
          setAnnouncements((prev) => prev.filter((p) => p.id !== id)),
      },
    ]);
  }

  if (loading) return null;

  if (!user) return <Redirect href="/signup" />

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Section */}
        <View
          style={[
            styles.headerSection,
            { backgroundColor: brandColors.background },
          ]}
        >
          {/* Icon Settings */}
          <TouchableOpacity
            style={styles.topRightIcon}
            onPress={() => console.log("Settings")}
          >
            <Ionicons
              name="settings-sharp"
              size={26}
              color={brandColors.tint}
            />
          </TouchableOpacity>

          {/* Profile Component */}
          <ProfileHeader
            user={{name: user.name, location: user.current_location || "Localização não encontrada"}}
            imageUri={profileImage} 
            onEditImage={handlePickImage}
          />

          {/* "Create an announcement" button */}
          {isSeller && (
            <View style={{ marginTop: 10 }}>
              <PrimaryButton
                title="Criar Anúncio"
                iconName="add-sharp"
                onPress={() => setModalVisible(true)}
              />
            </View>
          )}
        </View>

        {/* Markets */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feiras Favoritas
          </ThemedText>

          <FlatList
            horizontal
            data={favoriteMarkets}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MarketCard
                item={{
                  id: item.id,
                  title: item.name,
                  schedule: item.openingHours || "Horário não disponível",
                  address: item.address || "Localização não disponível",
                  image: item.imageUrl
                    ? { uri: item.imageUrl }
                    : require("../../assets/images/fair-default-image.png"),
                }}
                onPress={(market) => {
                  router.push(`/market/${market.id}`);
                }}
                onRemove={removeMarketFromFavorites}
              />
            )}
            ListEmptyComponent={
              favoritesLoading || marketsLoading ? (
                <ActivityIndicator
                  size="small"
                  color={brandColors.tint}
                  style={{ marginLeft: 20 }}
                />
              ) : favoritesError || marketsError ? (
                <ThemedText
                  style={{ marginLeft: 20, fontStyle: "italic", color: "gray" }}
                >
                  Não foi possível carregar as feiras favoritas.
                </ThemedText>
              ) : (
                <ThemedText
                  style={{ marginLeft: 20, fontStyle: "italic", color: "gray" }}
                >
                  Ainda não tens feiras favoritas.
                </ThemedText>
              )
            }
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Favorite Sellers */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feirantes Favoritos
          </ThemedText>

          <FlatList
            horizontal
            data={favoriteSellers}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <SellerCard
                item={{
                  id: item.id,
                  name: item.full_name,
                  avatar: item.avatar ?? "",
                }}
                onPress={(seller) => {
                  router.push(`/sellers/${seller.id}`);
                }}
              />
            )}
            ListEmptyComponent={
              favoritesLoading ? (
                <ActivityIndicator
                  size="small"
                  color={brandColors.tint}
                  style={{ marginLeft: 20 }}
                />
              ) : favoritesError ? (
                <ThemedText
                  style={{ marginLeft: 20, fontStyle: "italic", color: "gray" }}
                >
                  Não foi possível carregar os feirantes favoritos.
                </ThemedText>
              ) : (
                <ThemedText
                  style={{ marginLeft: 20, fontStyle: "italic", color: "gray" }}
                >
                  Ainda não tens feirantes favoritos.
                </ThemedText>
              )
            }
          />
        </View>

        {/* === announcements === */}
        {isSeller && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Os meus Anúncios
            </ThemedText>

            {announcements.map((post) => (
              <AnnouncementCard
                key={post.id}
                announce={post}
                onDelete={deleteAnnouncement}
              />
            ))}
            {/*  placeholder */}
            {announcements.length === 0 && (
              <ThemedText style={{ fontStyle: "italic", color: "gray" }}>
                Ainda não publicaste nada.
              </ThemedText>
            )}
          </View>
        )}

        {/* become a seller */}
        {!isSeller && (
          <View style={styles.becomeSellerContainer}>
            <View style={styles.divider} />

            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
              Queres tornar-te feirante?
            </ThemedText>

            <ThemedText style={{ marginBottom: 20 }}>
              Divulga os teus produtos e associa-te às feiras em que participas.
            </ThemedText>

            <Image
              source={require("../../assets/markets/vegetables.png")}
              style={{ width: "100%", height: 120, marginBottom: 20 }}
              resizeMode="contain"
            />

            <PrimaryButton
              title="Criar Perfil Público"
              onPress={() => console.log("Criar perfil")}
              style={{ width: "100%", marginBottom: 10 }}
            />
          </View>
        )}
      </ScrollView>

      {/* === MODAL  === */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: brandColors.background },
            ]}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 15 }}>
              Novo Anúncio
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                { color: brandColors.text, borderColor: brandColors.border },
              ]}
              placeholder="O que tens para vender hoje?"
              placeholderTextColor="gray"
              multiline
              numberOfLines={4}
              value={newPostText}
              onChangeText={setNewPostText}
            />

            <View style={styles.modalButtons}>
              {/* cancel btn */}

              <PrimaryButton
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                textColor={brandColors.text}
                style={{
                  marginRight: 15,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: brandColors.border,
                }}
              />

              {/* publish button */}
              <PrimaryButton title="Publicar" onPress={createAnnouncement} />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerSection: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },

  topRightIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  section: {
    paddingLeft: 20,
    marginTop: 30,
  },

  sectionTitle: {
    marginBottom: 15,
  },

  becomeSellerContainer: {
    padding: 20,
    marginTop: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 30,
    width: "100%",
  },

  placeholderImage: {
    height: 100,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
    minHeight: 100,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
