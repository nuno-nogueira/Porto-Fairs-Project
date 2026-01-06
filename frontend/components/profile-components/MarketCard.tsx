import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

export interface MarketItemData {
  id: number;
  title: string;
  schedule: string;
  address: string;
  image: any;
}

interface MarketCardProps {
  item: MarketItemData;
  onPress?: (item: MarketItemData) => void;
  onRemove?: (id: number) => void;
}

export function MarketCard({ item, onPress, onRemove }: MarketCardProps) {
  const theme = useColorScheme() ?? "light";
  const tintColor = Colors[theme].tint;
  const cardBackgroundColor =
    theme === "light" ? "#fff" : "rgba(29, 37, 49, 0.61)";

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { backgroundColor: cardBackgroundColor }]}
      activeOpacity={0.8}
      onPress={() => onPress && onPress(item)}
    >
      <View>
        <Image source={item.image} style={styles.cardImage} />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onPress && onPress(item)}
        >
          <Ionicons name="heart" size={20} color="#C05528" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <ThemedText
          type="defaultSemiBold"
          numberOfLines={1}
          style={styles.cardTitle}
        >
          {item.title}
        </ThemedText>

        <ThemedText
          type="small"
          style={{ color: tintColor, fontWeight: "600", marginBottom: 4 }}
        >
          {item.schedule}
        </ThemedText>

        <View style={styles.addressRow}>
          <Ionicons name="location-sharp" size={12} color="gray" />
          <ThemedText
            type="small"
            lightColor="#666"
            darkColor="#ccc"
            numberOfLines={1}
            style={styles.cardAddress}
          >
            {item.address}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 200,
    marginRight: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 55,
    padding: 6,
    zIndex: 10,
  },
  cardImage: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAddress: {
    marginLeft: 2,
    flex: 1,
  },
});
