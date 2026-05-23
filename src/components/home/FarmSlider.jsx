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
const CARD_WIDTH = screenWidth - 64; // Hint next card partially
const CARD_MARGIN = 8;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;

export default function FarmSlider({ 
  farmDetailsList = [], 
  onAddFarmPress, 
  onEditFarmPress 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Render a single farm card
  const renderFarmCard = (details) => {
    const defaultImageMap = {
      'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
      'Cotton': 'https://images.unsplash.com/photo-1594900010996-3c224b1c855a?w=600&q=80',
      'Rice': 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&q=80',
    };

    const imageUrl = details.image || defaultImageMap[details.cropName] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80';

    return (
      <View key={details.id} style={[styles.card, { width: farmDetailsList.length === 1 ? screenWidth - 32 : CARD_WIDTH }]}>
        {/* Farm Image & Floating Actions */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.imageOverlay} />
          
          {/* Crop Badge */}
          <View style={styles.cropBadge}>
            <MaterialCommunityIcons name="leaf" size={14} color="#FFF" />
            <Text style={styles.cropBadgeText}>{details.cropName}</Text>
          </View>

          {/* Floating Edit Button */}
          <TouchableOpacity 
            style={styles.floatingEditBtn} 
            activeOpacity={0.8}
            onPress={() => onEditFarmPress(details)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Farm Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.farmTitle}>{details.cropName} Farm</Text>
          
          {details.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {details.description}
            </Text>
          ) : null}

          {/* Grid of parameters */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons name="ruler-square" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Area</Text>
                <Text style={styles.statValue}>{details.area || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons name="water-pump" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Irrigation</Text>
                <Text style={styles.statValue} numberOfLines={1}>{details.waterSource || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons name="land-plots" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Soil Type</Text>
                <Text style={styles.statValue} numberOfLines={1}>{details.soilType || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render the "+ Add Farm" card at the end of the slider
  const renderAddFarmCard = () => {
    return (
      <TouchableOpacity 
        style={[styles.card, styles.addCard, { width: CARD_WIDTH }]}
        activeOpacity={0.8}
        onPress={onAddFarmPress}
      >
        <View style={styles.addCardInner}>
          <View style={styles.plusIconCircle}>
            <MaterialCommunityIcons name="plus" size={32} color={colors.primary} />
          </View>
          <Text style={styles.addCardTitle}>Add New Farm</Text>
          <Text style={styles.addCardSubtitle}>Manage another crop, track soil data & irrigate smartly</Text>
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
              <MaterialCommunityIcons name="sprout-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Farms Added Yet</Text>
            <Text style={styles.emptySubtitle}>Share your farm details to get personalized suggestions, crop suggestions & alerts.</Text>
            <View style={styles.addFarmBtn}>
              <MaterialCommunityIcons name="plus" size={20} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.addFarmBtnText}>Add Your First Farm</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // If there is only 1 farm, render it standard full-width
  if (farmDetailsList.length === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
            <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
            <Text style={styles.headerAddBtnText}>Add Farm</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ paddingHorizontal: 16 }}>
          {renderFarmCard(farmDetailsList[0])}
        </View>
      </View>
    );
  }

  // Combine farms list and Add card
  const carouselData = [...farmDetailsList, { id: 'ADD_NEW_FARM_CARD' }];

  return (
    <View style={styles.container}>
      {/* Header section with count */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
          <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
          <Text style={styles.headerAddBtnText}>Add Farm</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal FlatList Slider */}
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

      {/* Pagination Indicators */}
      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <View 
              key={index} 
              style={[
                styles.dot, 
                isActive ? styles.dotActive : styles.dotInactive,
                // Make the Add New Farm dot a bit different or normal
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
    marginVertical: 12,
  },
  emptyContainer: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  farmCountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  farmCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 2,
  },
  sliderContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: CARD_MARGIN,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  cropBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  cropBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  floatingEditBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  detailsContainer: {
    padding: 16,
  },
  farmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F8E9',
    paddingTop: 12,
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  statIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0F8F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  // Add Card styles
  addCard: {
    backgroundColor: '#F9FBF7',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardInner: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  plusIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  addCardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  // Pagination Indicators
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#E0E0E0',
  },
  addDot: {
    backgroundColor: '#C8E6C9',
  },
  // Empty State styles
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C8E6C9',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyPlusWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F8F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  addFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addFarmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
