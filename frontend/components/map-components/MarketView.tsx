
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Item Definitions
interface FairItem {
  id: number | string;
  title: string;
  schedule: string;
  address: string;
  imageUrl?: string | null;
}

interface FairDetailsProps {
  fair: FairItem;
  onBack: () => void;
  onStartRoute: () => void;
  routeInfo: {
    driving?: {
      distance: string;
      duration: string;
      arrivalTime: string;
    };
  } | null;
}

// Fair Details Definition
export default function FairDetails({
  fair,
  onBack,
  onStartRoute,
  routeInfo,
}: FairDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const distanceDisplay = routeInfo?.driving?.distance;

  // Toggle favorite
  const handleFavorite = () => {
    setIsFavorite((previous) => !previous);

    // Backend integration later
  };

  // Share market information
  const handleShare = async () => {
    try {
      await Share.share({
        title: fair.title,
        message: `${fair.title}\n${fair.address}`,
      });
    } catch (error) {
      console.error('[Market] Could not share market:', error);
    }
  };

  if (!fair) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Nenhum detalhe selecionado.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.marketImageContainer}>
          <Image
            source={
              imageError || !fair.imageUrl
                ? require('../../assets/images/fair-default-image.png')
                : { uri: fair.imageUrl }
            }
            style={styles.marketImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {fair.title}
          </Text>

          <View style={styles.scheduleContainer}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#C64F23"
            />

            <Text style={styles.schedule} numberOfLines={2}>
              {fair.schedule || 'Horário não disponível'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close"
            size={20}
            color="#777777"
          />
        </TouchableOpacity>
      </View>

      {/* Market Information */}
      <View style={styles.infoSection}>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons
              name="location-outline"
              size={19}
              color="#C64F23"
            />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              Localização
            </Text>

            <Text style={styles.infoValue}>
              {fair.address || 'Morada não disponível'}
            </Text>
          </View>
        </View>

        {distanceDisplay && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="navigate-outline"
                size={19}
                color="#C64F23"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                Distância
              </Text>

              <Text style={styles.infoValue}>
                {distanceDisplay}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavorite}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={21}
              color={isFavorite ? '#C64F23' : '#555555'}
            />

            <Text style={[
              styles.actionText,
              isFavorite && styles.favoriteText,
            ]}>
              {isFavorite ? 'Guardado' : 'Favorito'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-social-outline"
              size={21}
              color="#555555"
            />

            <Text style={styles.actionText}>
              Partilhar
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.routeButton}
          onPress={onStartRoute}
          activeOpacity={0.85}
        >
          <Ionicons
            name="navigate"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.routeButtonText}>
            Ver rota
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  marketImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F0EFED',
  },

  marketImage: {
    width: '100%',
    height: '100%',
  },

  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 9,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#292929',
    lineHeight: 23,
  },

  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  schedule: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#C64F23',
    lineHeight: 17,
  },

  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F1EF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  infoSection: {
    gap: 13,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEAE7',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoTextContainer: {
    flex: 1,
    gap: 2,
  },

  infoLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
    lineHeight: 18,
  },

  actionsContainer: {
    gap: 13,
  },

  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 5,
  },

  actionText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
  },

  favoriteText: {
    color: '#C64F23',
  },

  routeButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: '#C64F23',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16
  },

  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
  },
});
