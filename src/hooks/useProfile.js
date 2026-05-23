import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, fetchProfilePosts, updateProfile } from '../services/profileService';
import { toggleLike } from '../services/likeService';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to manage profiles and their specific posts.
 * 
 * @param {string} [userId] - The user ID whose profile is being loaded (defaults to the logged-in demo user)
 */
export default function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
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
      const postsData = await fetchProfilePosts(targetUserId, currentUserId);
      setUserPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch user posts in useProfile hook:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [targetUserId, currentUserId]);

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

    const postIndex = userPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = userPosts[postIndex];
    const originalLiked = post.liked;
    const originalLikesCount = post.likes;

    // 1. Optimistic Update
    const updatedPosts = [...userPosts];
    updatedPosts[postIndex] = {
      ...post,
      liked: !originalLiked,
      likes: originalLiked ? Math.max(0, originalLikesCount - 1) : originalLikesCount + 1,
    };
    setUserPosts(updatedPosts);

    try {
      // 2. Database Toggle
      const newLikedState = await toggleLike(postId, currentUserId, originalLiked);
      
      // 3. Rollback if response state differs from what we expected
      if (newLikedState !== !originalLiked) {
        const rollbackPosts = [...userPosts];
        rollbackPosts[postIndex] = {
          ...post,
          liked: newLikedState,
          likes: newLikedState ? originalLikesCount + 1 : Math.max(0, originalLikesCount - 1),
        };
        setUserPosts(rollbackPosts);
      }
    } catch (error) {
      console.error('Failed to toggle like in useProfile:', error);
      // Rollback to original state on error
      const rollbackPosts = [...userPosts];
      rollbackPosts[postIndex] = {
        ...post,
        liked: originalLiked,
        likes: originalLikesCount,
      };
      setUserPosts(rollbackPosts);
    }
  }, [userPosts, currentUserId]);

  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, [targetUserId, loadProfile, loadUserPosts]);

  return {
    profile,
    userPosts,
    loadingProfile,
    loadingPosts,
    handleUpdateProfile,
    handleLike,
    refreshProfile: loadProfile,
    refreshUserPosts: loadUserPosts,
  };
}
