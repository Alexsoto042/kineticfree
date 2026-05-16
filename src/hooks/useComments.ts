import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { PostComment } from '../types';

export function useComments(postId: number) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments for a post
  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all comments for this post with user profile data
      const { data, error: fetchError } = await supabase
        .from('post_comments')
        .select(`
          *,
          user_profile:profiles!user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Organize comments into a tree structure (parent comments with nested replies)
      const commentMap = new Map<number, PostComment>();
      const rootComments: PostComment[] = [];

      // First pass: create all comment objects
      data?.forEach((comment) => {
        const commentObj: PostComment = {
          ...comment,
          user_profile: Array.isArray(comment.user_profile)
            ? comment.user_profile[0]
            : comment.user_profile,
          replies: [],
        };
        commentMap.set(comment.id, commentObj);
      });

      // Second pass: organize into tree structure
      data?.forEach((comment) => {
        const commentObj = commentMap.get(comment.id)!;
        if (comment.parent_comment_id) {
          // This is a reply, add it to parent's replies
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentObj);
          }
        } else {
          // This is a root comment
          rootComments.push(commentObj);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add a new comment
  const addComment = async (commentText: string, parentCommentId?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error: insertError } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          comment_text: commentText,
          parent_comment_id: parentCommentId || null,
        })
        .select(`
          *,
          user_profile:profiles!user_id (
            username,
            avatar_url
          )
        `)
        .single();

      if (insertError) throw insertError;

      // Refresh comments to get updated tree
      await fetchComments();

      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (deleteError) throw deleteError;

      // Refresh comments
      await fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    refreshComments: fetchComments,
  };
}
