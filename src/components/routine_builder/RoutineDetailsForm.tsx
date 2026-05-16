import type { Routine, RoutineGoal } from '../../types';

interface RoutineDetailsFormProps {
  routineName: string;
  setRoutineName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: Routine['category'];
  setCategory: (value: Routine['category']) => void;
  difficulty: Routine['difficulty'];
  setDifficulty: (value: Routine['difficulty']) => void;
  goal: RoutineGoal;
  setGoal: (value: RoutineGoal) => void;
  bodyZoneFocus: string[];
  setBodyZoneFocus: (value: string[]) => void;
  uniqueBodyZones: string[];
  routineNameError: string | null;
  descriptionError: string | null;
  setRoutineNameError: (value: string | null) => void;
  setDescriptionError: (value: string | null) => void;
}

export function RoutineDetailsForm({
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
  uniqueBodyZones,
  routineNameError,
  descriptionError,
  setRoutineNameError,
  setDescriptionError,
}: RoutineDetailsFormProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="routineName" className="form-label">
          Nombre de la Rutina:
        </label>
        <input
          type="text"
          id="routineName"
          value={routineName}
          onChange={(e) => {
            setRoutineName(e.target.value);
            if (routineNameError) setRoutineNameError(null);
          }}
          className={`form-control ${routineNameError ? 'input-error' : ''}`}
          required
        />
        {routineNameError && (
          <p className="error-message">{routineNameError}</p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (descriptionError) setDescriptionError(null);
          }}
          className={`form-control ${descriptionError ? 'input-error' : ''}`}
          required
        />
        {descriptionError && (
          <p className="error-message">{descriptionError}</p>
        )}
      </div>
      <div className="details-form-grid">
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Categoría:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Routine['category'])}
            className="form-control"
          >
            <option value="strength">Fuerza</option>
            <option value="cardio">Cardio</option>
            <option value="hybrid">Híbrido</option>
            <option value="flexibility">Flexibilidad</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="difficulty" className="form-label">
            Dificultad:
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as Routine['difficulty'])
            }
            className="form-control"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="goal" className="form-label">
            Objetivo:
          </label>
          <select
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value as RoutineGoal)}
            className="form-control"
          >
            <option value="muscle_gain">Ganancia Muscular</option>
            <option value="weight_loss">Pérdida de Peso</option>
            <option value="endurance">Resistencia</option>
            <option value="general_fitness">Fitness General</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Enfoque de Zona Corporal (Rutina):</label>
        <div className="checkbox-group">
          {uniqueBodyZones.map((zone) => (
            <label key={zone}>
              <input
                type="checkbox"
                value={zone}
                checked={bodyZoneFocus.includes(zone)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setBodyZoneFocus([...bodyZoneFocus, e.target.value]);
                  } else {
                    setBodyZoneFocus(
                      bodyZoneFocus.filter((z) => z !== e.target.value)
                    );
                  }
                }}
              />
              {zone}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
