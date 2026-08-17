import { supabase } from '../lib/supabase';
import { MOCK_MEDICINES } from '../constants/data';

// Map mock medicines to full product structures expected by admin panel & medicine screen
let localProducts = MOCK_MEDICINES.map(item => {
  const priceNum = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
  
  let imageUrl = 'https://images.unsplash.com/photo-1592982537444-d30f40f090b8?w=300';
  if (item.id === 'm1') {
    imageUrl = 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400';
  } else if (item.id === 'm2') {
    imageUrl = 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=400';
  } else if (item.id === 'm3') {
    imageUrl = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=400';
  }

  return {
    id: item.id,
    name: item.name,
    brand: 'Generic',
    sku: `MED-${item.id.toUpperCase()}`,
    price: item.price, // Display price string
    raw_price: priceNum,
    discount_price: null,
    stock_quantity: 100,
    quantity: item.quantity,
    category: item.category,
    category_id: item.id === 'm1' ? '1' : item.id === 'm2' ? '3' : '2',
    image: imageUrl,
    gallery: [],
    short_description: item.description.substring(0, 60) + '...',
    description: item.description,
    manufacturing_date: null,
    expiry_date: null,
    prescription_required: false,
    dosage_information: item.howToUse,
    uses_benefits: item.use,
    side_effects: item.warning,
    ingredients: item.safety,
    status: 'Active',
    featured: true,
    rating: 4.5,
    reviews_count: 120,
    created_at: new Date().toISOString()
  };
});

/**
 * Fetches products, supporting filter inputs, with robust mock fallback.
 */
export const fetchProducts = async (filters = {}) => {
  const { search, categoryKey } = filters;
  try {
    let query = supabase.from('marketplace_products').select('*');

    if (categoryKey && categoryKey !== 'all') {
      query = query.eq('category', categoryKey);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase marketplace_products table failed, falling back to mock filtering:', error.message);
      return getFilteredMockProducts(search, categoryKey);
    }
    
    // Map database properties to camelCase or frontend-expected properties if they differ
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand || 'Generic',
      sku: p.sku || `SKU-${p.id.substring(0, 5)}`,
      price: `₹${p.price_in_inr} / ${p.quantity_unit}`,
      raw_price: p.price_in_inr,
      discount_price: p.discount_price,
      stock_quantity: p.stock_quantity || 0,
      quantity: p.quantity_unit,
      category: p.category,
      category_id: p.category_id,
      image: p.image_url,
      gallery: p.gallery || [],
      short_description: p.short_description || p.description,
      description: p.description,
      manufacturing_date: p.manufacturing_date,
      expiry_date: p.expiry_date,
      prescription_required: p.prescription_required || false,
      dosage_information: p.dosage_information || p.how_to_use || '',
      uses_benefits: p.uses_benefits || p.use_case || '',
      side_effects: p.side_effects || p.warning_text || '',
      ingredients: p.ingredients || p.safety_text || '',
      status: p.status || 'Active',
      featured: p.featured || false,
      rating: p.rating || 5.0,
      reviews_count: p.reviews_count || 0
    }));
  } catch (err) {
    console.warn('Error fetching products, falling back to mock filtering:', err);
    return getFilteredMockProducts(search, categoryKey);
  }
};

const getFilteredMockProducts = (search, categoryKey) => {
  let result = [...localProducts];
  
  if (categoryKey && categoryKey !== 'all') {
    result = result.filter(p => p.category?.toLowerCase() === categoryKey.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  return result;
};

/**
 * Creates a new product.
 */
export const createProduct = async (payload) => {
  try {
    const dbPayload = {
      name: payload.name,
      brand: payload.brand,
      sku: payload.sku,
      price_in_inr: payload.price,
      discount_price: payload.discount_price,
      stock_quantity: payload.stock_quantity,
      quantity_unit: payload.quantity_unit,
      category: payload.category_id, // category key/slug or id
      image_url: payload.image_url,
      gallery: payload.gallery,
      short_description: payload.short_description,
      description: payload.description,
      manufacturing_date: payload.manufacturing_date,
      expiry_date: payload.expiry_date,
      prescription_required: payload.prescription_required,
      dosage_information: payload.dosage_information,
      uses_benefits: payload.uses_benefits,
      side_effects: payload.side_effects,
      ingredients: payload.ingredients,
      status: payload.status,
      featured: payload.featured,
      rating: payload.rating,
      reviews_count: payload.reviews_count
    };

    const { data, error } = await supabase
      .from('marketplace_products')
      .insert([dbPayload])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn('Error creating product, falling back to in-memory cache:', err);
    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      ...payload,
      image: payload.image_url,
      quantity: payload.quantity_unit,
      price: `₹${payload.price} / ${payload.quantity_unit}`,
      raw_price: payload.price,
      created_at: new Date().toISOString()
    };
    localProducts.unshift(newProduct);
    return newProduct;
  }
};

/**
 * Updates a product.
 */
export const updateProduct = async (id, payload) => {
  try {
    const dbPayload = {
      name: payload.name,
      brand: payload.brand,
      sku: payload.sku,
      price_in_inr: payload.price,
      discount_price: payload.discount_price,
      stock_quantity: payload.stock_quantity,
      quantity_unit: payload.quantity_unit,
      category: payload.category_id,
      image_url: payload.image_url,
      gallery: payload.gallery,
      short_description: payload.short_description,
      description: payload.description,
      manufacturing_date: payload.manufacturing_date,
      expiry_date: payload.expiry_date,
      prescription_required: payload.prescription_required,
      dosage_information: payload.dosage_information,
      uses_benefits: payload.uses_benefits,
      side_effects: payload.side_effects,
      ingredients: payload.ingredients,
      status: payload.status,
      featured: payload.featured,
      rating: payload.rating,
      reviews_count: payload.reviews_count
    };

    const { data, error } = await supabase
      .from('marketplace_products')
      .update(dbPayload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn(`Error updating product ${id}, falling back to in-memory cache:`, err);
    localProducts = localProducts.map(p => p.id === id ? { 
      ...p, 
      ...payload, 
      image: payload.image_url, 
      quantity: payload.quantity_unit,
      price: `₹${payload.price} / ${payload.quantity_unit}`,
      raw_price: payload.price
    } : p);
    return { id, ...payload };
  }
};

/**
 * Deletes a product.
 */
export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('marketplace_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`Error deleting product ${id}, falling back to in-memory cache:`, err);
    localProducts = localProducts.filter(p => p.id !== id);
    return true;
  }
};

/**
 * Uploads a main product image.
 */
export const uploadProductImage = async (uri) => {
  try {
    if (!uri.startsWith('file:') && !uri.startsWith('content:')) {
      return uri;
    }
    const filename = `product_${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type: 'image/jpeg',
    });

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(`products/${filename}`, formData, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Product image upload failed, returning uri:', err);
    return uri;
  }
};

/**
 * Uploads gallery images.
 */
export const uploadProductGallery = async (uris) => {
  try {
    const uploadPromises = uris.map(async (uri) => {
      return await uploadProductImage(uri);
    });
    return await Promise.all(uploadPromises);
  } catch (err) {
    console.warn('Gallery upload failed, returning original uris:', err);
    return uris;
  }
};

/**
 * Fetches dashboard statistics.
 */
export const fetchDashboardStats = async () => {
  try {
    // Attempt queries, fallback to in-memory count on failure
    const [prodRes, catRes, banRes] = await Promise.all([
      supabase.from('marketplace_products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('banners').select('id', { count: 'exact', head: true })
    ]);

    const totalProducts = prodRes.error ? localProducts.length : (prodRes.count || 0);
    const totalCategories = catRes.error ? 8 : (catRes.count || 0); // 8 default presets
    const totalBanners = banRes.error ? 3 : (banRes.count || 0); // 3 defaults

    return {
      totalProducts,
      totalCategories,
      totalBanners
    };
  } catch (err) {
    console.warn('Error fetching stats, returning fallback counts:', err);
    return {
      totalProducts: localProducts.length,
      totalCategories: 8,
      totalBanners: 3
    };
  }
};
