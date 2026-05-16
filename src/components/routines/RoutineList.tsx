import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoutines } from '../../hooks/useRoutines';
import RoutineCard from './RoutineCard';
import SkeletonCard from '../ui/SkeletonCard';
import PaginationControls from '../ui/PaginationControls';
import LoadingSpinner from '../ui/LoadingSpinner';
import './RoutineList.css';

function RoutineList() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const {
    routines,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    hasMore,
    pageSize,
  } = useRoutines({ infiniteScroll: isMobile });

  const observer = useRef<IntersectionObserver>();
  const lastRoutineElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          handlePageChange(currentPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, currentPage, handlePageChange]
  );

  if (loading && routines.length === 0) {
    return (
      <div className="routine-list">
        {Array.from({ length: pageSize }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <>
      {isOffline && (
        <div className="offline-banner">
          Modo Offline: Mostrando rutinas guardadas
        </div>
      )}
      {routines.length === 0 && !loading ? (
        <p className="empty-state-message">
          No se encontraron rutinas con los filtros aplicados.
        </p>
      ) : (
        <div className="routine-list">
          {routines.map((routine, index) => {
            if (isMobile && routines.length === index + 1) {
              return (
                <div ref={lastRoutineElementRef} key={routine.id}>
                  <RoutineCard
                    routine={routine}
                    to={`/routine/${routine.id}`}
                    className="grid-item-link"
                  />
                </div>
              );
            }
            return (
              <RoutineCard
                routine={routine}
                key={routine.id}
                to={`/routine/${routine.id}`}
                className="grid-item-link"
              />
            );
          })}
        </div>
      )}
      {loading && isMobile && <LoadingSpinner />}
      {!isMobile && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}

export default RoutineList;
