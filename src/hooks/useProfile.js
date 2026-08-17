import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, fetchProfilePosts, updateProfile } from '../services/profileService';
import { toggleLike } from '../services/likeService';
import { useAuthStore } from '../store/authStore';
import { fetchPosts } from '../services/postService';
import { getSavedPostIds, toggleSavePost } from '../services/bookmarkService';

/**
 * Custom hook to manage profiles and their specific posts.
 * 
 * @param {string} [userId] - The user ID whose profile is being loaded (defaults to the logged-in demo user)
 */
export default function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSavedPosts, setLoadingSavedPosts] = useState(false);
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.id;
  
  // If no userId is provided, target the currently logged-in demo user
  const targetUserId = userId || currentUserId;

  const loadProfile = useCallback(async () => {
    if (!targetUserId) return;
    setLoadingProfile(true);
    try {
      const data = await fetchProfile(targetUserId);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile in useProfile hook:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [targetUserId]);

  const loadUserPosts = useCallback(async () => {
    if (!targetUserId || !currentUserId) return;
    setLoadingPosts(true);
    try {
      const [postsData, ids] = await Promise.all([
        fetchProfilePosts(targetUserId, currentUserId),
        getSavedPostIds()
      ]);
      setUserPosts(postsData.map(post => ({
        ...post,
        isSaved: ids.includes(post.id)
      })));
    } catch (error) {
      console.error('Failed to fetch user posts in useProfile hook:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [targetUserId, currentUserId]);

  const loadSavedPosts = useCallback(async () => {
    if (!currentUserId) return;
    setLoadingSavedPosts(true);
    try {
      const ids = await getSavedPostIds();
      if (ids.length === 0) {
        setSavedPosts([]);
      } else {
        const allPosts = await fetchPosts(currentUserId);
        const filtered = allPosts
          .filter(p => ids.includes(p.id))
          .map(p => ({ ...p, isSaved: true }));
        setSavedPosts(filtered);
      }
    } catch (error) {
      console.error('Failed to load saved posts in hook:', error);
    } finally {
      setLoadingSavedPosts(false);
    }
  }, [currentUserId]);

  const handleUpdateProfile = useCallback(async (updatedData) => {
    if (!targetUserId) return null;
    try {
      const result = await updateProfile(targetUserId, updatedData);
      setProfile(result);
      return result;
    } catch (error) {
      console.error('Failed to update profile in useProfile hook:', error);
      throw error;
    }
  }, [targetUserId]);

  const handleLike = useCallback(async (postId) => {
    if (!currentUserId) return;

    // Like can be triggered from userPosts or savedPosts
    const isFromUserPosts = userPosts.some(p => p.id === postId);
    const targetPosts = isFromUserPosts ? userPosts : savedPosts;
    const postIndex = targetPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = targetPosts[postIndex];
    const originalLiked = post.liked;
    const originalLikesCount = post.likes;

    // 1. Optimistic Update
    const updatedState = {
      ...post,
      liked: !originalLiked,
      likes: originalLiked ? Math.max(0, originalLikesCount - 1) : originalLikesCount + 1,
    };

    if (isFromUserPosts) {
      const nextUserPosts = [...userPosts];
      nextUserPosts[postIndex] = updatedState;
      setUserPosts(nextUserPosts);
    } else {
      const nextSavedPosts = [...savedPosts];
      nextSavedPosts[postIndex] = updatedState;
      setSavedPosts(nextSavedPosts);
    }

    try {
      // 2. Database Toggle
      const newLikedState = await toggleLike(postId, currentUserId, originalLiked);
      
      // 3. Rollback if response state differs from what we expected
      if (newLikedState !== !originalLiked) {
        const rollbackState = {
          ...post,
          liked: newLikedState,
          likes: newLikedState ? originalLikesCount + 1 : Math.max(0, originalLikesCount - 1),
        };
        if (isFromUserPosts) {
          setUserPosts(prev => prev.map(p => p.id === postId ? rollbackState : p));
        } else {
          setSavedPosts(prev => prev.map(p => p.id === postId ? rollbackState : p));
        }
      }
    } catch (error) {
      console.error('Failed to toggle like in useProfile:', error);
      // Rollback to original state on error
      const rollbackState = {
        ...post,
        liked: originalLiked,
        likes: originalLikesCount,
      };
      if (isFromUserPosts) {
        setUserPosts(prev => prev.map(p => p.id === postId ? rollbackState : p));
      } else {
        setSavedPosts(prev => prev.map(p => p.id === postId ? rollbackState : p));
      }
    }
  }, [userPosts, savedPosts, currentUserId]);

  const handleSave = useCallback(async (postId) => {
    try {
      const updatedSavedIds = await toggleSavePost(postId);
      
      // Update savedPosts list (either filter out if unsaved, or keep updated)
      setSavedPosts(prevSaved => {
        if (!updatedSavedIds.includes(postId)) {
          return prevSaved.filter(p => p.id !== postId);
        }
        return prevSaved.map(p => p.id === postId ? { ...p, isSaved: true } : p);
      });

      // Also update isSaved flag on userPosts if it exists there
      setUserPosts(prevUser => prevUser.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: updatedSavedIds.includes(post.id)
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to toggle save post in profile hook:', error);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadUserPosts();
    loadSavedPosts();
  }, [targetUserId, loadProfile, loadUserPosts, loadSavedPosts]);

  return {
    profile,
    userPosts,
    savedPosts,
    loadingProfile,
    loadingPosts,
    loadingSavedPosts,
    handleUpdateProfile,
    handleLike,
    handleSave,
    refreshProfile: loadProfile,
    refreshUserPosts: loadUserPosts,
    refreshSavedPosts: loadSavedPosts,
  };
}
