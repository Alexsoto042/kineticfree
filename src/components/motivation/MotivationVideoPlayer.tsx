import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import './MotivationVideoPlayer.css';

type ObjectFit = 'cover' | 'contain';

interface Props {
  videoBlob?: Blob;
  nativePath?: string;
  isPlaying: boolean;
}

export function MotivationVideoPlayer({
  videoBlob,
  nativePath,
  isPlaying,
}: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectFit, setObjectFit] = useState<ObjectFit>('cover');

  useEffect(() => {
    let url: string | null = null;

    const loadVideo = async () => {
      if (nativePath && Capacitor.isNativePlatform()) {
        try {
          const { uri } = await Filesystem.getUri({
            directory: Directory.Data,
            path: nativePath,
          });
          url = Capacitor.convertFileSrc(uri);
        } catch (e) {
          console.error('Could not load native video', e);
        }
      } else if (videoBlob) {
        url = URL.createObjectURL(videoBlob);
      }
      setVideoUrl(url);
    };

    loadVideo();

    // Cleanup function to revoke object URL
    return () => {
      if (url && videoBlob) {
        URL.revokeObjectURL(url);
      }
    };
  }, [videoBlob, nativePath]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((error) => console.error('Video play failed:', error));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((error) => console.error('Video play failed:', error));
    } else {
      video.pause();
    }
  };

  const handleMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.videoHeight > video.videoWidth) {
      setObjectFit('contain');
    } else {
      setObjectFit('cover');
    }
  };

  return (
    <div className="video-player-wrapper" onClick={handleVideoClick}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          playsInline
          className="video-element"
          onLoadedMetadata={handleMetadata}
          style={{ objectFit: objectFit }}
        />
      ) : (
        <div className="loading-video">Cargando video...</div>
      )}
    </div>
  );
}
