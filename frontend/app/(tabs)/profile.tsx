import React, { useState } from "react";
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
} from "react-native";
import { router } from 'expo-router'; 
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

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

import { MARKETS, SELLERS, POSTS } from "@/constants/data";

const currentUser = SELLERS[0];

export default function ProfileScreen() {
  const isSeller = true;
  const colorScheme = useColorScheme() ?? "light";
  const brandColors = Colors[colorScheme];

  //states
  const [favoriteMarkets, setFavoriteMarkets] = useState(MARKETS);
  const [profileImage, setProfileImage] = useState(currentUser.avatar);
  const [announcements, setAnnouncements] = useState(POSTS);
  const [modalVisible, setModalVisible] = useState(false); // control modal visibility
  const [newPostText, setNewPostText] = useState(""); // add new post text

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
  // Remove market from favorites
  function RemoveMarketFromFav(id: number) {
    setFavoriteMarkets((currentList) => currentList.filter((m) => m.id !== id));
  }

  // Create announcement
  function createAnnouncement() {
    if (newPostText.trim() === "") {
      Alert.alert("Erro", "Escreve alguma coisa antes de publicar!");
      return;
    }

    const newPost = {
      id: Date.now(), // Gera um ID único baseado na hora
      text: newPostText,
      date: "Agora mesmo",
    };

    setAnnouncements([newPost, ...announcements]);
    setNewPostText(""); // Limpa o texto
    setModalVisible(false); // Fecha o modal
  }

  // 4. Delete announcement
  function deleteAnnouncement(id: number) {
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
            user={currentUser}
            imageUri={profileImage} // Passa a imagem do estado
            onEditImage={handlePickImage} // Passa a função de escolher
          />

          {/* Button create an announcement */}
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
                item={item}
                onPress={(market) => {
                  console.log("A navegar para a feira:", market.id);
                  router.push(`/market/${market.id}`);
                }}
                onRemove={RemoveMarketFromFav}
              />
            )}
            ListEmptyComponent={
              <ThemedText
                style={{ marginLeft: 20, fontStyle: "italic", color: "gray" }}
              >
                Ainda não tens feiras favoritas.
              </ThemedText>
            }
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

        {/* became a seller */}
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
