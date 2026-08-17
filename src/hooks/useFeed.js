import { useState, useEffect, useCallback } from 'react';
import { fetchPosts, fetchPostById, createPost, subscribeToPosts } from '../services/postService';
import { toggleLike, subscribeToLikes } from '../services/likeService';
import { uploadPostImage } from '../services/storageHelper';
import { useAuthStore } from '../store/authStore';
import { getSavedPostIds, toggleSavePost } from '../services/bookmarkService';

/**
 * Custom hook to manage the community feed state, post creation, likes, and realtime synchronization.
 */
export default function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.id;

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [data, savedPostIds] = await Promise.all([
        fetchPosts(userId),
        getSavedPostIds()
      ]);
      setPosts(data.map(post => ({
        ...post,
        isSaved: savedPostIds.includes(post.id)
      })));
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Handle like toggle (optimistic updates)
  const handleLike = useCallback(async (postId) => {
    if (!userId) return;

    // Find current post state
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const originalLiked = post.liked;
    const originalLikesCount = post.likes;

    // 1. Optimistic Update
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = {
      ...post,
      liked: !originalLiked,
      likes: originalLiked ? Math.max(0, originalLikesCount - 1) : originalLikesCount + 1,
    };
    setPosts(updatedPosts);

    try {
      // 2. Database Toggle
      const newLikedState = await toggleLike(postId, userId, originalLiked);
      
      // 3. Rollback if response state differs from what we expected
      if (newLikedState !== !originalLiked) {
        const rollbackPosts = [...posts];
        rollbackPosts[postIndex] = {
          ...post,
          liked: newLikedState,
          likes: newLikedState ? originalLikesCount + 1 : Math.max(0, originalLikesCount - 1),
        };
        setPosts(rollbackPosts);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Rollback to original state on error
      const rollbackPosts = [...posts];
      rollbackPosts[postIndex] = {
        ...post,
        liked: originalLiked,
        likes: originalLikesCount,
      };
      setPosts(rollbackPosts);
    }
  }, [posts, userId]);

  // Handle post creation with image uploads
  const handleCreatePost = useCallback(async (content, imageUri, category, cropTag) => {
    if (!userId) return null;

    try {
      let publicImageUrl = null;
      if (imageUri) {
        publicImageUrl = await uploadPostImage(imageUri, userId);
      }

      const newPost = await createPost(content, publicImageUrl, category, cropTag, userId);
      
      // Fetch the full post with joined user profile and likes/comments counts
      const fullPost = await fetchPostById(newPost.id, userId);
      
      // Prepend the new post directly to the list
      setPosts(prevPosts => [fullPost, ...prevPosts]);
      return fullPost;
    } catch (error) {
      console.error('Failed to create post in useFeed hook:', error);
      throw error;
    }
  }, [userId]);

  // Initial load and subscription cleanup
  useEffect(() => {
    if (!userId) return;

    loadFeed();

    // 1. Subscribe to posts table modifications
    const postsSubscription = subscribeToPosts(async (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT') {
        try {
          const fullPost = await fetchPostById(newRecord.id, userId);
          setPosts(prevPosts => {
            // Avoid duplicate addition if the creator already added it locally
            if (prevPosts.some(p => p.id === fullPost.id)) return prevPosts;
            return [{ ...fullPost, isSaved: false }, ...prevPosts];
          });
        } catch (err) {
          console.error('Failed to fetch realtime inserted post:', err);
        }
      } else if (eventType === 'DELETE') {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== oldRecord.id));
      } else if (eventType === 'UPDATE') {
        try {
          const fullPost = await fetchPostById(newRecord.id, userId);
          setPosts(prevPosts => prevPosts.map(p => p.id === fullPost.id ? { ...fullPost, isSaved: p.isSaved } : p));
        } catch (err) {
          console.error('Failed to fetch realtime updated post:', err);
        }
      }
    });

    // 2. Subscribe to likes table changes to keep like counts refreshed
    const likesSubscription = subscribeToLikes(() => {
      // Refresh the feed in the background to sync counts of other users
      loadFeed();
    });

    return () => {
      postsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
    };
  }, [userId, loadFeed]);

  // Handle post saving
  const handleSave = useCallback(async (postId) => {
    try {
      const updatedSavedIds = await toggleSavePost(postId);
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: updatedSavedIds.includes(post.id)
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to toggle save post in hook:', error);
    }
  }, []);

  // Sync saved status of posts from storage
  const syncSavedStatus = useCallback(async () => {
    try {
      const savedPostIds = await getSavedPostIds();
      setPosts(prevPosts => prevPosts.map(post => ({
        ...post,
        isSaved: savedPostIds.includes(post.id)
      })));
    } catch (error) {
      console.error('Failed to sync saved status:', error);
    }
  }, []);

  return {
    posts,
    loading,
    refreshing,
    handleRefresh: () => loadFeed(true),
    handleLike,
    handleSave,
    syncSavedStatus,
    handleCreatePost,
  };
}
