
import React from "react";
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { categoryIcons } from "@/app/(tabs)/categoryIcons";

interface FairItem {
    id: string;
    name: string;
    openingHours: string;
    address: string;
    categories: string[];
    imageUrl: string;
    latitude: number;
    longitude: number;
    iconKey?: string;
}

interface FairListProps {
    data: FairItem[];
    onSelect: (item: FairItem) => void;
    favoriteIds: string[];
    updatingFavoriteIds: Set<string>;
    onToggleFavorite: (id: string) => void;
}

const categoryToIcon: Record<string, string> = {
    "Alimentação": "alimentacao",
    "Vestuário": "artesanato",
    "Velharias": "velharias",
    "Cultura": "cultura",
    "default": "cultura"
};

interface FairCardProps {
    item: FairItem;
    onSelect: () => void;
    isFavorite: boolean;
    isUpdating: boolean;
    onToggleFavorite: () => void;
}

function FairCard({
    item,
    onSelect,
    isFavorite,
    isUpdating,
    onToggleFavorite
}: FairCardProps) {
    const iconKey =
        item.iconKey ??
        categoryToIcon[item.categories?.[0] ?? ""] ??
        categoryToIcon.default;

    return (
        <View style={styles.card}>

            <TouchableOpacity
                style={styles.cardContent}
                activeOpacity={0.8}
                onPress={onSelect}
            >
                <Image
                    style={styles.image}
                    source={
                        item.imageUrl
                            ? { uri: item.imageUrl }
                            : require("../../assets/images/fair-default-image.png")
                    }
                    resizeMode="cover"
                />

                <View style={styles.details}>

                    <Text
                        style={styles.schedule}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.openingHours || "Horário não disponível"}
                    </Text>

                    <Text
                        style={styles.title}
                        numberOfLines={2}
                    >
                        {item.name}
                    </Text>

                    <View style={styles.addressDiv}>
                        <Image
                            source={require("../../assets/map-icons/address-icon.png")}
                            style={styles.locationIcon}
                        />

                        <Text
                            style={styles.address}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {item.address}
                        </Text>
                    </View>

                    <View style={styles.categoriesDiv}>
                        <View style={styles.categoryIcon}>
                            <Image
                                source={categoryIcons[iconKey]}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.favoriteButton}
                onPress={onToggleFavorite}
                disabled={isUpdating}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                    isFavorite
                        ? "Remover dos favoritos"
                        : "Adicionar aos favoritos"
                }
            >
                <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={23}
                    color={isFavorite ? "#C64F23" : "#858080"}
                />
            </TouchableOpacity>
        </View>
    );
}

export default function FairList({
    data,
    onSelect,
    favoriteIds,
    updatingFavoriteIds,
    onToggleFavorite
}: FairListProps) {

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
                const id = String(item.id);

                return (
                    <FairCard
                        item={item}
                        onSelect={() => onSelect(item)}
                        isFavorite={favoriteIds.includes(id)}
                        isUpdating={updatingFavoriteIds.has(id)}
                        onToggleFavorite={() => onToggleFavorite(id)}
                    />
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 15
    },

    card: {
        flexDirection: "row",
        position: "relative",
        width: "100%",
        padding: 8,
        marginBottom: 10,
        borderRadius: 15,
        backgroundColor: "#FFFFFF"
    },

    cardContent: {
        flexDirection: "row",
        flex: 1,
        minWidth: 0
    },

    image: {
        width: 105,
        height: 110,
        borderRadius: 15,
        backgroundColor: "#F0F0F0"
    },

    details: {
        flex: 1,
        minWidth: 0,
        paddingLeft: 12,
        paddingRight: 38
    },

    schedule: {
        color: "#F88B72",
        fontSize: 12,
        lineHeight: 16,
        marginTop: 3,
        marginBottom: 3,
        minWidth: 0,
        flexShrink: 1
    },

    title: {
        fontWeight: "bold",
        fontSize: 16,
        paddingVertical: 4
    },

    addressDiv: {
        flexDirection: "row",
        alignItems: "flex-start",
        minWidth: 0
    },

    locationIcon: {
        width: 13,
        height: 13,
        marginTop: 3,
        marginRight: 5
    },

    address: {
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        lineHeight: 16,
        color: "#666666"
    },

    categoriesDiv: {
        paddingTop: 8
    },

    categoryIcon: {
        width: 30,
        height: 30,
        padding: 5,
        borderColor: "#C64F23",
        borderWidth: 1,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },

    favoriteButton: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2
    }
});
