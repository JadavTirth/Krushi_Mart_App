import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../utils/dateHelper';

/**
 * Maps Supabase raw post joins into the format expected by the frontend PostCard component.
 */
const mapPostData = (post, currentUserId) => {
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
};

/**
 * Fetches all posts from the public.posts table, joined with author profiles, likes, and comments.
 * 
 * @param {string} currentUserId - Used to determine if the post is liked by the current user
 * @returns {Promise<Array>} List of formatted posts
 */
export const fetchPosts = async (currentUserId) => {
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(post => mapPostData(post, currentUserId));
  } catch (error) {
    console.error('Error fetching posts in postService:', error);
    throw error;
  }
};

/**
 * Fetches a single post by its ID with all joins.
 * 
 * @param {string} postId - The post ID
 * @param {string} currentUserId - The current user ID
 * @returns {Promise<Object>} Formatted post object
 */
export const fetchPostById = async (postId, currentUserId) => {
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
      .eq('id', postId)
      .single();

    if (error) throw error;
    return mapPostData(data, currentUserId);
  } catch (error) {
    console.error(`Error fetching post by id ${postId}:`, error);
    throw error;
  }
};

/**
 * Inserts a new post record into the public.posts table.
 * 
 * @param {string} content - Post text content
 * @param {string} imageUrl - Uploaded post image URL (public bucket URL)
 * @param {string} category - Post category ('crop', 'pest', 'tip', 'weather', 'market')
 * @param {string} cropTag - Crop tags (e.g. 'Wheat', 'Cotton')
 * @param {string} userId - User ID of the post creator
 * @returns {Promise<Object>} The inserted post
 */
export const createPost = async (content, imageUrl, category, cropTag, userId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content,
          image_url: imageUrl || null,
          category: category || 'crop',
          crop_tag: cropTag || null,
          user_id: userId,
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating post in postService:', error);
    throw error;
  }
};

/**
 * Subscribes to real-time events on the public.posts table.
 * 
 * @param {function} callback - Callback invoked when a real-time event occurs
 * @returns {RealtimeChannel} The Supabase realtime channel subscription
 */
export const subscribeToPosts = (callback) => {
  return supabase
    .channel('public:posts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
};
