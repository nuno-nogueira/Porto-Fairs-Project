package com.example.favorites.repository;
import com.example.favorites.model.Favorite;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    
    List<Favorite> findByUserId(String userId); 
}
