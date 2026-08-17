import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  FlatList,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '../components/common/ScreenContainer';
import { MOCK_MEDICINES } from '../constants/data';
import colors from '../utils/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Find the product details
  const product = MOCK_MEDICINES.find(med => med.id === id) || MOCK_MEDICINES[0];

  // Filter similar products from the same category
  const similarProducts = MOCK_MEDICINES.filter(
    med => med.category === product.category && med.id !== product.id
  );

  // Fallback images based on product category
  const imageMap = {
    'Fertilizer': 'https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=600&q=80',
    'Fungicide': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80',
    'Pesticide': 'https://images.unsplash.com/photo-1563241527-3004b7be0bfb?w=600&q=80',
  };
  const imageUrl = product.image || imageMap[product.category] || 'https://images.unsplash.com/photo-1592982537444-d30f40f090b8?w=600&q=80';



  const renderSimilarProductCard = ({ item }) => {
    const itemImageUrl = item.image || imageMap[item.category] || imageUrl;
    return (
      <TouchableOpacity 
        style={styles.similarCard} 
        activeOpacity={0.8}
        onPress={() => router.replace({ pathname: '/product-details', params: { id: item.id } })}
      >
        <Image source={{ uri: itemImageUrl }} style={styles.similarImage} />
        <View style={styles.similarInfo}>
          <Text style={styles.similarName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.similarPrice}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 1. Top Hero Section */}
          <View style={styles.heroSection}>
            <Image source={{ uri: imageUrl }} style={styles.heroImage} />
            <View style={styles.gradientOverlay} />

            {/* Navigation Overlays */}
            <TouchableOpacity 
              style={[styles.floatingActionBtn, styles.backBtn]} 
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.floatingActionBtn, styles.favoriteBtn]} 
              activeOpacity={0.7}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <MaterialCommunityIcons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#EF5350" : colors.text} 
              />
            </TouchableOpacity>
          </View>

          {/* 2. Product Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category}</Text>
              </View>
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>In Stock</Text>
              </View>
            </View>

            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.targetRow}>
              <MaterialCommunityIcons name="target-account" size={16} color={colors.error} />
              <Text style={styles.targetLabel}>Target: </Text>
              <Text style={styles.targetValue}>{product.disease}</Text>
            </View>

            <View style={styles.ratingPriceRow}>
              <View>
                <Text style={styles.priceText}>{product.price.split(' ')[0]}</Text>
                <Text style={styles.unitText}>{product.price.split(' ').slice(1).join(' ') || product.quantity}</Text>
              </View>

              <View style={styles.ratingContainer}>
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={16} color={colors.accent} />
                  <Text style={styles.ratingValueText}>{product.reviews.split(' ')[0]}</Text>
                </View>
                <Text style={styles.reviewsCountText}>{product.reviews.split(' ').slice(1).join(' ')}</Text>
              </View>
            </View>
          </View>



          {/* 3. Description & Usage Sections */}
          <View style={styles.detailsCard}>
            {/* Description */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Full Description</Text>
              </View>
              <Text style={styles.sectionText}>{product.description}</Text>
            </View>

            <View style={styles.sectionDivider} />

            {/* How to Use */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="water-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>How To Use</Text>
              </View>
              <Text style={styles.sectionText}>{product.howToUse}</Text>
            </View>

            <View style={styles.sectionDivider} />

            {/* Benefits */}
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Key Benefits</Text>
              </View>
              <View style={styles.bulletRow}>
                <MaterialCommunityIcons name="circle" size={6} color={colors.textSecondary} style={styles.bulletDot} />
                <Text style={styles.bulletText}>Provides rapid recovery from {product.disease.toLowerCase()}.</Text>
              </View>
              <View style={styles.bulletRow}>
                <MaterialCommunityIcons name="circle" size={6} color={colors.textSecondary} style={styles.bulletDot} />
                <Text style={styles.bulletText}>Helps maximize overall farm crop yield and health.</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Safety Warnings */}
            <View style={[styles.detailSection, styles.warningBox]}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="alert" size={20} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>Safety & Warnings</Text>
              </View>
              <Text style={styles.warningTitle}>{product.warning}</Text>
              <Text style={styles.safetyText}>{product.safety}</Text>
            </View>
          </View>



          {/* 4. Similar Products Section */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.sectionBlockTitle}>Similar Products</Text>
              <FlatList
                data={similarProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={renderSimilarProductCard}
                contentContainerStyle={styles.similarListContent}
              />
            </View>
          )}

        </ScrollView>

        {/* 5. Bottom Sticky Action Bar */}
        <View style={styles.stickyFooter}>
          <View style={styles.footerPriceContainer}>
            <Text style={styles.footerPriceLabel}>Total Price</Text>
            <Text style={styles.footerPriceValue}>{product.price.split(' ')[0]}</Text>
          </View>

          <TouchableOpacity 
            style={styles.callBtn} 
            activeOpacity={0.8}
            onPress={() => Linking.openURL('tel:+919687918414')}
          >
            <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" style={styles.callIcon} />
            <Text style={styles.callText}>Call for more info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroSection: {
    width: screenWidth,
    height: 300,
    backgroundColor: '#000',
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  floatingActionBtn: {
    position: 'absolute',
    top: 40,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backBtn: {
    left: 16,
  },
  favoriteBtn: {
    right: 16,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  stockBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockBadgeText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  productName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 34,
    marginBottom: 10,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  targetLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  targetValue: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '700',
  },
  ratingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  unitText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 4,
  },
  ratingValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviewsCountText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  detailsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F8E9',
    marginBottom: 16,
  },
  detailSection: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F8E9',
    marginVertical: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    marginTop: 2,
  },
  bulletText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginTop: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 6,
  },
  safetyText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  sectionBlockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  similarSection: {
    marginBottom: 10,
  },
  similarListContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  similarCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F8E9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  similarImage: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  similarInfo: {
    padding: 10,
  },
  similarName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  similarPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  footerPriceContainer: {
    justifyContent: 'center',
  },
  footerPriceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  footerPriceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  callBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 14,
    minWidth: 180,
    gap: 8,
  },
  callText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  callIcon: {
    marginRight: 2,
  },
});
