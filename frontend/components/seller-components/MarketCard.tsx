// Imports
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Market {
  id: number;
  title: string;
  schedule: string;
  address: string;
  image?: any;
}

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={market.image} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.schedule} numberOfLines={1}>
            {market.schedule}
          </Text>
          
          <TouchableOpacity 
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.favoriteButton}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color="#c64f23" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {market.title}
        </Text>

        <View style={styles.addressContainer}>
          <Ionicons name="location-sharp" size={16} color="#A0AEC0" />
          <Text style={styles.address} numberOfLines={1}>
            {market.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 7,
    marginVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  image: { 
    width: 90, 
    height: 90, 
    borderRadius: 15 
  },
  content: { 
    flex: 1, 
    marginLeft: 15, 
    paddingRight: 8, 
    justifyContent: 'space-between', 
    height: 80 
  },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  favoriteButton: { 
    marginRight: 2, 
    padding: 2 
  },
  schedule: { 
    color: "#f88b72",
    fontSize: 13, 
    fontWeight: "500" 
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2D1A12", 
    marginTop: -2 
  },
  addressContainer: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  address: { 
    fontSize: 13, 
    color: "#A0AEC0", 
    marginLeft: 4, 
    flex: 1 
  },
});