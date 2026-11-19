export interface MapMarketSeller {
    id: string;
    full_name: string;
    description ?: string | null;
    avatar ?: string | null;
}

export interface MapMarket {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    address: string;
    latitude: number;
    longitude: number;
    openingHours: string;
    categories: string[];
    iconKey ?: string | null;
    sellers: MapMarketSeller[];
}