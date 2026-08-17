import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedInput from '../components/common/AnimatedInput';
import ScreenContainer from '../components/common/ScreenContainer';
import MedicineCard from '../components/medicine/MedicineCard';
import useStoreData from '../hooks/useStoreData';
import { useAuthStore } from '../store/authStore';
import colors from '../utils/colors';

const { width } = Dimensions.get('window');

export default function MedicineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef(null);

  // Fetch dynamic store data
  const { user } = useAuthStore();
  const { banners, categories, products, loading, refreshing, handleRefresh } = useStoreData();

  useEffect(() => {
    setActiveSlide(0);
    if (flatListRef.current) {
      try {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      } catch (e) {
        console.warn('Error resetting banner scroll:', e);
      }
    }

    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const nextSlide = (prev + 1) % banners.length;
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({ index: nextSlide, animated: true });
          } catch (e) {
            console.warn('Error scrolling banner index:', e);
          }
        }
        return nextSlide;
      });
    }, 4000); // 4 seconds auto slide
    return () => clearInterval(interval);
  }, [banners]);

  // Filter products locally by search query
  const filteredProducts = products.filter(prod => {
    return prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.brand && prod.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prod.uses_benefits && prod.uses_benefits.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const onScroll = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const renderBanner = () => {
    if (banners.length === 0) return null;
    return (
      <View style={styles.bannerContainer}>
        <FlatList
          ref={flatListRef}
          data={banners}
          keyExtractor={item => item.id}
          horizontal
          scrollEnabled={banners.length > 1}
          pagingEnabled
          snapToInterval={width}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {item.title || item.subtitle ? (
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerText}>{item.title || item.subtitle}</Text>
                </View>
              ) : null}
            </View>
          )}
        />
        {banners.length > 1 ? (
          <View style={styles.pagination}>
            {banners.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && styles.activeDot]} />
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  const renderCategories = () => {
    const displayCategories = [
      ...categories,
      { id: 'all', name: 'View All', slug: 'all', icon: 'view-grid-outline', color: '#ECEFF1', icon_color: '#455A64' }
    ];

    return (
      <View style={styles.categoriesWrapper}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.gridContainer}>
          {displayCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/category', params: { categoryKey: cat.slug || cat.key, categoryName: cat.name } })}
            >
              <View style={[styles.iconCircle, { backgroundColor: cat.color || '#F3F4F6' }]}>
                <MaterialCommunityIcons name={cat.icon || 'folder'} size={32} color={cat.icon_color || '#374151'} />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderAdminQuickActions = () => {
    if (!user?.is_admin) return null;
    return (
      <View style={styles.adminPanel}>
        <View style={styles.adminHeader}>
          <MaterialCommunityIcons name="shield-crown-outline" size={20} color={colors.primary} />
          <Text style={styles.adminTitle}>Admin Quick Actions</Text>
        </View>
        <View style={styles.adminButtonsRow}>
          <TouchableOpacity
            style={styles.adminActionButton}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/admin/banners', params: { add: 'true' } })}
          >
            <MaterialCommunityIcons name="image-plus" size={22} color={colors.primary} />
            <Text style={styles.adminButtonText}>Add Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminActionButton}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/admin/categories', params: { add: 'true' } })}
          >
            <MaterialCommunityIcons name="shape-plus" size={22} color={colors.primary} />
            <Text style={styles.adminButtonText}>Add Category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminActionButton}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/admin/products', params: { add: 'true' } })}
          >
            <MaterialCommunityIcons name="pill" size={22} color={colors.primary} />
            <Text style={styles.adminButtonText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchWrapper}>
        <AnimatedInput
          placeholder={t('medicine.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnify"
          rightIcon={searchQuery.length > 0 ? "close-circle" : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />
      </View>

      {renderAdminQuickActions()}
      {renderBanner()}
      {renderCategories()}

      <Text style={[styles.sectionTitle, { marginLeft: 16, marginBottom: 8 }]}>Recommended for you</Text>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading store products...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <MedicineCard
            medicine={item}
            onPress={() => router.push({ pathname: '/product-details', params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={renderHeader}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bannerContainer: {
    marginBottom: 24,
  },
  slide: {
    width: width,
    height: 220,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  bannerImage: {
    width: width,
    height: 220,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 14,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  categoriesWrapper: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  adminPanel: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  adminTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B5E20',
    letterSpacing: 0.3,
  },
  adminButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  adminButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
});

