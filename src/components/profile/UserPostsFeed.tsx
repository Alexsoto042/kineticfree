import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import PostCard from '../motivation/PostCard';
import { EmptyState } from '../ui/EmptyState';
import LoadingOverlay from '../ui/LoadingOverlay';
import type { MotivationalPost } from '../../types';
import { Users } from 'lucide-react';
import './UserPostsFeed.css';

interface UserPostsFeedProps {
  userId: string;
  maxPosts?: number;
  showCreateButton?: boolean;
}

const UserPostsFeed: React.FC<UserPostsFeedProps> = ({ 
  userId, 
  maxPosts = 20,
  showCreateButton = false 
}) => {
  const { session } = useAuth();
  const [posts, setPosts] = useState<MotivationalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<number | null>(null);

  const fetchUserPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('motivational_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(maxPosts);

      if (fetchError) throw fetchError;
      
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Error al cargar las publicaciones.');
    } finally {
      setLoading(false);
    }
  }, [userId, maxPosts]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handleDelete = async (postId: number) => {
    if (!session?.user?.id) {
      alert('Debes iniciar sesión para eliminar publicaciones.');
      return;
    }

    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;

    const isOwner = postToDelete.user_id === session.user.id;

    if (!isOwner) {
      alert('No tienes permiso para eliminar esta publicación.');
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        const { error } = await supabase
          .from('motivational_posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', session.user.id);

        if (error) throw error;

        // Delete media from storage if exists
        if (postToDelete.media_url && postToDelete.user_id === session.user.id) {
          const publicUrlPrefix = supabase.storage.from('motivational_posts').getPublicUrl('').data.publicUrl;
          if (postToDelete.media_url.startsWith(publicUrlPrefix)) {
            const filePathInBucket = postToDelete.media_url.substring(publicUrlPrefix.length + 1);
            const { error: storageError } = await supabase.storage
              .from('motivational_posts')
              .remove([filePathInBucket]);

            if (storageError) {
              console.warn('Error deleting media from storage:', storageError.message);
            }
          }
        }
        
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } catch (error: any) {
        console.error('Error deleting post:', error.message);
        alert('Error al eliminar la publicación: ' + error.message);
      }
    }
  };

  const handleLike = async (postId: number) => {
    if (!session?.user?.id) {
      alert('Debes iniciar sesión para dar "Me gusta".');
      return;
    }

    const currentUserId = session.user.id;
    let originalPostState: MotivationalPost | undefined;

    // Optimistic UI update
    setPosts(prevPosts => {
      originalPostState = prevPosts.find(p => p.id === postId);
      return prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.liked_by.includes(currentUserId);
          const newLikedBy = isLiked
            ? post.liked_by.filter(id => id !== currentUserId)
            : [...post.liked_by, currentUserId];
          return { ...post, liked_by: newLikedBy, likes: newLikedBy.length };
        }
        return post;
      });
    });

    try {
      const { error } = await supabase.rpc('toggle_like', {
        p_post_id: postId,
        p_user_id: currentUserId,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating like:', error.message);
      // Revert on error
      if (originalPostState) {
        setPosts(prevPosts =>
          prevPosts.map(p => (p.id === postId ? originalPostState! : p))
        );
      }
      alert('Error al actualizar el "Me gusta". Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Cargando publicaciones..." />;
  }

  if (error) {
    return (
      <div className="user-posts-feed-error">
        <p>{error}</p>
        <button onClick={fetchUserPosts} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Users size={64} />}
        title="Sin publicaciones"
        description="Este usuario aún no ha compartido ninguna publicación."
      />
    );
  }

  return (
    <div className="user-posts-feed">
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="user-post-item" data-media-id={post.id}>
            <PostCard
              post={post}
              onDelete={handleDelete}
              onLike={handleLike}
              isPlaying={post.id === activeMediaId && post.type === 'video'}
              isLiking={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPostsFeed;
