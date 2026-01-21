import React, { useState,useEffect } from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import SearchBarComponent from "@/components/homepage-components/SearchBar";
import FairList from "@/components/homepage-components/FairList";

import { categoryIcons } from "./categoryIcons";
import data from "../data/locations.json";
import categories from "../data/categories.json";
import { Colors } from "@/constants/theme";

//store imports
import { useMarketStore } from "@/stores/useMarketStore";

interface Person {
  id: number;
  name: string;
}

interface FairItem {
  id: number;
  title: string;
  schedule: string;
  address: string;
  category: string;
  iconKey: string;
  county: string;
  people: Person[];
}

interface HomepageProps {
  onSelect: (item: FairItem) => void;
}

export default function HomepageScreen({ onSelect }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const theme = useColorScheme() ?? "light";
  const brandColors = Colors[theme]; // Usando a mesma lógica do profile.tsx


  // Conecta ao store de markets
  const { markets, fetchMarkets, isLoading } = useMarketStore();

  // 
  useEffect(() => {
    fetchMarkets();
  }, []);

  // ⚡ TRANSFORMAR DADOS DO BACKEND PARA O FRONTEND
  // O backend devolve "Market", mas o FairList quer "FairItem". Vamos adaptar.
  // const adaptedData: FairItem[] = markets.map((market: any) => ({
  //   id: Number(market.id) || Math.random(), // Garante um ID numérico
  //   title: market.name,                     // Backend: name -> Frontend: title
  //   schedule: market.openingHours || '09:00 - 18:00', // Backend: openingHours -> Frontend: schedule
  //   address: market.address,
  //   // Se o backend tiver categorias, usa a primeira, senão usa 'Outros'
  //   category: market.categories?.[0] || 'Outros', 
  //   // Tenta adivinhar o ícone com base na categoria, ou usa um default
  //   iconKey: market.categories?.[0] || 'fruits', 
  //   county: market.address.split(',')[1]?.trim() || 'Portugal', // Extrai concelho da morada
  //   people: market.sellers?.map((s: any) => ({ id: s.id, name: s.full_name })) || []
  // }));

  // Lógica de Filtro (Agora usa o 'adaptedData' em vez do JSON fixo)
  ///// const filteredData = adaptedData.filter((item) => {

  // Lógica de Filtro
  const filteredData = (data as FairItem[]).filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = item.title.toLowerCase().includes(query);
    const matchesCounty = item.county.toLowerCase().includes(query);
    const matchesVendor = item.people?.some((person) =>
      person.name.toLowerCase().includes(query),
    );

    const matchesSearch = matchesTitle || matchesCounty || matchesVendor;
    const matchesCategory =
      selectedCategory === "" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {/* === Header: Logo e Boas vindas === */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/app-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="title" style={styles.welcomeMessage}>
            Bem vindo,{" "}
            <ThemedText type="title" style={{ color: brandColors.tint }}>
              Ricardo
            </ThemedText>
            !
          </ThemedText>
        </View>

        {/* === Barra de Pesquisa === */}
        <View style={styles.searchContainer}>
          <SearchBarComponent
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Procura por nome, concelho..."
          />
        </View>

        {/* === Lista de Categorias (Chips) === */}
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.categoriesContent}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.name;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: brandColors.cardBackground,
                      borderColor: isSelected
                        ? brandColors.tint
                        : brandColors.border,
                    },
                  ]}
                  onPress={() =>
                    setSelectedCategory((prev) =>
                      prev === item.name ? "" : item.name,
                    )
                  }
                >
                  <Image
                    source={categoryIcons[item.iconKey]}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: isSelected
                        ? brandColors.tint
                        : brandColors.text,
                    }}
                    resizeMode="contain"
                  />
                  <ThemedText
                    type="small"
                    style={{
                      fontWeight: "700",
                      color: isSelected ? brandColors.tint : brandColors.text,
                    }}
                  >
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* === Market list === */}
        <View style={styles.listContainer}>
          {

          //   isLoading ? (
          //   <View style={styles.loadingContainer}>
          //     <ActivityIndicator size="large" color={brandColors.tint} />
          //     <ThemedText style={{ marginTop: 10 }}>
          //       A carregar feiras...
          //     </ThemedText>
          //   </View>
          // ):
          
          filteredData.length > 0 ? (
            <FairList data={filteredData} onSelect={onSelect} />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={{ color: "gray", fontStyle: "italic" }}>
                Nenhuma feira encontrada com esses filtros.
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  welcomeMessage: {
    marginBottom: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});
