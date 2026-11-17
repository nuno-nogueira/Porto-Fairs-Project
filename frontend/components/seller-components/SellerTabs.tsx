// imports
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AnnouncementCard } from "./AnnouncementCard";

export interface SellerMarket {
  id: string;
  name: string;
  address: string;
  openingHours: string;
  imageUrl: string;
  categories: string[];
}

// Define the props for SellerTabs component
interface SellerTabsProps {
  about: string;
  posts: { id: string; text: string; date: string }[];
  isOwner ?: boolean;
  markets ?: SellerMarket[];
  marketsLoading ?: boolean;
  marketsError ?: boolean;
}

export function SellerTabs({ about, posts, isOwner = false, markets = [], marketsLoading = false, marketsError = false }: SellerTabsProps) {
  // State to handle tab switching
  const [activeTab, setActiveTab] = useState<"about" | "posts">("about");

  // display categories of markets that the seller participates in
  const marketCategories = Array.from(new Set(markets.flatMap((market) => market.categories || [])));

  return (
    <View style={styles.mainContainer}>
      {/* Tab bar container */}
      <View style={styles.tabsContainer}>
        {/* About Tab Button */}
        <Pressable
          style={styles.tab}
          onPress={() => setActiveTab("about")}
        >
          <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>
            Sobre mim
          </Text>
          {activeTab === "about" && <View style={styles.activeIndicator} />}
        </Pressable>

        <View style={styles.divider} />

        {/* Posts Tab Button */}
        <Pressable
          style={styles.tab}
          onPress={() => setActiveTab("posts")}
        >
          <Text style={[styles.tabText, activeTab === "posts" && styles.activeTabText]}>
            Anúncios
          </Text>
          {activeTab === "posts" && <View style={styles.activeIndicator} />}
        </Pressable>
      </View>

      {/* Dynamic content area */}
      <View style={styles.content}>
        {/* Render About Tab */}
        {activeTab === "about" && (
          <View>
            <Text style={styles.aboutText}>{about || "Este vendedor ainda não adicionou uma descrição"}</Text>

            {marketCategories.length > 0 && (
              <View>
                <Text style={styles.categoryLabel}>
                  Categorias das feiras onde participa
                </Text>

                <View style={styles.categoriesContainer}>
                  {marketCategories.map((category) => (
                    <View key={category} style={styles.categoryChip}>
                      <MaterialCommunityIcons
                        name="tag-outline"
                        size={16}
                        color="#A83F1B"
                      />
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Onde me podes encontrar</Text>

            {marketsLoading ? (
              <ActivityIndicator
                size="small"
                color="#C64F23"
                style={styles.loading}
              />
            ) : marketsError ? (
              <Text style={styles.emptyText}>
                Não foi possível carregar as feiras deste vendedor.
              </Text>
            ) : markets.length > 0 ? (
              <View style={styles.marketsContainer}>
                {markets.map((market) => (
                  <View key={market.id} style={styles.marketCard}>
                    <Image
                      source={{ uri: market.imageUrl }}
                      style={styles.marketImage}
                      resizeMode="cover"
                    />

                    <View style={styles.marketInfo}>
                      <Text style={styles.marketHours} numberOfLines={1}>
                        {market.openingHours || "Horário não disponível"}
                      </Text>

                      <Text style={styles.marketName} numberOfLines={2}>
                        {market.name}
                      </Text>

                      <View style={styles.addressContainer}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={17}
                          color="#858080"
                        />
                        <Text
                          style={styles.marketAddress}
                          numberOfLines={2}
                        >
                          {market.address}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Ainda não existem feiras associadas a este vendedor.
              </Text>
            )}
          </View>
        )}

        {/* Render Posts Tab */}
        {activeTab === "posts" && (
          <View>
            {posts.length > 0 ? (
              posts.map((post, index) => {
              // Grouping logic: check if the date header should be displayed
              const showDateHeader = index === 0 || posts[index - 1].date !== post.date;

              return (
                <View key={post.id}>
                  {/* Header for "Hoje", "Ontem", etc. */}
                  {showDateHeader && (
                    <Text style={styles.dateHeader}>{post.date}</Text>
                  )}
                  {/* Individual Post Card */}
                  <AnnouncementCard announce={post} />
                </View>
              );
            })
            ): (
              <Text style={styles.emptyText}>
                {isOwner 
                ? "Ainda não publicaste anúncios"
                : "Este vendedor ainda não publicou anúncios" }
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    height: 50,
    alignItems: "center",
  },
  tab: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  divider: {
    width: 1,
    height: "60%",
    backgroundColor: "#F0F0F0",
  },
  tabText: {
    fontSize: 18,
    color: "#D35400",
    opacity: 0.6,
    fontWeight: "400",
  },
  activeTabText: {
    opacity: 1,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#D35400",
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: "#FFFFFF",
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    marginLeft: 5,
  },
   categoryLabel: {
    fontSize: 13,
    color: "#858080",
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FCEDE9",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A83F1B",
  },
  marketsContainer: {
    gap: 12,
  },
  marketCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    minHeight: 112,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  marketImage: {
    width: 118,
    height: 96,
    borderRadius: 9,
    backgroundColor: "#F0F0F0",
  },
  marketInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
    minWidth: 0,
  },
  marketHours: {
    fontSize: 13,
    color: "#D35400",
    marginBottom: 8,
  },
  marketName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#32170F",
    marginBottom: 7,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  marketAddress: {
    flex: 1,
    fontSize: 12,
    color: "#858080",
  },
  loading: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#858080',
    fontStyle: 'italic',
    marginVertical: 12,
}
});