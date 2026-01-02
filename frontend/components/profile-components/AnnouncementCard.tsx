import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme"


interface AnnouncementProps {
  announce: {
    id: number;
    text: string;
    date: string;
  };

  onDelete: (id: number) => void;
}

export function AnnouncementCard({
  announce,
  onDelete,
}: AnnouncementProps) {
  const theme = useColorScheme() ?? "light";
  const brandColors = Colors[theme];

  

  return (
    <View style={[styles.container, { backgroundColor: brandColors.cardBackground, shadowColor: brandColors.cardShadow}]}>
      
      <ThemedText style={styles.text}>{announce.text}</ThemedText>

      <View style={styles.footer}>
        <ThemedText type="mini" lightColor="gray" darkColor="#999">
          {announce.date}
        </ThemedText>

        <TouchableOpacity onPress={() => onDelete(announce.id)} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
});
