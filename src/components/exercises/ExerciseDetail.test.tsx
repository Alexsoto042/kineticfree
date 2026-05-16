import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ExerciseDetail from './ExerciseDetail';
import { supabase } from '../../supabaseClient';
import type { Exercise } from '../../types';

// Mock useParams from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Mock supabaseClient
vi.mock('../supabaseClient', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSelect }));
  const mockIn = vi.fn(() => ({ select: mockSelect }));
  const mockFrom = vi.fn((tableName: string) => {
    if (tableName === 'exercises') {
      return { select: vi.fn(() => ({ eq: mockEq, in: mockIn })) };
    } else if (tableName === 'exercise_alternatives') {
      return { select: vi.fn(() => ({ eq: mockEq })) };
    }
    return { select: vi.fn() }; // Fallback
  });

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case 'strength': return 'Fuerza';
        case 'cardio': return 'Cardio';
        case 'flexibility': return 'Flexibilidad';
        case 'hybrid': return 'Híbrido';
        case 'pecho': return 'Pecho';
        case 'hombros': return 'Hombros';
        case 'triceps': return 'Tríceps';
        case 'piernas': return 'Piernas';
        case 'gluteos': return 'Glúteos';
        case 'core': return 'Core';
        case 'espalda': return 'Espalda';
        case 'biceps': return 'Bíceps';
        case 'cuerpo-completo': return 'Cuerpo Completo';
        case 'isquiotibiales': return 'Isquiotibiales';
        default: return key;
      }
    },
  }),
}));

const mockAlternativeExercise: Exercise = {
  id: 2,
  name: 'Flexiones (Push-ups)',
  description: 'Un ejercicio de peso corporal para el pecho.',
  category: 'strength',
  body_zone: ['pecho', 'triceps'],
  instructions: ['Paso A', 'Paso B'],
  image: 'path/to/alt_image.jpg',
  gif_url: 'path/to/alt_gif.gif',
  requires_machine: false,
  youtube_id: '',
  benefits: 'Desarrolla fuerza en el tren superior.',
  calories_burned_per_minute: 8,
};

const mockExercise: Exercise = {
  id: 1,
  name: 'Press de Banca con Barra',
  description: 'Un ejercicio fundamental para el pecho.',
  category: 'strength',
  body_zone: ['pecho', 'hombros', 'triceps'],
  instructions: ['Paso 1', 'Paso 2'],
  image: 'path/to/image.jpg',
  gif_url: 'path/to/gif.gif',
  youtube_id: '',
  benefits: 'Construye fuerza y masa muscular.',
  calories_burned_per_minute: 10,
  requires_machine: true,
  alternatives: [mockAlternativeExercise],
};

interface SupabaseError {
  code: string;
  message: string;
}

describe('ExerciseDetail component', () => {
  // Helper to set up the mock for supabase.from('exercises').select('*').eq().single()
  const mockSupabaseSingleReturn = (data: Exercise | null, error: SupabaseError | null = null) => {
    (supabase.from as vi.Mock).mockImplementation((tableName: string) => {
      if (tableName === 'exercises') {
        return {
          select: vi.fn((query) => {
            if (query === '*') {
              return {
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data, error })),
                })),
                in: vi.fn(() => Promise.resolve({ data: [mockAlternativeExercise], error: null })),
              };
            }
            return vi.fn(); // Fallback for other select queries
          }),
        };
      } else if (tableName === 'exercise_alternatives') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [{ alternative_id: mockAlternativeExercise.id }], error: null })),
          })),
        };
      }
      return vi.fn();
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useParams } = await import('react-router-dom');
    (useParams as vi.Mock).mockReturnValue({ exerciseId: '1' }); // Cambiado de 'id' a 'exerciseId'

    // Default mock for successful data fetching
    mockSupabaseSingleReturn(mockExercise);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should display loading state initially', () => {
    (supabase.from as vi.Mock).mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => new Promise(() => {})), // Never resolve
        })),
      })),
    }));

    render(
      <MemoryRouter initialEntries={['/exercises/1']}>
        <Routes>
          <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando ejercicio...')).toBeInTheDocument();
  });

  it('should display error message if exercise not found', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseSingleReturn(null, { code: 'PGRST116', message: 'Exercise not found' });

    render(
      <MemoryRouter initialEntries={['/exercises/999']}>
        <Routes>
          <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Ejercicio no encontrado.')).toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });

  it('should display exercise details correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/exercises/1']}>
        <Routes>
          <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Press de Banca con Barra')).toBeInTheDocument();
    expect(screen.getByText('Un ejercicio fundamental para el pecho.')).toBeInTheDocument();
    const headerBadges = screen.getByTestId('header-badges');
    expect(within(headerBadges).getByText(/fuerza/i)).toBeInTheDocument();
    expect(within(headerBadges).getByText(/pecho/i)).toBeInTheDocument();
    expect(within(headerBadges).getByText(/hombros/i)).toBeInTheDocument();
    expect(within(headerBadges).getByText(/tríceps/i)).toBeInTheDocument();
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
    // Assert that the video is present by its title
    expect(screen.getByTitle('Demostración de Press de Banca con Barra')).toBeInTheDocument();
    expect(screen.getByText('Construye fuerza y masa muscular.')).toBeInTheDocument();
    expect(screen.getByText(/Calorías Quemadas/i)).toBeInTheDocument();
    expect(screen.getByText('Aproximadamente 10 calorías por minuto')).toBeInTheDocument();
    expect(screen.getByText('Requiere máquina de gimnasio')).toBeInTheDocument();
    expect(screen.getByText('Alternativas de Ejercicio')).toBeInTheDocument();
    expect(screen.getByText('Flexiones (Push-ups)')).toBeInTheDocument();
    // Assert that the alternative's video is present by its title
    expect(screen.getByTitle('Flexiones (Push-ups)')).toBeInTheDocument();
  });

  it('should display youtube video if youtube_id is present', async () => {
    const exerciseWithVideo = { ...mockExercise, youtube_id: 'dQw4w9WgXcQ' };
    mockSupabaseSingleReturn(exerciseWithVideo); // Use the helper

    render(
      <MemoryRouter initialEntries={['/exercises/1']}>
        <Routes>
          <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const videoButton = await screen.findByRole('button', { name: /Ver Tutorial en Video/i });
    fireEvent.click(videoButton);

    await waitFor(() => {
      const iframe = screen.getByTitle('Press de Banca con Barra');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
    });
  });

  it('should navigate back to exercise list', async () => {
    render(
      <MemoryRouter initialEntries={['/exercises/1']}>
        <Routes>
          <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
          <Route path="/exercises" element={<div>Exercise List Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const backLink = screen.getByText('← Volver a la lista');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/exercises');
    });
  });
});