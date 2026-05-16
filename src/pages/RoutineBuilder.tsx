import { useRoutineBuilder } from '../hooks/useRoutineBuilder';
import { RoutineDetailsForm } from '../components/routine_builder/RoutineDetailsForm';
import { SelectedExercises } from '../components/routine_builder/SelectedExercises';
import { ExercisePicker } from '../components/routine_builder/ExercisePicker';
import { Button } from '../components/ui/Button/Button';
import './RoutineBuilder.css';

function RoutineBuilder() {
  const {
    routineName,
    setRoutineName,
    description,
    setDescription,
    category,
    setCategory,
    difficulty,
    setDifficulty,
    goal,
    setGoal,
    bodyZoneFocus,
    setBodyZoneFocus,
    selectedExercises,
    routineNameError,
    setRoutineNameError,
    descriptionError,
    setDescriptionError,
    exercisesError,
    loadingExercises,
    errorExercises,
    searchTerm,
    setSearchTerm,
    exerciseCategoryFilter,
    setExerciseCategoryFilter,
    exerciseBodyZoneFilter,
    setExerciseBodyZoneFilter,
    uniqueBodyZones,
    filteredExercises,
    handleAddExercise,
    handleRemoveExercise,
    handleSubmit,
    isSavingRoutine,
    saveError,
  } = useRoutineBuilder();

  return (
    <div className="routine-builder-container">
      <h1>Crear Nueva Rutina</h1>
      <form onSubmit={handleSubmit} className="routine-form">
        <RoutineDetailsForm
          routineName={routineName}
          setRoutineName={setRoutineName}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          goal={goal}
          setGoal={setGoal}
          bodyZoneFocus={bodyZoneFocus}
          setBodyZoneFocus={setBodyZoneFocus}
          uniqueBodyZones={uniqueBodyZones}
          routineNameError={routineNameError}
          setRoutineNameError={setRoutineNameError}
          descriptionError={descriptionError}
          setDescriptionError={setDescriptionError}
        />

        <SelectedExercises
          selectedExercises={selectedExercises}
          onRemoveExercise={handleRemoveExercise}
          exercisesError={exercisesError}
        />

        <ExercisePicker
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          exerciseCategoryFilter={exerciseCategoryFilter}
          setExerciseCategoryFilter={setExerciseCategoryFilter}
          exerciseBodyZoneFilter={exerciseBodyZoneFilter}
          setExerciseBodyZoneFilter={setExerciseBodyZoneFilter}
          uniqueBodyZones={uniqueBodyZones}
          filteredExercises={filteredExercises}
          loadingExercises={loadingExercises}
          errorExercises={errorExercises}
          onAddExercise={handleAddExercise}
        />

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={
              isSavingRoutine ||
              !routineName ||
              !description ||
              selectedExercises.length === 0
            }
          >
            {isSavingRoutine ? 'Guardando...' : 'Guardar Rutina'}
          </Button>
          {saveError && (
            <p className="error-message">Error al guardar: {saveError}</p>
          )}
        </div>
      </form>
    </div>
  );
}

export default RoutineBuilder;
