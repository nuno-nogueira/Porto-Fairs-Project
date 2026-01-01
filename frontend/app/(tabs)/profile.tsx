import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useColorScheme, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Import components
import { ProfileHeader } from "@/components/profile-components/ProfileHeader";
import { MarketCard } from "@/components/profile-components/MarketCard";
import { SellerCard } from "@/components/profile-components/SellerCard";
import { PrimaryButton } from '@/components/ui/PrimaryButton';

// Imports thematization
import { Colors } from "@/constants/theme"; 
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { MARKETS, SELLERS } from "@/constants/data";

const currentUser = SELLERS[0];

export default function SellerProfile() {

  const colorScheme = useColorScheme() ?? 'light';
  const currentColors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}> 
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: currentColors.background }]}>
          
          {/* Icon Settings */}
          <TouchableOpacity
            style={styles.topRightIcon}
            onPress={() => console.log("Settings")}
          >
            <Ionicons name="settings-sharp" size={26} color={currentColors.tint} />
          </TouchableOpacity>

          {/* Profile Component */}
          <ProfileHeader user={currentUser} />

          {/* Button */}

          <View style={{ marginTop: 10 }}>
            <PrimaryButton 
              title="Criar Anúncio"
              iconName="add-sharp"
              onPress={() => console.log("Criar")} 
            />
          </View>
        </View>

        {/* Markets */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feiras Favoritas
          </ThemedText>
          
          <FlatList
            horizontal
            data={MARKETS}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MarketCard
                item={item}
                onPress={(market) => console.log("Ver feira:", market.title)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Sellers */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feirantes Favoritos
          </ThemedText>
          
          <FlatList
            horizontal
            data={SELLERS}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <SellerCard
                item={item}
                onPress={(seller) => console.log("Ver perfil de:", seller.name)}
              />
            )}
          />
        </View>
      </ScrollView>
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
    marginTop: 30 
  },
  
  sectionTitle: { 
    marginBottom: 15,
    
  },
});