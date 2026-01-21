import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Define the shape of the data expected by this component
interface AnnouncementProps {
  announce: {
    id: string;
    text: string;
    date: string;
  };
}

export function AnnouncementCard({ announce }: AnnouncementProps) {
  return (
    /* Main card container with shadow and padding */
    <View style={styles.container}>
      {/* Announcement message text */}
      <Text style={styles.text}>{announce.text}</Text>
      
      {/* Date or timestamp of the post */}
      <Text style={styles.date}>{announce.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12, 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
    color: "#1F2937",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
});