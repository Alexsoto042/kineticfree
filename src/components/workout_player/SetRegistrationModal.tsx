import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button/Button';
import './SetRegistrationModal.css';

interface SetRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reps: number; weight: number }) => void;
  exerciseName: string;
  setNumber: number;
}

export function SetRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  exerciseName,
  setNumber,
}: SetRegistrationModalProps) {
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReps('');
      setWeight('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const repsNum = Number(reps);
    const weightNum = Number(weight);

    if (repsNum > 0 && weightNum >= 0) {
      onSubmit({ reps: repsNum, weight: weightNum });
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="set-modal-backdrop" onClick={handleBackdropClick}>
      <div className="set-modal">
        <div className="set-modal__header">
          <h3 className="set-modal__title">Registrar Serie {setNumber}</h3>
          <button
            className="set-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <p className="set-modal__exercise-name">{exerciseName}</p>

        <form onSubmit={handleSubmit} className="set-modal__form">
          <div className="set-modal__input-group">
            <label htmlFor="reps" className="set-modal__label">
              Repeticiones
            </label>
            <input
              type="number"
              id="reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              min="0"
              placeholder="0"
              required
              className="set-modal__input"
              autoFocus
            />
          </div>

          <div className="set-modal__input-group">
            <label htmlFor="weight" className="set-modal__label">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.5"
              placeholder="0"
              required
              className="set-modal__input"
            />
          </div>

          <div className="set-modal__actions">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Registrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
