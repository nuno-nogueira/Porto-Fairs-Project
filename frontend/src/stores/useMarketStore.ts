import { create } from 'zustand';
import { marketsService, Market } from '../services/marketsService';
import { ratingsService, Rating } from '../services/ratingsService';

// Define store types and state     
interface MarketState {
  markets: Market[];             // Lista de todas as feiras
  selectedMarket: Market | null; // A feira que o utilizador clicou
  marketRatings: Rating[];       // As avaliações da feira selecionada
  isLoading: boolean;            // Para mostrar o "círculo a girar"
  error: string | null;          // Para mostrar mensagens de erro

  // --- functions ---
  fetchMarkets: () => Promise<void>;
  selectMarket: (marketId: string) => Promise<void>;
  addRatingToMarket: (marketId: string, rating: number, comment: string) => Promise<void>;
}

// store
export const useMarketStore = create<MarketState>((set, get) => ({
  markets: [],
  selectedMarket: null,
  marketRatings: [],
  isLoading: false,
  error: null,

  // Fetch all markets from backend     
  fetchMarkets: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await marketsService.getAllMarkets();
      set({ markets: data });
    } catch (error: any) {
      set({ error: 'Error fetching markets' });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  //select a market and fetch its ratings
selectMarket: async (marketId: string) => {
    set({ isLoading: true, error: null, selectedMarket: null });
    try {
      const marketData = await marketsService.getMarketById(marketId);

      set({ 
        selectedMarket: marketData,
        marketRatings: marketData.ratings || [] 
      });

    } catch (error: any) {
      set({ error: 'Error fetching market details' });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new rating to a market   
  addRatingToMarket: async (marketId, rating, comment) => {
    try {
      await ratingsService.createRating(marketId, rating, comment);

        // Refresh ratings after adding a new one           
      const updatedRatings = await ratingsService.getRatingsByMarket(marketId);
      set({ marketRatings: updatedRatings });

    } catch (error: any) {
      console.error("Error rating market:", error);
      throw error;
    }
  }
}));