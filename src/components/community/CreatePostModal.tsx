import React, { useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { supabase } from '../../supabaseClient';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';
import './CreatePostModal.css';

interface CreatePostModalProps {
  imageUri: string;
  mediaType?: 'image' | 'video';
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  imageUri,
  mediaType = 'image',
  onClose,
  onPostCreated,
}) => {
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const { profile } = useUserStore();

  const handlePost = async () => {
    if (!profile?.id) {
      toast.error('Debes iniciar sesión para publicar');
      return;
    }

    setIsPosting(true);

    try {
      // Convert media URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate unique filename based on media type
      const extension = mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `post_${profile.id}_${Date.now()}.${extension}`;
      const filePath = `posts/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('motivation-posts')
        .upload(filePath, blob, {
          contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('motivation-posts')
        .getPublicUrl(filePath);

      // Create post in database
      const { error: postError } = await supabase
        .from('motivation_posts')
        .insert({
          user_id: profile.id,
          content: caption || '',
          media_url: urlData.publicUrl,
          media_type: mediaType,
        });

      if (postError) throw postError;

      toast.success('¡Publicación creada! 🎉');
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al publicar. Intenta de nuevo.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="create-post-modal-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <FaTimes size={24} />
        </button>

        <div className="post-preview">
          {!mediaLoaded && (
            <div className="preview-skeleton">
              <div className="skeleton-pulse"></div>
            </div>
          )}
          {mediaType === 'video' ? (
            <video 
              src={imageUri} 
              controls 
              className="preview-image"
              style={{ display: mediaLoaded ? 'block' : 'none' }}
              onLoadedData={() => setMediaLoaded(true)}
            />
          ) : (
            <img 
              src={imageUri} 
              alt="Preview" 
              className="preview-image"
              style={{ display: mediaLoaded ? 'block' : 'none' }}
              onLoad={() => setMediaLoaded(true)}
            />
          )}
        </div>

        <div className="post-caption-section">
          <textarea
            className="caption-input"
            placeholder="Escribe algo inspirador..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            autoFocus
          />
          <div className="caption-counter">
            {caption.length}/500
          </div>
        </div>

        <button
          className="publish-btn"
          onClick={handlePost}
          disabled={isPosting}
        >
          {isPosting ? (
            'Publicando...'
          ) : (
            <>
              <FaPaperPlane /> Publicar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePostModal;
