import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import './PostCreatorCard.css';

interface PostCreatorCardProps {
  onPostCreated: () => void;
}

const PostCreatorCard: React.FC<PostCreatorCardProps> = ({ onPostCreated }) => {
  const { session, username, avatarUrl } = useAuth();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handlePostSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user?.id || (!caption && !file)) {
      alert('Por favor, escribe un pie de foto o selecciona un archivo.');
      return;
    }

    setUploading(true);
    let mediaUrl: string | null = null;
    let mediaType: 'image' | 'video' | null = null;
    let bucketName: string | null = null;

    try {
      if (file) {
        mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        bucketName = mediaType === 'video' ? 'motivation_videos' : 'motivation_images';

        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        const filePath = fileName; // File path within the specific bucket

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        mediaUrl = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('motivational_posts')
        .insert({
          user_id: session.user.id,
          caption: caption || null,
          media_url: mediaUrl,
          type: mediaType,
          author_name: username || session.user.email,
          author_avatar_url: avatarUrl || '/images/default-avatar.svg',
        });

      if (insertError) {
        throw insertError;
      }

      setCaption('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onPostCreated(); // Notify parent component to refresh posts
    } catch (error: any) {
      alert('Error al subir la publicación: ' + error.message);
      console.error('Error al subir la publicación:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="post-creator-card">
      <h3>Crear nueva publicación</h3>
      <form onSubmit={handlePostSubmit}>
        <textarea
          placeholder="¿Qué te motiva hoy?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          disabled={uploading}
        ></textarea>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="media-upload-input"
            accept="image/*,video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label htmlFor="media-upload-input" className="file-input-label">
            {file ? file.name : 'Seleccionar Imagen/Video'}
          </label>
        </div>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Subiendo...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
};

export default PostCreatorCard;