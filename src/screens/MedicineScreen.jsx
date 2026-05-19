import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AnimatedInput from '../components/common/AnimatedInput';
import ScreenContainer from '../components/common/ScreenContainer';
import MedicineCard from '../components/medicine/MedicineCard';
import MedicineModal from '../components/medicine/MedicineModal';
import { MOCK_MEDICINES } from '../constants/data';
import BANNERS from '../data/banners';
import STORE_CATEGORIES from '../data/categories';
import colors from '../utils/colors';

const { width } = Dimensions.get('window');

export default function MedicineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const nextSlide = (prev + 1) % BANNERS.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: nextSlide, animated: true });
        }
        return nextSlide;
      });
    }, 4000); // 4 seconds auto slide
    return () => clearInterval(interval);
  }, []);

  // Filter medicines by search query
  const filteredMedicines = MOCK_MEDICINES.filter(med => {
    return med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           med.disease.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const onScroll = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        snapToInterval={width}
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerText}>{item.text}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.pagination}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeSlide && styles.activeDot]} />
        ))}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesWrapper}>
      <Text style={styles.sectionTitle}>Shop by Category</Text>
      <View style={styles.gridContainer}>
        {STORE_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/category', params: { categoryKey: cat.key, categoryName: cat.name } })}
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
              <MaterialCommunityIcons name={cat.icon} size={32} color={cat.iconColor} />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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

      {renderBanner()}
      {renderCategories()}

      <Text style={[styles.sectionTitle, { marginLeft: 16, marginBottom: 8 }]}>Recommended for you</Text>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={filteredMedicines}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <MedicineCard
            medicine={item}
            onPress={() => setSelectedMedicine(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />

      <MedicineModal
        visible={selectedMedicine !== null}
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
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
    width: width, // Full width
    height: 220,
    marginHorizontal: 0,
    borderRadius: 0, // removed border radius to make it stretch edge-to-edge
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
    paddingHorizontal: 16, // added horizontal padding for text readability
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
});
