import { apiServices } from '../api/apiServices';

//rating object
export interface Rating {
  _id: string;
  marketId: string;
  userId: string;
  rating: number; 
  comment: string;
  createdAt: string;
}

export const ratingsService = {

  // POST /ratings
  createRating: async (marketId: string, rating: number, comment: string) => {
    const response = await apiServices.post('/ratings', {
      marketId,
      rating,
      comment
    });
    return response.data;
  }
};