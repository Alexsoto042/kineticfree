import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Leaderboard from './Leaderboard';
import { useLeaderboard, LeaderboardFilter } from '../../hooks/useLeaderboard';

// Mock the useLeaderboard hook
vi.mock('../../hooks/useLeaderboard', () => ({
  useLeaderboard: vi.fn(),
  LeaderboardFilter: {
    TOTAL_WEIGHT_LIFTED: 'total_weight_lifted',
    TOTAL_WORKOUTS: 'total_workouts',
  },
}));
const mockUseLeaderboard = useLeaderboard as vi.Mock;

describe('Leaderboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Arrange: Configure the mock to return a loading state
    mockUseLeaderboard.mockReturnValue({
      leaderboardData: [],
      loading: true,
    });

    // Act: Render the component
    render(<Leaderboard />);

    // Assert: Check that the loading message is displayed
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('renders leaderboard data correctly after loading', () => {
    // Arrange: Configure the mock to return sample data
    const mockData = [
      {
        user_id: '1',
        rank: 1,
        username: 'User One',
        avatar_url: '',
        value: 15000,
      },
      {
        user_id: '2',
        rank: 2,
        username: 'User Two',
        avatar_url: '',
        value: 12500,
      },
    ];
    mockUseLeaderboard.mockReturnValue({
      leaderboardData: mockData,
      loading: false,
    });

    // Act: Render the component
    render(<Leaderboard />);

    // Assert: Check for titles, user data, and formatted values
    expect(screen.getByText('Tabla de Clasificación')).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
    expect(screen.getByText('15,000')).toBeInTheDocument();
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
  });

  test('changes filter and re-fetches data when filter buttons are clicked', async () => {
    // Arrange: Set up the initial state for the mock
    mockUseLeaderboard.mockReturnValue({
      leaderboardData: [],
      loading: false,
    });
    render(<Leaderboard />);

    // Assert: Verify the hook was called with the default filter on initial render
    // The hook is defined in Leaderboard.tsx as: useLeaderboard(LeaderboardFilter[filter])
    // And LeaderboardFilter is likely an enum or const object. We'll assume string values for the test.
    expect(mockUseLeaderboard).toHaveBeenCalledWith('total_weight_lifted');

    // Act: Simulate a user clicking the "Entrenamientos" button
    const workoutsButton = screen.getByRole('button', {
      name: /Entrenamientos/i,
    });
    fireEvent.click(workoutsButton);

    // Assert: The component state updates and triggers a re-render,
    // which should call the hook again with the new filter value.
    await waitFor(() => {
      expect(mockUseLeaderboard).toHaveBeenCalledWith('total_workouts');
    });

    // Act: Simulate clicking the "Peso Total" button to switch back
    const weightButton = screen.getByRole('button', { name: /Peso Total/i });
    fireEvent.click(weightButton);

    // Assert: Verify the hook is called with the weight filter again
    await waitFor(() => {
      expect(mockUseLeaderboard).toHaveBeenCalledWith('total_weight_lifted');
    });

    // Ensure the hook was called the expected number of times (initial + 2 clicks)
    expect(mockUseLeaderboard).toHaveBeenCalledTimes(3);
  });
});
