import { supabase } from '../lib/supabase';
import STORE_CATEGORIES from '../data/categories';

// Local cache for categories with mapped property names
let localCategories = STORE_CATEGORIES.map(item => ({
  id: item.id,
  name: item.name,
  slug: item.key,
  icon: item.icon,
  color: item.color,
  icon_color: item.iconColor || '#374151',
  status: 'Active',
  description: '',
  created_at: new Date().toISOString()
}));

/**
 * Fetches all categories, falling back to local mock data on failure.
 */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase categories table failed, falling back to mock data:', error.message);
      return localCategories;
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching categories, falling back to mock data:', err);
    return localCategories;
  }
};

/**
 * Creates a new category.
 */
export const createCategory = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn('Error creating category, falling back to in-memory cache:', err);
    const newCategory = {
      id: Math.random().toString(36).substr(2, 9),
      slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...payload,
      created_at: new Date().toISOString()
    };
    localCategories.push(newCategory);
    return newCategory;
  }
};

/**
 * Updates an existing category.
 */
export const updateCategory = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn(`Error updating category ${id}, falling back to in-memory cache:`, err);
    localCategories = localCategories.map(c => c.id === id ? { ...c, ...payload } : c);
    return { id, ...payload };
  }
};

/**
 * Deletes a category.
 */
export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`Error deleting category ${id}, falling back to in-memory cache:`, err);
    localCategories = localCategories.filter(c => c.id !== id);
    return true;
  }
};
