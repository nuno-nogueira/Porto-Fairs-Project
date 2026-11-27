
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

type FavoriteTarget = "market" | "seller";

interface Favorite {
    id: string;
    userId: string;
    targetValue: FavoriteTarget;
    targetId: string;
}

interface ServiceResponse<T> {
    message?: string;
    data: T | null;
}

const fetchFavoriteId = async (
    userId: string,
    targetValue: FavoriteTarget,
    targetId: string
): Promise<string | null> => {
    try {
        const response = await api.get<ServiceResponse<Favorite[]>>(
            `/favorites/user/${userId}`
        );

        const favorites = response.data?.data ?? [];

        const favorite = favorites.find(
            (item) =>
                item.targetValue === targetValue &&
                item.targetId === targetId
        );

        return favorite?.id ?? null;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }

        throw error;
    }
};

export const useFavorite = (
    targetValue: FavoriteTarget,
    targetId: string | null
) => {
    const { user } = useAuth();

    const [favoriteId, setFavoriteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const userId = user?._id;

    useEffect(() => {
        let isActive = true;

        const loadFavorite = async () => {
            if (!userId || !targetId) {
                setFavoriteId(null);
                setLoading(false);
                return;
            }

            setFavoriteId(null);
            setLoading(true);

            try {
                const id = await fetchFavoriteId(
                    userId,
                    targetValue,
                    targetId
                );

                if (isActive) {
                    setFavoriteId(id);
                }
            } catch (error) {
                console.error("Error loading favorite:", error);

                if (isActive) {
                    setFavoriteId(null);
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        void loadFavorite();

        return () => {
            isActive = false;
        };
    }, [userId, targetValue, targetId]);

    const toggleFavorite = useCallback(async () => {
        if (!userId || !targetId || updating) {
            return;
        }

        setUpdating(true);

        try {
            if (favoriteId) {
                await api.delete(`/favorites/${favoriteId}`);

                setFavoriteId(null);
            } else {
                const response = await api.post<ServiceResponse<Favorite>>(
                    "/favorites",
                    {
                        userId,
                        targetValue,
                        targetId
                    }
                );

                const createdFavorite = response.data?.data;

                if (createdFavorite?.id) {
                    setFavoriteId(createdFavorite.id);
                } else {
                    const id = await fetchFavoriteId(
                        userId,
                        targetValue,
                        targetId
                    );

                    setFavoriteId(id);
                }
            }
        } finally {
            setUpdating(false);
        }
    }, [userId, targetValue, targetId, favoriteId, updating]);

    return {
        isFavorite: favoriteId !== null,
        loading,
        updating,
        toggleFavorite
    };
};
