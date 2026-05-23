import { useState, useEffect, useCallback } from 'react';
import { fetchComments, createComment, subscribeToComments } from '../services/commentService';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to manage comments for a specific post.
 * Handles fetching comments, adding comments, and listening to real-time additions.
 * 
 * @param {string} postId - The post ID
 */
export default function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const userId = user?.id;

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments in useComments hook:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const handleAddComment = useCallback(async (content) => {
    if (!postId || !userId || !content.trim()) return null;
    try {
      const newComment = await createComment(postId, content, userId);
      return newComment;
    } catch (error) {
      console.error('Failed to add comment in useComments hook:', error);
      throw error;
    }
  }, [postId, userId]);

  useEffect(() => {
    if (!postId) return;

    loadComments();

    // Subscribe to new comments on this post
    const subscription = subscribeToComments(postId, (payload) => {
      if (payload.event === 'INSERT') {
        setComments(prevComments => {
          // Avoid duplicate comments
          if (prevComments.some(c => c.id === payload.comment.id)) {
            return prevComments;
          }
          return [...prevComments, payload.comment];
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [postId, loadComments]);

  return {
    comments,
    loading,
    handleAddComment,
    refreshComments: loadComments,
  };
}
