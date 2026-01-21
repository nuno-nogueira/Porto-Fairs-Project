import { apiServices } from '../api/apiServices';
import { Rating } from './ratingsService'; 

export interface Market {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl?: string;
  

  averageRating?: number; 
  ratings?: Rating[];     
}

export const marketsService = {
  
  // Get all markets
  getAllMarkets: async (): Promise<Market[]> => {
    // GraphQL query
    const query = `
      query {
        markets {
          id
          name
          description
          address
        }
      }
    `;

    const response = await apiServices.post('/markets', { query });
    
    //return data
    return response.data.data.markets;
  },

  // Get markets by id
  getMarketById: async (id: string): Promise<Market> => {
    const query = `
      query GetMarket($id: ID!) {
        market(id: $id) {
          id
          name
          description
          address
          imageUrl
          averageRating 
          
          ratings {
             id
             rating
             comment
             user_id
          }
          
          sellers {
             id
             full_name
          }
        }
      }
    `;

    const response = await apiServices.post('/markets', { 
      query, 
      variables: { id } 
    });

    return response.data.data.market;
  }
};