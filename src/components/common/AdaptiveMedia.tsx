import { useState, useEffect, useRef } from 'react';

interface AdaptiveMediaProps {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

export function AdaptiveMedia({ src, fallbackSrc, alt, className = '' }: AdaptiveMediaProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  // Load video when shouldLoad is true
  useEffect(() => {
    if (!shouldLoad) return;

    const videoToLoad = src || fallbackSrc || '';
    if (videoToLoad) {
      setCurrentSrc(videoToLoad);
    }
  }, [shouldLoad, src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Try fallback if primary source fails
      if (src && fallbackSrc && currentSrc === src) {
        setCurrentSrc(fallbackSrc);
      }
    }
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  return (
    <video
      ref={videoRef}
      src={currentSrc}
      title={alt}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      onError={handleError}
      onLoadedData={handleLoadedData}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoading && currentSrc ? 0.6 : 1
      }}
    />
  );
}

