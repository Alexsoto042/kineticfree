import React, { useRef, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import PostCreatorCard from '../components/motivation/PostCreatorCard';
import PostCard from '../components/motivation/PostCard';
import type { MotivationalPost } from '../types';
import './MotivationWall.css';

export default function MotivationWall() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<MotivationalPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);

  const [activeMediaId, setActiveMediaId] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('motivational_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching motivational posts:', error.message);
      setErrorPosts('Error al cargar publicaciones motivacionales.');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = () => {
    fetchPosts(); // Re-fetch posts after a new one is created
  };

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    if (posts.length === 0) return;

    // Use a slight delay to ensure elements are rendered before observing
    const timer = setTimeout(() => {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const mediaId = parseInt((entry.target as HTMLElement).dataset.mediaId || '0', 10);
              if (mediaId) {
                setActiveMediaId(mediaId);
              }
            } else {
              // Pause video if not intersecting
              const videoElement = entry.target.querySelector('video');
              if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0; // Reset video to start
              }
            }
          });
        },
        { threshold: 0.7 }
      );

      const elements = document.querySelectorAll('.motivation-feed-item');
      elements.forEach((el) => observer.current?.observe(el));

      if (posts.length > 0 && !activeMediaId) {
        setActiveMediaId(posts[0].id);
      }
    }, 100); // 100ms delay

    return () => {
      clearTimeout(timer);
      observer.current?.disconnect();
    };
  }, [posts, activeMediaId]);

  const handleDelete = async (postId: number) => {
    if (!session?.user?.id) {
      alert('Debes iniciar sesión para eliminar publicaciones.');
      return;
    }

    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;

    const isOwner = postToDelete.user_id === session.user.id;
    const isSystemPost = postToDelete.user_id === null;

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
          .eq('user_id', session.user.id); // Ensure user can only delete their own posts

        if (error) throw error;

        // If media_url is a Supabase Storage public URL, attempt to delete the file
        if (postToDelete.media_url && postToDelete.user_id === session.user.id) {
          // Extract the path within the bucket from the public URL
          // Assumes the public URL structure is fixed: .../public/BUCKET_NAME/path/to/file
          const publicUrlPrefix = supabase.storage.from('motivational_posts').getPublicUrl('').data.publicUrl;
          if (postToDelete.media_url.startsWith(publicUrlPrefix)) {
            const filePathInBucket = postToDelete.media_url.substring(publicUrlPrefix.length + 1); // +1 for the leading '/'
            const { error: storageError } = await supabase.storage
              .from('motivational_posts')
              .remove([filePathInBucket]);

            if (storageError) {
              console.warn('Error deleting media from storage:', storageError.message);
            }
          } else {
            console.warn('Media URL is not a Supabase Storage URL, skipping storage deletion.');
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

    const userId = session.user.id;
    let originalPostState: MotivationalPost | undefined;

    setLikingPostId(postId);

    // Optimistic UI update
    setPosts(prevPosts => {
      originalPostState = prevPosts.find(p => p.id === postId);
      return prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.liked_by.includes(userId);
          const newLikedBy = isLiked
            ? post.liked_by.filter(id => id !== userId)
            : [...post.liked_by, userId];
          return { ...post, liked_by: newLikedBy, likes: newLikedBy.length };
        }
        return post;
      });
    });

    try {
      // Call the RPC function in Supabase
      const { error } = await supabase.rpc('toggle_like', {
        p_post_id: postId,
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Error updating like:', error.message);
      // Revert local state if Supabase update fails
      if (originalPostState) {
        setPosts(prevPosts =>
          prevPosts.map(p => (p.id === postId ? originalPostState! : p))
        );
      }
      alert('Error al actualizar el "Me gusta". Por favor, inténtalo de nuevo.');
    } finally {
      setLikingPostId(null);
    }
  };

  return (
    <div className="motivation-wall-layout">
      <div className="motivation-wall-left-column">
        <PostCreatorCard onPostCreated={handlePostCreated} />
      </div>
      <div className="motivation-wall-right-column">
        <header className="motivation-wall-header">
          <h1>Muro de Motivación</h1>
        </header>
        {loadingPosts && <div className="loading-state">Cargando publicaciones...</div>}
        {errorPosts && <div className="error-state">{errorPosts}</div>}

        {!loadingPosts && !errorPosts && posts.length === 0 ? (
          <div className="empty-state">
            <p>El muro de motivación está vacío.</p>
            <p>¡Crea una publicación para empezar!</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="motivation-feed-item" data-media-id={post.id}>
                <PostCard
                  post={post}
                  onDelete={handleDelete}
                  onLike={handleLike} // Pass the handleLike function
                  isPlaying={post.id === activeMediaId && post.type === 'video'}
                  isLiking={post.id === likingPostId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
