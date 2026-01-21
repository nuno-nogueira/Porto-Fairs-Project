import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

interface SellerHeaderProps {
  vendor: {
    name: string;
    location: string;
    category?: string;
  };
  imageUri: any;
  liked: boolean;
  onToggleLike: () => void;
}

export function SellerHeader({ vendor, imageUri, liked, onToggleLike }: SellerHeaderProps) {
  const router = useRouter();
  const brandColor = "#c64f23";
  const mutedColor = "#A0AEC0";

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topButton}>
          <Ionicons name="chevron-back" size={32} color={brandColor} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.topButton} onPress={onToggleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={32} color={brandColor} />
        </TouchableOpacity>
      </View>

      {/* Profile Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri} 
          style={styles.profileImage} 
        />
      </View>
      
      {/* Seller Identity */}
      <ThemedText type="title" style={styles.name}>
        {vendor.name}
      </ThemedText>
      
      {/* Location Badge */}
      <View style={styles.locationContainer}>
        <Ionicons name="location-sharp" size={18} color={mutedColor} />
        <ThemedText style={styles.location}>
          {vendor.location}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF',
    paddingTop: 85,
    paddingBottom: 20,
  }, 
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 25,
    position: 'absolute',
    top: 70,
    zIndex: 10,
  },
  topButton: {
    padding: 4,
  },
  imageContainer: {
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60,
  },
  name: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#2D1A12',
    textAlign: 'center',
    marginTop: 15,
  },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
  },
  location: { 
    marginLeft: 4, 
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '400',
  },
});
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";

// interface SellerHeaderProps {
//   vendor: {
//     name: string;
//     location: string;
//     category?: string;
//   };
//   imageUri: string;
//   liked: boolean;
//   onToggleLike: () => void;
// }

// export const SellerHeader = ({
//   vendor,
//   imageUri,
//   liked,
//   onToggleLike,
// }: SellerHeaderProps) => {
//   return (
//     <View style={styles.container}>
//       <Image source={{ uri: imageUri }} style={styles.image} />

//       {/* ❤️ Coração (não altera layout existente) */}
//       <TouchableOpacity
//         onPress={onToggleLike}
//         style={styles.heartButton}
//         activeOpacity={0.7}
//       >
//         <Image
//           source={
//             liked
//               ? require("@/assets/icons/heart-filled.png")
//               : require("@/assets/icons/heart-outline.png")
//           }
//           style={styles.heartIcon}
//         />
//       </TouchableOpacity>

//       {/* Info do vendedor (inalterado) */}
//       <View style={styles.info}>
//         <Text style={styles.name}>{vendor.name}</Text>
//         <Text style={styles.location}>{vendor.location}</Text>
//         {vendor.category && (
//           <Text style={styles.category}>{vendor.category}</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: "relative",
//   },
//   image: {
//     width: "100%",
//     height: 220,
//   },
//   heartButton: {
//     position: "absolute",
//     top: 16,
//     right: 16,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     padding: 6,
//   },
//   heartIcon: {
//     width: 22,
//     height: 22,
//   },
//   info: {
//     padding: 16,
//   },
//   name: {
//     fontSize: 22,
//     fontWeight: "700",
//   },
//   location: {
//     color: "#666",
//   },
//   category: {
//     color: "#C64F23",
//     fontWeight: "600",
//   },
// });