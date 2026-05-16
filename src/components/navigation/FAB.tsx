import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaCamera, FaShareAlt, FaEdit } from 'react-icons/fa';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from 'react-hot-toast';
import CreatePostModal from '../community/CreatePostModal';
import MediaTypeSelector from '../community/MediaTypeSelector';
import NotificationBadge from '../community/NotificationBadge';
import './FAB.css';

const FAB: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleCapturePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        // Preload image before showing modal for instant display
        const img = new Image();
        img.src = image.webPath;
        
        // Show modal immediately with the URI
        setCapturedImageUri(image.webPath);
        setMediaType('image');
        setShowPostModal(true);
      }
    } catch (error) {
      const { toast } = await import('react-hot-toast');
      if (error !== 'User cancelled photos app') {
        toast.error('No se pudo abrir la cámara', { duration: 2000 });
      }
    }
  };

  const handleCaptureVideo = async () => {
    const { toast } = await import('react-hot-toast');
    
    // For now, use native video capture via input
    // In future: implement with capacitor-video-recorder plugin
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.capture = 'environment';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const videoUrl = URL.createObjectURL(file);
        setCapturedImageUri(videoUrl);
        setMediaType('video');
        setShowPostModal(true);
      }
    };
    
    input.click();
  };

  const handleClick = async () => {
    // Haptic feedback on native platforms
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    // OPCIÓN B: Comportamiento Contextual Social
    // En Comunidad: Crear post
    if (location.pathname === '/community') {
      setShowMediaSelector(true);
    }
    // En Workout/Historial: Compartir progreso
    else if (location.pathname.startsWith('/workout/') || location.pathname === '/workout-history') {
      toast('📸 Comparte tu progreso', { duration: 2000 });
      setShowMediaSelector(true);
    }
    // En Planes: Compartir plan (futuro)
    else if (location.pathname.startsWith('/plan/') || location.pathname === '/planes') {
      toast('📤 Comparte tu plan (próximamente)', { duration: 2000 });
      // Future implementation: Share plan functionality
      // Will allow users to share their workout plans with friends
      // Implementation will include: plan export, social sharing, and plan templates
    }
    // En Perfil: Editar perfil
    else if (location.pathname === '/profile') {
      toast('✏️ Editar perfil', { duration: 2000 });
      navigate('/profile'); // Ya estás ahí, pero podrías abrir modal de edición
    }
    // Default: Navegar a Comunidad
    else {
      navigate('/community');
    }
  };

  const handlePostCreated = () => {
    // Refresh community feed or navigate to community
    if (location.pathname !== '/community') {
      navigate('/community');
    } else {
      // Trigger refresh of community feed
      window.location.reload();
    }
  };

  // Determine icon based on route (Opción B)
  const getIcon = () => {
    if (location.pathname === '/community') {
      return <FaCamera size={24} />;
    } else if (location.pathname.startsWith('/workout/') || location.pathname === '/workout-history') {
      return <FaCamera size={24} />; // Compartir progreso
    } else if (location.pathname.startsWith('/plan/') || location.pathname === '/planes') {
      return <FaShareAlt size={24} />; // Compartir plan
    } else if (location.pathname === '/profile') {
      return <FaEdit size={24} />; // Editar perfil
    }
    // Default: Ir a comunidad
    return <FaUsers size={24} />;
  };

  return (
    <>
      <button className="fab" onClick={handleClick} aria-label="Quick Action">
        {getIcon()}
        <NotificationBadge className="fab-notification-badge" />
      </button>

      {showMediaSelector && (
        <MediaTypeSelector
          onSelectPhoto={() => {
            setShowMediaSelector(false);
            handleCapturePhoto();
          }}
          onSelectVideo={() => {
            setShowMediaSelector(false);
            handleCaptureVideo();
          }}
          onClose={() => setShowMediaSelector(false)}
        />
      )}

      {showPostModal && capturedImageUri && (
        <CreatePostModal
          imageUri={capturedImageUri}
          mediaType={mediaType}
          onClose={() => {
            setShowPostModal(false);
            setCapturedImageUri('');
          }}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default FAB;

