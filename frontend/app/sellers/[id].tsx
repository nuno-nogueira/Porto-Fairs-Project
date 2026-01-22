import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Stack } from "expo-router"; 

// Data imports
import { SELLERS, POSTS } from "@/constants/sellers";

// DESCOMENTAR MAIS TARDE
import { useLocalSearchParams } from "expo-router";

// Component imports
import { SellerHeader } from "@/components/seller-components/SellerHeader";
import { SellerTabs } from "@/components/seller-components/SellerTabs";

const VendorPage = () => {
  // ir buscar o feirante com o id certo, dependendo de qual foi clicado 
  // (ver melhor isto mais tarde)
  const { id } = useLocalSearchParams<{ id: string }>();

  // Select the current seller from data
  const seller = SELLERS.find(s => s.id.toString() === id?.toString()) || SELLERS[0];

  // Filter posts that belong to this specific seller
  const sellerPosts = POSTS.filter(
    post => post.sellerId === seller.id
  );

  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.mainContainer}>
      {/* Hide the default Expo Router header to use custom header design */}
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={[]}
        keyExtractor={() => "key"}
        style={styles.flatList}
        contentContainerStyle={styles.container}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Top section with seller information and image */}
          <SellerHeader
            vendor={{
              name: seller.name,
              location: seller.location,
              category: seller.categories?.[0],
            }}
            imageUri={seller.imageUri}
            liked={liked}
            onToggleLike={() => setLiked(prev => !prev)}
          />

            {/* Tab section containing "About" and "Announcements" */}
            <SellerTabs
              about={seller.description}
              posts={sellerPosts}
            />
          </>
        }
      />
    </View>
  );
};

export default VendorPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flatList: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },
});