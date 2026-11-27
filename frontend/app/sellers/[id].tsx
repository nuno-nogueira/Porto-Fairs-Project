import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, Alert } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router"; 
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import axios from "axios";
import { useFavorite } from "@/hooks/useFavorite";

// Component imports
import { SellerHeader } from "@/components/seller-components/SellerHeader";
import { SellerTabs, type SellerMarket } from "@/components/seller-components/SellerTabs";

interface PublicSeller {
  id: string,
  full_name: string;
  description: string | null;
  avatar: string | null;
  location: string | null;
}

interface SellerResult {
  sellerId: string;
  seller: PublicSeller | null;
  error: string | null;
}

interface MarketsBySellerData {
  marketsBySeller: SellerMarket[];
}

const GET_MARKETS_BY_SELLER = gql`
  query GetMarketsBySeller($sellerId: ID!) {
    marketsBySeller(sellerId: $sellerId) {
      id
      name
      address
      openingHours
      imageUrl
      categories
    }
  }
  `;


const VendorPage = () => {
  // ir buscar o feirante com o id certo, dependendo de qual foi clicado 
  // (ver melhor isto mais tarde)
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {user, loading: authLoading } = useAuth();

  const [sellerResult, setSellerResult] = useState<SellerResult | null>(null);

  useEffect(() => {

    let isMounted = true;

    const fetchSeller = async() => {
      try {
        const response = await api.get<PublicSeller>(`/users/sellers/${id}`);

        if (isMounted) setSellerResult({
          sellerId: id,
          seller: response?.data,
          error: null
        });
        
      } catch (err: unknown) {
        
        console.error(`Error fetching seller with ID ${id}, ${err}`);
        
        const errorMessage = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error ||
          "Não foi possível carregar o perfil deste vendedor. Tente mais tarde!"
          : "Ocorreu um erro repentino ao carregar o perfil."

        if (isMounted) {
          setSellerResult({
            sellerId: id,
            seller: null,
            error: errorMessage
          })
        }

      }
    };

    if (id) fetchSeller();

    return () => { isMounted = false; }
  }, [id])

  const currentResult = sellerResult?.sellerId === id ? sellerResult : null;

  const sellerLoading = !!id && !currentResult;

  const seller = currentResult?.seller ?? null;

  const {
    isFavorite,
    loading: favoriteLoading,
    updating: favoriteUpdating,
    toggleFavorite
  } = useFavorite("seller", seller?.id ?? null);

  const error = !id ? "ID de vendedor inválido" : currentResult?.error;

  const {
    data: marketsData,
    loading: marketsLoading,
    error: marketsQueryError,
  } = useQuery<MarketsBySellerData>(GET_MARKETS_BY_SELLER, {
    variables: {sellerId: id}, skip: !id || !seller, fetchPolicy: "cache-and-network"
  })

  const SellerMarkets = marketsData?.marketsBySeller ?? [];

  if (authLoading || sellerLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false}} />
        
        <ActivityIndicator
          size="large"
          color="#C64F23"
        />
      </View>
    )
  }

  if (!seller) {
    return(
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />

        <Text style={styles.errorText}>
          {error || "Vendedor não encontrado."}
        </Text>
      </View>
    )
  }

  const isOwner = !!user && user._id === seller.id;

  const handleToggleFavorite = async() => {
    if (!user) {
      Alert.alert(
        "Iniciar Sessão", 
        "Precisas de ter uma conta para adicionar vendedores como favoritos.",
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
        console.error("Error toggling seller favorite:", err);

        Alert.alert(
            "Favoritos",
            "Não foi possível atualizar os teus favoritos. Tenta novamente."
        );
    }
  };

  const fallbackImage = require("../../assets/images/auth/market-stall.png");

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
          <SellerHeader
            vendor={{
              name: seller.full_name,
              location: seller.location || "Localização não encontrada"
            }}
            imageUri={seller.avatar || fallbackImage}
            liked={isFavorite}
            onToggleLike={handleToggleFavorite}
            showFavorite={!isOwner}
            />

          <SellerTabs
            about={seller.description || ""}
            posts={[]}
            isOwner={isOwner}
            markets={SellerMarkets}
            marketsLoading={marketsLoading}
            marketsError={!!marketsQueryError}
          />
      </ScrollView>
      
    </View>
  );
};

export default VendorPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    paddingBottom: 30,
    flexGrow: 1,
  },

   centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 25,
  },

  errorText: {
    fontSize: 16,
    color: '#858080',
    textAlign: 'center',
  },
});