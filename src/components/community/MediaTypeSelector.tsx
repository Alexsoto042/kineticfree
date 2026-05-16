import React from 'react';
import { FaCamera, FaVideo, FaTimes } from 'react-icons/fa';
import './MediaTypeSelector.css';

interface MediaTypeSelectorProps {
  onSelectPhoto: () => void;
  onSelectVideo: () => void;
  onClose: () => void;
}

const MediaTypeSelector: React.FC<MediaTypeSelectorProps> = ({
  onSelectPhoto,
  onSelectVideo,
  onClose,
}) => {
  return (
    <div className="media-type-overlay" onClick={onClose}>
      <div className="media-type-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-selector-btn" onClick={onClose}>
          <FaTimes size={24} />
        </button>

        <h2>¿Qué quieres compartir?</h2>

        <div className="media-type-options">
          <button className="media-type-btn photo-btn" onClick={onSelectPhoto}>
            <FaCamera size={48} />
            <span>Foto</span>
          </button>

          <button className="media-type-btn video-btn" onClick={onSelectVideo}>
            <FaVideo size={48} />
            <span>Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaTypeSelector;
