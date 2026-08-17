import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '../components/common/ScreenContainer';
import MedicineCard from '../components/medicine/MedicineCard';
import { MOCK_MEDICINES } from '../constants/data';
import colors from '../utils/colors';

export default function CategoryProductsScreen() {
  const router = useRouter();
  const { categoryKey, categoryName } = useLocalSearchParams();

  // Filter products by category key
  const filteredProducts = MOCK_MEDICINES.filter(med => {
    if (categoryKey === 'all') return true;
    return med.category?.toLowerCase() === categoryKey?.toLowerCase();
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{categoryName || 'Products'}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="basket-off-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>We currently don&apos;t have products in this category.</Text>
    </View>
  );

  return (
    <ScreenContainer>
      {renderHeader()}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <MedicineCard medicine={item} onPress={() => router.push({ pathname: '/product-details', params: { id: item.id } })} />
        )}
        contentContainerStyle={[styles.listContent, filteredProducts.length === 0 && styles.emptyListContent]}
        columnWrapperStyle={filteredProducts.length > 0 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyListContent: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
