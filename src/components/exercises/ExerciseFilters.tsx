import { useFilters } from '../../context/FilterContext';
import { useExerciseMetadata } from '../../hooks/useExerciseMetadata';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button/Button';

function ExerciseFilters() {
  const { uniqueBodyZones, loading, error } = useExerciseMetadata();
  const { filter, setFilter, bodyZoneFilter, setBodyZoneFilter } = useFilters();
  const { t } = useTranslation();

  // Handle loading and error states for the filters
  if (loading) {
    return <div className="filters-container-group">Cargando filtros...</div>;
  }

  if (error) {
    return (
      <div className="filters-container-group">Error al cargar filtros.</div>
    );
  }

  return (
    <div className="filters-container-group">
      <div className="filters-container">
        <Button
          onClick={() => setFilter('todos')}
          variant={filter === 'todos' ? 'primary' : 'secondary'}
        >
          Todos
        </Button>
        <Button
          onClick={() => setFilter('strength')}
          variant={filter === 'strength' ? 'primary' : 'secondary'}
        >
          Fuerza
        </Button>
        <Button
          onClick={() => setFilter('cardio')}
          variant={filter === 'cardio' ? 'primary' : 'secondary'}
        >
          Cardio
        </Button>
      </div>
      <div className="filters-container mobile-hidden-filters">
        {uniqueBodyZones.map((zone) => (
          <Button
            key={zone}
            onClick={() => setBodyZoneFilter(zone)}
            variant={bodyZoneFilter === zone ? 'primary' : 'secondary'}
          >
            {t(zone)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ExerciseFilters;
