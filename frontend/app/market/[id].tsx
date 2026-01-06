import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, useColorScheme, FlatList } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// components & themes
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SELLERS, MARKETS } from '@/constants/data'; // Importar os teus dados
import { SellerCard } from '@/components/profile-components/SellerCard';


export default function MarketDetailsScreen() {
  const { id } = useLocalSearchParams(); // ID from URL
  const theme = useColorScheme() ?? 'light';
  const currentColors = Colors[theme];
  const market = MARKETS.find(m => m.id.toString() === id) || MARKETS[0];
  const [rating, setRating] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const description = market.description || "Sem descrição disponível para esta feira.";


  // ...


  const renderStars = () => {
    return (
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons 
              name="star" 
              size={40} 
              color={star <= rating ? "#FFB800" : "#E0E0E0"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* transparent header */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEARDER */}
        <View style={styles.imageContainer}>
          <Image source={market.image} style={styles.headerImage} />
          
          {/* Overlay  */}
          <View style={styles.overlay} />

          {/* Navigation buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={currentColors.primary} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="share-social" size={24} color={currentColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="heart" size={24} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* === Market info === */}
        <View style={styles.content}>
          <ThemedText type="title" style={{ fontSize: 26, marginBottom: 15 }}>{market.title}</ThemedText>

          {/* location */}
          <View style={styles.row}>
            <Ionicons name="location-sharp" size={24} color={currentColors.primary} />
            <ThemedText style={styles.rowText}>{market.address}</ThemedText>
          </View>

          {/* Time */}
          <View style={styles.row}>
            <Ionicons name="time" size={24} color={currentColors.primary} />
            <ThemedText style={styles.rowText}>{market.schedule}</ThemedText>
          </View>

           {/* Distance (static) */}
           <View style={styles.row}>
            <Ionicons name="map" size={24} color={currentColors.primary} />
            {/* edit here de distance */}
            <ThemedText style={styles.rowText}>8,5km • 15min</ThemedText> 
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}><Ionicons name="restaurant" size={12} color="#C05528"/><ThemedText style={styles.tagText}>Alimentação</ThemedText></View>
            <View style={styles.tag}><Ionicons name="shirt" size={12} color="#C05528"/><ThemedText style={styles.tagText}>Vestuário</ThemedText></View>
          </View>

          {/* Description */}
       <ThemedText style={{ lineHeight: 22, color: 'gray', marginBottom: 5 }}>
            {isExpanded ? description : description.slice(0, 100) + (description.length > 100 ? '...' : '')}
            {/* "see more btn - if text > 100 caracters" */}
            {description.length > 100 && ( 
                <ThemedText 
                    onPress={() => setIsExpanded(!isExpanded)}
                    style={{ color: currentColors.primary, fontWeight: 'bold' }}
                >
                   {isExpanded ? ' Ver menos' : ' Ver mais'}
                </ThemedText>
            )}
          </ThemedText>

          {/* === Action buttons === */}
          <View style={styles.actionButtonsRow}>
            <PrimaryButton 
              title="Ver no Mapa" 
              iconName="navigate" 
              onPress={() => {}} 
              style={{ flex: 1, marginRight: 10 }}
            />
            {/* Map button */}
            <TouchableOpacity style={styles.calendarBtn}>
               <Ionicons name="calendar" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* === Sellers === */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>Os nossos participantes</ThemedText>
          <FlatList
            horizontal
            data={SELLERS}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <SellerCard item={item} onPress={() => {}} />}
          />

          {/* === Rating === */}
          <View style={{ marginTop: 30 }}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Gostaste da experiência?</ThemedText>
            <ThemedText style={{ color: 'gray', marginBottom: 15 }}>
              Ajuda-nos a melhorar as nossas feiras. A tua opinião é importante!
            </ThemedText>

            {/* Rating Stars  */}
            {renderStars()}

            <PrimaryButton title="Submeter Avaliação" iconName="paper-plane" onPress={() => console.log(rating)} />
          </View>

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header Image Styles
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    // O truque para arredondar em baixo
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerButtons: {
    position: 'absolute',
    top: 50, // Ajustar para a Notch do iPhone
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
  },

  // Content Styles
  content: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowText: { marginLeft: 10, fontSize: 16, color: '#555' },
  
  tagsRow: { flexDirection: 'row', gap: 10, marginTop: 5, marginBottom: 20 },
  tag: { 
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF0E5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 
  },
  tagText: { color: '#C05528', fontWeight: 'bold', fontSize: 12 },

  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 30 },
  calendarBtn: {
    width: 50, height: 50,
    backgroundColor: '#FFB800', // Aquele amarelo da imagem
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionTitle: { marginBottom: 15, fontSize: 20 },
});