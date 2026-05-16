import React, { useState } from 'react';
import { FaReply, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import type { PostComment } from '../../types';
import './CommentSection.css';

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { session } = useAuth();
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Show only first 10 comments initially
  const displayedComments = showAll ? comments : comments.slice(0, 10);
  const hasMore = comments.length > 10;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addComment(newCommentText);
      setNewCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error al publicar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addComment(replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Error al publicar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar comentario');
    }
  };

  const renderComment = (comment: PostComment, isReply = false) => {
    const isOwner = session?.user?.id === comment.user_id;
    const username = comment.user_profile?.username || 'Usuario';
    const avatarUrl = comment.user_profile?.avatar_url;

    return (
      <div key={comment.id} className={`comment ${isReply ? 'comment-reply' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="comment-avatar" />
            ) : (
              <div className="comment-avatar-placeholder">{username[0]?.toUpperCase()}</div>
            )}
            <span className="comment-username">{username}</span>
            <span className="comment-time">
              {new Date(comment.created_at).toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          {isOwner && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="comment-delete-btn"
              aria-label="Eliminar comentario"
            >
              <FaTrash size={12} />
            </button>
          )}
        </div>

        <p className="comment-text">{comment.comment_text}</p>

        {!isReply && (
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="comment-reply-btn"
          >
            <FaReply size={12} />
            <span>Responder</span>
          </button>
        )}

        {replyingTo === comment.id && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitReply(comment.id);
            }}
            className="comment-reply-form"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Responder a ${username}...`}
              maxLength={500}
              className="comment-input"
              autoFocus
            />
            <div className="comment-reply-actions">
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!replyText.trim() || submitting}
                className="btn-submit"
              >
                {submitting ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="comment-section-loading">Cargando comentarios...</div>;
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        Comentarios ({comments.length})
      </h3>

      {/* New comment form */}
      <form onSubmit={handleSubmitComment} className="comment-form">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={500}
          className="comment-input"
        />
        <button
          type="submit"
          disabled={!newCommentText.trim() || submitting}
          className="btn-submit"
        >
          {submitting ? 'Enviando...' : 'Comentar'}
        </button>
      </form>

      {/* Comments list */}
      <div className="comments-list">
        {displayedComments.length === 0 ? (
          <p className="no-comments">No hay comentarios aún. ¡Sé el primero!</p>
        ) : (
          <>
            {displayedComments.map((comment) => renderComment(comment))}
            {hasMore && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="btn-show-more"
              >
                <FaChevronDown />
                <span>Ver más comentarios ({comments.length - 10})</span>
              </button>
            )}
            {showAll && hasMore && (
              <button
                onClick={() => setShowAll(false)}
                className="btn-show-less"
              >
                <FaChevronUp />
                <span>Ver menos</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
