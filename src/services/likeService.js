import { supabase } from '../lib/supabase';

/**
 * Toggles a like for a post by inserting or deleting a record in the public.likes table.
 * 
 * @param {string} postId - The post ID
 * @param {string} userId - The user ID performing the like
 * @param {boolean} isCurrentlyLiked - True if the post is already liked by the user
 * @returns {Promise<boolean>} The new liked state (true if liked, false if unliked)
 */
export const toggleLike = async (postId, userId, isCurrentlyLiked) => {
  try {
    if (isCurrentlyLiked) {
      // Unlike: Remove the row from the database
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return false;
    } else {
      // Like: Insert a row in the database
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) {
        // Handle unique constraint conflict (e.g. race condition/double tap) gracefully
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }
      return true;
    }
  } catch (error) {
    console.error('Error toggling like in likeService:', error);
    throw error;
  }
};

/**
 * Subscribes to real-time events on the public.likes table.
 * 
 * @param {function} callback - Callback invoked when a like is added or removed
 * @returns {RealtimeChannel} The Supabase realtime channel subscription
 */
export const subscribeToLikes = (callback) => {
  return supabase
    .channel('public:likes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'likes' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
};
