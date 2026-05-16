import { useState } from 'react';
import { useToasts } from '../../hooks/useToasts';
import { supabase } from '../../supabaseClient';

interface ImageUploaderProps {
  bucketName: string;
  filePath: string;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: Error) => void;
  [key: string]: any; // For aria-label, etc.
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ bucketName, filePath, onUploadSuccess, onUploadError, ...props }) => {
  const { showSuccessToast, showErrorToast } = useToasts();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Comprimir imagen antes de subir (solo para imágenes)
      let fileToUpload: File | Blob = file;
      
      if (file.type.startsWith('image/')) {
        const { compressImage } = await import('../../lib/imageCompression');
        const compressedBlob = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.85,
          mimeType: 'image/jpeg',
        });
        fileToUpload = compressedBlob;
      }

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
      showSuccessToast('Imagen subida con éxito!');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido';
      showErrorToast(`Error al subir imagen: ${errorMessage}`);
      if (onUploadError) {
        onUploadError(err as Error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label htmlFor="file-upload" className="image-uploader-label" {...props}>
      {isUploading ? 'Subiendo...' : 'Cambiar'}
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        style={{ display: 'none' }}
      />
    </label>
  );
};
