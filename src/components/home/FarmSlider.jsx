import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

const { width: screenWidth } = Dimensions.get('window');

// Layout Constants
const CARD_WIDTH = screenWidth - 48; // Hint next card partially
const CARD_HEIGHT = 135; // Fixed compact height so it does not stretch
const CARD_MARGIN = 8;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

export default function FarmSlider({ 
  farmDetailsList = [], 
  onAddFarmPress, 
  onEditFarmPress 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Render a single farm card in a compact horizontal style
  const renderFarmCard = (details) => {
    const defaultImageMap = {
      'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80',
      'Cotton': 'https://images.unsplash.com/photo-1594900010996-3c224b1c855a?w=300&q=80',
      'Rice': 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=300&q=80',
    };

    const imageUrl = details.image || defaultImageMap[details.cropName] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&q=80';

    return (
      <View key={details.id} style={[styles.card, { width: farmDetailsList.length === 1 ? screenWidth - 32 : CARD_WIDTH }]}>
        {/* Left Side: Compact Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          {/* Small crop overlay badge */}
          <View style={styles.cropBadge}>
            <Text style={styles.cropBadgeText} numberOfLines={1}>{details.cropName}</Text>
          </View>
        </View>

        {/* Right Side: Details Column */}
        <View style={styles.detailsContainer}>
          {/* Title Row with Edit button */}
          <View style={styles.headerRow}>
            <Text style={styles.farmTitle} numberOfLines={1}>{details.cropName} Farm</Text>
            <TouchableOpacity 
              style={styles.editBtn} 
              activeOpacity={0.7}
              onPress={() => onEditFarmPress(details)}
            >
              <MaterialCommunityIcons name="pencil" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          {details.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {details.description}
            </Text>
          ) : (
            <Text style={[styles.description, { fontStyle: 'italic', color: colors.textLight }]} numberOfLines={1}>
              No description added
            </Text>
          )}

          {/* Stats Chips Row */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="ruler-square" size={12} color={colors.primary} />
              <Text style={styles.statChipText} numberOfLines={1}>{details.area || 'N/A'}</Text>
            </View>

            <View style={styles.statChip}>
              <MaterialCommunityIcons name="water-pump" size={12} color={colors.primary} />
              <Text style={styles.statChipText} numberOfLines={1}>{details.waterSource || 'N/A'}</Text>
            </View>

            <View style={styles.statChip}>
              <MaterialCommunityIcons name="land-plots" size={12} color={colors.primary} />
              <Text style={styles.statChipText} numberOfLines={1}>{details.soilType || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render Add Farm Card in the same compact row layout
  const renderAddFarmCard = () => {
    return (
      <TouchableOpacity 
        style={[styles.card, styles.addCard, { width: CARD_WIDTH }]}
        activeOpacity={0.8}
        onPress={onAddFarmPress}
      >
        <View style={styles.addCardLeft}>
          <View style={styles.plusIconCircle}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
          </View>
        </View>
        <View style={styles.addCardRight}>
          <Text style={styles.addCardTitle}>Add New Farm</Text>
          <Text style={styles.addCardSubtitle} numberOfLines={2}>
            Manage another crop, track soil data & irrigate smartly.
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // If there are 0 farms
  if (farmDetailsList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Farms</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.emptyCard}
          activeOpacity={0.8}
          onPress={onAddFarmPress}
        >
          <View style={styles.emptyCardContent}>
            <View style={styles.emptyPlusWrapper}>
              <MaterialCommunityIcons name="sprout-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Farms Added Yet</Text>
            <Text style={styles.emptySubtitle}>Add your farm details to get suggestions & alerts.</Text>
            <View style={styles.addFarmBtn}>
              <MaterialCommunityIcons name="plus" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.addFarmBtnText}>Add Farm</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // If there is only 1 farm, display it standard full width
  if (farmDetailsList.length === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.sectionTitle}>My Farms</Text>
            <View style={styles.farmCountBadge}>
              <Text style={styles.farmCountText}>1</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.headerAddBtn}
            onPress={onAddFarmPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
            <Text style={styles.headerAddBtnText}>Add Farm</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ paddingHorizontal: 16 }}>
          {renderFarmCard(farmDetailsList[0])}
        </View>
      </View>
    );
  }

  const carouselData = [...farmDetailsList, { id: 'ADD_NEW_FARM_CARD' }];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.sectionTitle}>My Farms</Text>
          <View style={styles.farmCountBadge}>
            <Text style={styles.farmCountText}>{farmDetailsList.length}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.headerAddBtn}
          onPress={onAddFarmPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
          <Text style={styles.headerAddBtnText}>Add Farm</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={carouselData}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        snapToAlignment="center"
        contentContainerStyle={styles.sliderContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event) => {
              const xOffset = event.nativeEvent.contentOffset.x;
              const index = Math.round(xOffset / SNAP_INTERVAL);
              if (index >= 0 && index < carouselData.length && index !== activeIndex) {
                setActiveIndex(index);
              }
            }
          }
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.id === 'ADD_NEW_FARM_CARD') {
            return renderAddFarmCard();
          }
          return renderFarmCard(item);
        }}
      />

      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <View 
              key={index} 
              style={[
                styles.dot, 
                isActive ? styles.dotActive : styles.dotInactive,
                index === carouselData.length - 1 && styles.addDot
              ]} 
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  emptyContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  farmCountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  farmCountText: {
    fontSize: 11,
    fontWeight: '300',
    color: colors.primary,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.primary,
    marginLeft: 2,
  },
  sliderContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: CARD_MARGIN,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  imageContainer: {
    width: 95,
    height: '100%',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cropBadge: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(46, 125, 50, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  cropBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  detailsContainer: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 6,
  },
  editBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F8F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    flex: 1,
    marginVertical: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F8E9',
    paddingTop: 6,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F1',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
    flex: 1,
    justifyContent: 'center',
  },
  statChipText: {
    fontSize: 9,
    color: colors.text,
    fontWeight: '400',
    maxWidth: 55,
  },
  // Add Card styles
  addCard: {
    backgroundColor: '#F9FBF7',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  addCardLeft: {
    width: 95,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E8F5E9',
  },
  plusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardRight: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  addCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  addCardSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  // Pagination Indicators
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 14,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E0E0E0',
  },
  addDot: {
    backgroundColor: '#C8E6C9',
  },
  // Empty State styles
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C8E6C9',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardContent: {
    alignItems: 'center',
  },
  emptyPlusWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  addFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addFarmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
