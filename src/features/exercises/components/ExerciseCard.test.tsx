import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExerciseCard } from './ExerciseCard';
import type { Exercise } from '../../../types';

describe('ExerciseCard component', () => {
  const mockExercise: Exercise = {
    id: 1,
    name: 'Press de Banca',
    description: 'Un ejercicio fundamental para el pecho.',
    category: 'strength',
    body_zone: ['Pecho', 'Hombros', 'Tríceps'],
    instructions: [],
    image: 'path/to/image.jpg',
  };

  it('should display exercise data correctly', () => {
    render(
      <MemoryRouter>
        <ExerciseCard exercise={mockExercise} onAdd={() => {}} />
      </MemoryRouter>
    );

    // Verificar el nombre
    expect(screen.getByText('Press de Banca')).toBeInTheDocument();

    // Verificar la categoría (sin traducir en el test)
    expect(screen.getByText('strength')).toBeInTheDocument();

    // Verificar cada zona del cuerpo
    expect(screen.getByText('Pecho')).toBeInTheDocument();
    expect(screen.getByText('Hombros')).toBeInTheDocument();
    expect(screen.getByText('Tríceps')).toBeInTheDocument();

    // Verificar el video por su título y su clase
    const video = screen.getByTitle('Press de Banca');
    expect(video).toBeInTheDocument();
    expect(video).toHaveClass('exercise-card__image');
  });
});
