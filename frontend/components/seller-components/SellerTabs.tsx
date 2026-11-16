// imports
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AnnouncementCard } from "./AnnouncementCard";

// Define the props for SellerTabs component
interface SellerTabsProps {
  about: string;
  posts: { id: string; text: string; date: string }[];
  isOwner ?: boolean;
}

export function SellerTabs({ about, posts, isOwner = false }: SellerTabsProps) {
  // State to handle tab switching
  const [activeTab, setActiveTab] = useState<"about" | "posts">("about");

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

            <Text style={styles.sectionTitle}>Onde me podes encontrar</Text>

            <Text style={styles.emptyText}>Ainda não existem feiras associadas a este vendedor.</Text>
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
  emptyText: {
    fontSize: 14,
    color: '#858080',
    fontStyle: 'italic',
    marginVertical: 12,
}
});