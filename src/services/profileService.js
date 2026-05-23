import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../utils/dateHelper';

/**
 * Fetches user profile details by ID.
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User details
 */
export const fetchProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile in profileService:', error);
    throw error;
  }
};

/**
 * Fetches posts created by a specific user.
 * 
 * @param {string} userId - User UUID of the author
 * @param {string} currentUserId - Logged in user ID (to check liked status)
 * @returns {Promise<Array>} List of user posts
 */
export const fetchProfilePosts = async (userId, currentUserId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        image_url,
        category,
        crop_tag,
        created_at,
        user_id,
        user:users (
          id,
          name,
          avatar_url,
          is_verified,
          village,
          district,
          state
        ),
        likes (
          user_id
        ),
        comments (
          id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(post => {
      const userLoc = [post.user?.village, post.user?.state].filter(Boolean).join(', ');
      return {
        id: post.id,
        user: {
          id: post.user?.id,
          name: post.user?.name || 'New Farmer',
          avatar: post.user?.avatar_url || 'https://i.pravatar.cc/150',
          isVerified: post.user?.is_verified || false,
        },
        location: userLoc || post.user?.district || 'Unknown Location',
        time: formatRelativeTime(post.created_at),
        text: post.content,
        image: post.image_url,
        likes: post.likes ? post.likes.length : 0,
        comments: post.comments ? post.comments.length : 0,
        shares: 0,
        cropTag: post.crop_tag,
        category: post.category,
        liked: post.likes ? post.likes.some(like => like.user_id === currentUserId) : false,
        created_at: post.created_at,
      };
    });
  } catch (error) {
    console.error('Error fetching profile posts in profileService:', error);
    throw error;
  }
};

/**
 * Updates a user profile.
 * 
 * @param {string} userId - User UUID
 * @param {Object} profileData - Updated fields
 * @returns {Promise<Object>} The updated profile object
 */
export const updateProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: profileData.name,
        avatar_url: profileData.avatar_url,
        village: profileData.village,
        district: profileData.district,
        state: profileData.state,
        farm_type: profileData.farm_type,
        experience_years: profileData.experience_years,
        bio: profileData.bio,
        primary_crops: profileData.primary_crops,
        current_crops: profileData.current_crops,
        medicines_used: profileData.medicines_used,
        email: profileData.email,
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating profile in profileService:', error);
    throw error;
  }
};

/**
 * Fetches farmers (users) matching a query.
 * 
 * @param {string} searchQuery - Search query
 * @returns {Promise<Array>} List of users matching search
 */
export const fetchFarmers = async (searchQuery = '') => {
  try {
    let query = supabase.from('users').select('*');
    
    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,village.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching farmers in profileService:', error);
    throw error;
  }
};
