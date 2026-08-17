import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  uploadProductGallery
} from '../../src/services/productService';
import { fetchCategories } from '../../src/services/categoryService';
import colors from '../../src/utils/colors';

// Admin Products Manager screen

export default function ProductsManager() {
  const { add } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('all');

  // Form State
  const [editingProductId, setEditingProductId] = useState(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('1 Unit');
  const [categoryId, setCategoryId] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [galleryUris, setGalleryUris] = useState([]);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [dosageInformation, setDosageInformation] = useState('');
  const [usesBenefits, setUsesBenefits] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [status, setStatus] = useState(true); // true = Active
  const [featured, setFeatured] = useState(false);
  const [rating, setRating] = useState('5.0');
  const [reviewsCount, setReviewsCount] = useState('0');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts({ search: searchQuery, categoryKey: selectedCategoryKey }),
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load products or categories list');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategoryKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePickMainImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please grant library access to select main image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddGalleryImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please grant library access to select gallery images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUris = result.assets.map(asset => asset.uri);
      setGalleryUris(prev => [...prev, ...newUris]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryUris(prev => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setName('');
    setBrand('');
    setSku('');
    setPrice('');
    setDiscountPrice('');
    setStockQuantity('');
    setQuantityUnit('1 Unit');
    setCategoryId(categories[0]?.id || '');
    setImageUri('');
    setGalleryUris([]);
    setShortDescription('');
    setDescription('');
    setManufacturingDate('');
    setExpiryDate('');
    setPrescriptionRequired(false);
    setDosageInformation('');
    setUsesBenefits('');
    setSideEffects('');
    setIngredients('');
    setStatus(true);
    setFeatured(false);
    setRating('5.0');
    setReviewsCount('0');
    setModalVisible(true);
  };

  useEffect(() => {
    if (!loading && add === 'true') {
      openAddModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, add]);

  const openEditModal = (prod) => {
    setEditingProductId(prod.id);
    setName(prod.name || '');
    setBrand(prod.brand || '');
    setSku(prod.sku || '');
    setPrice(prod.raw_price ? String(prod.raw_price) : '');
    setDiscountPrice(prod.discount_price ? String(prod.discount_price) : '');
    setStockQuantity(prod.stock_quantity ? String(prod.stock_quantity) : '0');
    setQuantityUnit(prod.quantity || '1 Unit');
    setCategoryId(prod.category_id || categories[0]?.id || '');
    setImageUri(prod.image || '');
    setGalleryUris(prod.gallery || []);
    setShortDescription(prod.short_description || '');
    setDescription(prod.description || '');
    setManufacturingDate(prod.manufacturing_date || '');
    setExpiryDate(prod.expiry_date || '');
    setPrescriptionRequired(prod.prescription_required);
    setDosageInformation(prod.dosage_information || '');
    setUsesBenefits(prod.uses_benefits || '');
    setSideEffects(prod.side_effects || '');
    setIngredients(prod.ingredients || '');
    setStatus(prod.status === 'Active');
    setFeatured(prod.featured);
    setRating(prod.rating ? String(prod.rating) : '5.0');
    setReviewsCount(prod.reviews_count ? String(prod.reviews_count) : '0');
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product from inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              setProducts(prev => prev.filter(p => p.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !price) {
      Alert.alert('Error', 'Name, Description, and Price are required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      // 1. Upload main image if local
      let finalMainImageUrl = imageUri;
      if (imageUri.startsWith('file:') || imageUri.startsWith('content:')) {
        finalMainImageUrl = await uploadProductImage(imageUri);
      }

      // 2. Upload gallery images if local
      const localGalleryUris = galleryUris.filter(uri => uri.startsWith('file:') || uri.startsWith('content:'));
      const uploadedGalleryUrls = await uploadProductGallery(localGalleryUris);
      const existingGalleryUrls = galleryUris.filter(uri => uri.startsWith('http'));
      const finalGalleryUrls = [...existingGalleryUrls, ...uploadedGalleryUrls];

      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        sku: sku.trim(),
        price: parseFloat(price),
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        stock_quantity: parseInt(stockQuantity || '0'),
        quantity_unit: quantityUnit,
        category_id: categoryId,
        image_url: finalMainImageUrl,
        gallery: finalGalleryUrls,
        short_description: shortDescription.trim(),
        description: description.trim(),
        manufacturing_date: manufacturingDate || null,
        expiry_date: expiryDate || null,
        prescription_required: prescriptionRequired,
        dosage_information: dosageInformation.trim(),
        uses_benefits: usesBenefits.trim(),
        side_effects: sideEffects.trim(),
        ingredients: ingredients.trim(),
        status: status ? 'Active' : 'Inactive',
        featured,
        rating: parseFloat(rating),
        reviews_count: parseInt(reviewsCount)
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        Alert.alert('Success', 'Product updated successfully.');
      } else {
        await createProduct(payload);
        Alert.alert('Success', 'Product created successfully.');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save product details.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderProductItem = ({ item }) => {
    const isLowStock = item.stock_quantity <= 10;
    return (
      <View style={styles.prodCard}>
        <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1592982537444-d30f40f090b8?w=300' }} style={styles.prodImage} />
        <View style={styles.prodDetails}>
          <Text style={styles.prodName}>{item.name}</Text>
          <Text style={styles.prodSku}>SKU: {item.sku || 'N/A'} | Brand: {item.brand || 'N/A'}</Text>
          
          <View style={styles.badgesRow}>
            <Text style={[styles.stockBadge, isLowStock ? styles.stockLow : styles.stockNormal]}>
              Stock: {item.stock_quantity}
            </Text>
            <Text style={styles.categoryBadge}>{item.category}</Text>
            {item.featured ? <Text style={styles.featuredBadge}>⭐ Featured</Text> : null}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price.split(' ')[0]}</Text>
            <Text style={[styles.statusTag, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
              {item.status}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
              <MaterialCommunityIcons name="pencil" size={18} color="#2563EB" />
              <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Category Filter Section */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name, SKU or brand..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsContainer}>
          <TouchableOpacity 
            style={[styles.categoryChip, selectedCategoryKey === 'all' && styles.categoryChipSelected]}
            onPress={() => setSelectedCategoryKey('all')}
          >
            <Text style={[styles.categoryChipText, selectedCategoryKey === 'all' && styles.categoryChipTextSelected]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.categoryChip, selectedCategoryKey === cat.slug && styles.categoryChipSelected]}
              onPress={() => setSelectedCategoryKey(cat.slug)}
            >
              <Text style={[styles.categoryChipText, selectedCategoryKey === cat.slug && styles.categoryChipTextSelected]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#374151" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="basket-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No products match filters.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Product */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Product</Text>
      </TouchableOpacity>

      {/* Product Editor Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProductId ? 'Edit Product details' : 'Add Product to Inventory'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Product Main Image Picker */}
              <Text style={styles.inputLabel}>Product Main Image</Text>
              <TouchableOpacity style={styles.imageSelector} onPress={handlePickMainImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imageSelectorPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.imageSelectorText}>Upload Product Display Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Product Gallery Picker */}
              <Text style={styles.inputLabel}>Multiple Images Gallery</Text>
              <View style={styles.galleryContainer}>
                {galleryUris.map((uri, idx) => (
                  <View key={idx} style={styles.galleryItem}>
                    <Image source={{ uri }} style={styles.galleryImage} />
                    <TouchableOpacity style={styles.removeGalleryBtn} onPress={() => removeGalleryImage(idx)}>
                      <MaterialCommunityIcons name="close-circle" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addGalleryBtn} onPress={handleAddGalleryImage}>
                  <MaterialCommunityIcons name="plus" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Basic Fields */}
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Urea fertilizer, Mancozeb 75%" value={name} onChangeText={setName} />

              <View style={styles.row}>
                <View style={[styles.col, { marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Brand Name</Text>
                  <TextInput style={styles.input} placeholder="e.g. IFFCO" value={brand} onChangeText={setBrand} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>SKU / Code</Text>
                  <TextInput style={styles.input} placeholder="e.g. FERT-URE-001" value={sku} onChangeText={setSku} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Price (INR) *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="266.00" value={price} onChangeText={setPrice} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Discount Price</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="240.00" value={discountPrice} onChangeText={setDiscountPrice} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Stock Quantity *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="100" value={stockQuantity} onChangeText={setStockQuantity} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Quantity Unit</Text>
                  <TextInput style={styles.input} placeholder="e.g. 45kg Bag, 500g Pack" value={quantityUnit} onChangeText={setQuantityUnit} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Product Category *</Text>
              <View style={styles.selectWrapper}>
                <FlatList
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.catSelectChip,
                        categoryId === item.id && styles.catSelectChipSelected
                      ]}
                      onPress={() => setCategoryId(item.id)}
                    >
                      <Text style={[
                        styles.catSelectChipText,
                        categoryId === item.id && styles.catSelectChipTextSelected
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                />
              </View>

              <Text style={styles.inputLabel}>Short Description</Text>
              <TextInput style={styles.input} placeholder="A brief one-line description of product features." value={shortDescription} onChangeText={setShortDescription} />

              <Text style={styles.inputLabel}>Detailed Description *</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Full description of the product, benefits, properties..." value={description} onChangeText={setDescription} />

              <View style={styles.row}>
                <View style={[styles.col, { marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Manufacturing Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={manufacturingDate} onChangeText={setManufacturingDate} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} />
                </View>
              </View>

              {/* Medical Details */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabelBig}>Prescription Required:</Text>
                <Switch
                  value={prescriptionRequired}
                  onValueChange={setPrescriptionRequired}
                  thumbColor={prescriptionRequired ? colors.primary : '#E5E7EB'}
                  trackColor={{ true: '#A5D6A7', false: '#D1D5DB' }}
                />
              </View>

              <Text style={styles.inputLabel}>Dosage & Usage Information</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Dosage, how to dilute, application instructions..." value={dosageInformation} onChangeText={setDosageInformation} />

              <Text style={styles.inputLabel}>Uses & Key Benefits</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Cures blight, leaf spots, helps vegetative growth..." value={usesBenefits} onChangeText={setUsesBenefits} />

              <Text style={styles.inputLabel}>Side Effects & Precautions</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Avoid contact with eyes, keep away from bees..." value={sideEffects} onChangeText={setSideEffects} />

              <Text style={styles.inputLabel}>Active Ingredients</Text>
              <TextInput style={styles.input} placeholder="e.g. Nitrogen 46%, Mancozeb 75% WP" value={ingredients} onChangeText={setIngredients} />

              {/* Admin settings */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabelBig}>Featured Product:</Text>
                <Switch
                  value={featured}
                  onValueChange={setFeatured}
                  thumbColor={featured ? colors.primary : '#E5E7EB'}
                  trackColor={{ true: '#A5D6A7', false: '#D1D5DB' }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabelBig}>Active Status (Publish):</Text>
                <Switch
                  value={status}
                  onValueChange={setStatus}
                  thumbColor={status ? colors.primary : '#E5E7EB'}
                  trackColor={{ true: '#A5D6A7', false: '#D1D5DB' }}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Default Rating</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="5.0" value={rating} onChangeText={setRating} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Default Reviews Count</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="10" value={reviewsCount} onChangeText={setReviewsCount} />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={submitLoading}>
                {submitLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Product</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryChipsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  prodCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prodImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    resizeMode: 'cover',
  },
  prodDetails: {
    flex: 1,
    marginLeft: 12,
  },
  prodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  prodSku: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockLow: {
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
  },
  stockNormal: {
    backgroundColor: '#E6F4EA',
    color: '#137333',
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
  },
  featuredBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FFF8E1',
    color: '#F57F17',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  statusTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  statusActive: {
    backgroundColor: '#E1F5FE',
    color: '#0288D1',
  },
  statusInactive: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    gap: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  imageSelector: {
    width: '100%',
    height: 160,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageSelectorPlaceholder: {
    alignItems: 'center',
  },
  imageSelectorText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  galleryItem: {
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  removeGalleryBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  addGalleryBtn: {
    width: 68,
    height: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  selectWrapper: {
    marginBottom: 12,
  },
  catSelectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catSelectChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catSelectChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  catSelectChipTextSelected: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  switchLabelBig: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
