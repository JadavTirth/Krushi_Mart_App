import { useState, useEffect, useCallback } from 'react';
import { fetchBanners } from '../services/bannerService';
import { fetchCategories } from '../services/categoryService';
import { fetchProducts } from '../services/productService';

export default function useStoreData() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStoreData = useCallback(async () => {
    try {
      const [bannersData, categoriesData, productsData] = await Promise.all([
        fetchBanners(),
        fetchCategories(),
        fetchProducts()
      ]);
      
      // Filter out 'all' category from display in the shop grid if present in table
      const filteredCategories = (categoriesData || []).filter(
        (cat) => cat.slug !== 'all' && cat.key !== 'all'
      );

      setBanners(bannersData || []);
      setCategories(filteredCategories || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading store data inside useStoreData hook:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadStoreData().finally(() => setLoading(false));
  }, [loadStoreData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadStoreData();
    } finally {
      setRefreshing(false);
    }
  }, [loadStoreData]);

  return {
    banners,
    categories,
    products,
    loading,
    refreshing,
    handleRefresh,
  };
}
