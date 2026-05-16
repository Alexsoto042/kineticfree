import { useState, useEffect, useRef, useCallback } from 'react';
import { useFilters } from '../../../context/FilterContext';
import { useExercises } from '../hooks/useExercises';
import { ExerciseCard } from './ExerciseCard';
import './ExerciseList.css';
import SkeletonCard from '../../../components/ui/SkeletonCard';
import PaginationControls from '../../../components/ui/PaginationControls';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const SKELETON_CARD_COUNT = 12;

function ExerciseList() {
  const { filter, bodyZoneFilter } = useFilters();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const {
    exercises,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
    hasMore,
  } = useExercises({
    category: filter,
    bodyZone: bodyZoneFilter,
    infiniteScroll: isMobile,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastExerciseElementRef = useCallback(
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

  if (loading && exercises.length === 0) {
    return (
      <div className="exercise-list">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
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
      {exercises.length === 0 && !loading ? (
        <p className="empty-state-message">
          No se encontraron ejercicios con los filtros aplicados.
        </p>
      ) : (
        <div className="exercise-list">
          {exercises.map((exercise, index) => {
            if (isMobile && exercises.length === index + 1) {
              return (
                <div ref={lastExerciseElementRef} key={exercise.id}>
                  <ExerciseCard exercise={exercise} />
                </div>
              );
            }
            return <ExerciseCard key={exercise.id} exercise={exercise} />;
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

export default ExerciseList;