import { supabase } from '../lib/supabase';
import BANNERS from '../data/banners';

// Local cache for in-memory fallbacks when DB tables are not created
let localBanners = BANNERS.map(item => ({
  id: item.id,
  image_url: item.image,
  title: item.text,
  subtitle: '',
  button_text: 'Shop Now',
  button_link: '/category?categoryKey=all',
  status: 'Active',
  show_banner: true,
  created_at: new Date().toISOString()
}));

/**
 * Fetches all banners, falling back to local mock data on failure.
 */
export const fetchBanners = async () => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Check for 404/relation not found error code or similar
      console.warn('Supabase banners table failed, falling back to mock data:', error.message);
      return localBanners;
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching banners, falling back to mock data:', err);
    return localBanners;
  }
};

/**
 * Creates a new banner record.
 */
export const createBanner = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .insert([payload])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn('Error creating banner, falling back to in-memory cache:', err);
    const newBanner = {
      id: Math.random().toString(36).substr(2, 9),
      ...payload,
      created_at: new Date().toISOString()
    };
    localBanners.unshift(newBanner);
    return newBanner;
  }
};

/**
 * Updates an existing banner.
 */
export const updateBanner = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn(`Error updating banner ${id}, falling back to in-memory cache:`, err);
    localBanners = localBanners.map(b => b.id === id ? { ...b, ...payload } : b);
    return { id, ...payload };
  }
};

/**
 * Deletes a banner.
 */
export const deleteBanner = async (id) => {
  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`Error deleting banner ${id}, falling back to in-memory cache:`, err);
    localBanners = localBanners.filter(b => b.id !== id);
    return true;
  }
};

/**
 * Uploads a banner image to Supabase Storage.
 */
export const uploadBannerImage = async (uri) => {
  try {
    // If not a local file, return as-is
    if (!uri.startsWith('file:') && !uri.startsWith('content:')) {
      return uri;
    }

    const filename = `banner_${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type: 'image/jpeg',
    });

    // We can upload to public 'avatars' or 'posts' bucket if banners bucket isn't set up
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(`banners/${filename}`, formData, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('posts')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Image upload failed, returning local uri:', err);
    return uri;
  }
};
