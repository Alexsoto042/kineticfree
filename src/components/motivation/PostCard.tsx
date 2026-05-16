import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MotivationalPost } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CommentSection from '../community/CommentSection';
import './PostCard.css';

interface PostCardProps {
  post: MotivationalPost;
  onDelete: (id: number) => void;
  onLike: (id: number) => void; // New prop for handling likes
  isPlaying: boolean;
  isLiking?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete, onLike, isPlaying, isLiking }) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const { session } = useAuth();
  const userId = session?.user?.id;
  const isLiked = userId ? post.liked_by.includes(userId) : false;
  const [showComments, setShowComments] = useState(false);

  // Assuming post.media_url is always the full public URL after migrations and new uploads
  const fullMediaUrl = post.media_url || '';

  useEffect(() => {
    if (mediaRef.current && post.type === 'video') {
      const videoElement = mediaRef.current as HTMLVideoElement;
      if (isPlaying) {
        videoElement.play().catch(e => console.error("Error playing video:", e));
      } else {
        videoElement.pause();
        videoElement.currentTime = 0; // Reset video to start
      }
    }
  }, [isPlaying, post.type]);

  const isAuthor = session?.user?.id === post.user_id;
  const cardClasses = `motivation-post-card ${post.type === 'video' ? 'motivation-post-card--video' : ''}`;

  return (
    <div className={cardClasses}>
      <div className="post-header">
        <img
          src={post.author_avatar_url || '/images/default-avatar.svg'}
          alt="Author Avatar"
          className="author-avatar"
        />
        <Link to={`/friends/${post.user_id}`} className="author-name-link">
          <span className="author-name">{post.author_name || 'Anónimo'}</span>
        </Link>
      </div>
      <div className="post-media-container">
        {post.type === 'video' && fullMediaUrl ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            className="post-media video-element"
            src={fullMediaUrl}
            loop
            muted
            playsInline
            autoPlay
            controls={true} // Changed to true for debugging
            preload="metadata"
          />
        ) : post.type === 'image' && fullMediaUrl ? (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            className="post-media image-element"
            src={fullMediaUrl}
            alt={post.caption || 'Motivational image'}
          />
        ) : (
          <div className="no-media-placeholder">No media available</div>
        )}
      </div>
      {post.caption && (
        <div className="post-description-card">
          <p className="post-caption">{post.caption}</p>
        </div>
      )}
      <div className="post-footer">
        <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
        <div className="post-actions">
          <button
            onClick={() => onLike(post.id)}
            className={`like-button ${isLiked ? 'liked' : ''}`}
            aria-label="Like post"
            disabled={isLiking}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isLiked ? 'red' : 'none'}
              stroke={isLiked ? 'red' : 'currentColor'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-heart"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0 -7.78 0l-.61.61-.61-.61a5.5 5.5 0 0 0 -7.78 0 5.5 5.5 0 0 0 0 7.78l8.4 8.4 8.4-8.4a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="likes-count">{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="comment-button"
            aria-label="Toggle comments"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="comment-text">{showComments ? 'Ocultar' : 'Comentarios'}</span>
          </button>
          {isAuthor && (
            <button onClick={() => onDelete(post.id)} className="delete-post-btn">
              Eliminar
            </button>
          )}
        </div>
      </div>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
};

export default PostCard;
