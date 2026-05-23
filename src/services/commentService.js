import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../utils/dateHelper';

/**
 * Fetches all comments for a specific post.
 * 
 * @param {string} postId - The post ID
 * @returns {Promise<Array>} List of formatted comments
 */
export const fetchComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        post_id,
        user_id,
        user:users (
          id,
          name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true }); // Oldest comments first

    if (error) throw error;

    return (data || []).map(comment => ({
      id: comment.id,
      user: {
        id: comment.user?.id,
        name: comment.user?.name || 'Anonymous Farmer',
        avatar: comment.user?.avatar_url || 'https://i.pravatar.cc/150',
      },
      time: formatRelativeTime(comment.created_at),
      text: comment.content,
      likes: 0,
      replies: [],
    }));
  } catch (error) {
    console.error('Error fetching comments in commentService:', error);
    throw error;
  }
};

/**
 * Creates a new comment on a post.
 * 
 * @param {string} postId - The post ID
 * @param {string} content - Comment text
 * @param {string} userId - ID of the commenter
 * @returns {Promise<Object>} The inserted comment
 */
export const createComment = async (postId, content, userId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content,
          user_id: userId,
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating comment in commentService:', error);
    throw error;
  }
};

/**
 * Subscribes to new comments on a specific post.
 * Resolves user profile detail for the new comment dynamically.
 * 
 * @param {string} postId - The post ID to subscribe to
 * @param {function} callback - Callback function that receives new comment actions
 * @returns {RealtimeChannel} The Supabase realtime channel subscription
 */
export const subscribeToComments = (postId, callback) => {
  return supabase
    .channel(`comments:${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      async (payload) => {
        try {
          // Resolve commenter profile info
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const comment = {
            id: payload.new.id,
            user: {
              id: userData?.id || payload.new.user_id,
              name: userData?.name || 'Anonymous Farmer',
              avatar: userData?.avatar_url || 'https://i.pravatar.cc/150',
            },
            time: formatRelativeTime(payload.new.created_at),
            text: payload.new.content,
            likes: 0,
            replies: [],
          };
          
          callback({ event: 'INSERT', comment });
        } catch (err) {
          console.error('Error resolving commenter profile in real-time callback:', err);
          callback({
            event: 'INSERT',
            comment: {
              id: payload.new.id,
              user: { name: 'New Farmer', avatar: 'https://i.pravatar.cc/150' },
              time: 'just now',
              text: payload.new.content,
              likes: 0,
              replies: [],
            }
          });
        }
      }
    )
    .subscribe();
};
