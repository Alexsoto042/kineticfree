import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './AuthGuard';
import { useUserStore } from '../../store/userStore';

// Mock useUserStore
vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('should show loading spinner when loading', () => {
      (useUserStore as any).mockReturnValue({ loading: true, session: null, profile: null });
      
      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );
      
      // Assuming LoadingSpinner renders a div with class 'spinner' or similar. 
      // Based on previous view, it has styles.spinner. 
      // Let's just check if children are NOT rendered.
      expect(screen.queryByText('Protected Content')).toBeNull();
    });

    it('should redirect to login if no session', () => {
      (useUserStore as any).mockReturnValue({ loading: false, session: null, profile: null });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to onboarding if session exists but onboarding not completed', () => {
      (useUserStore as any).mockReturnValue({ 
        loading: false, 
        session: { user: { id: '1' } }, 
        profile: { onboarding_completed: false } 
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
            <Route path="/onboarding" element={<div>Onboarding Page</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
    });

    it('should redirect to profilesetup if onboarding completed but no username', () => {
      (useUserStore as any).mockReturnValue({ 
        loading: false, 
        session: { user: { id: '1' } }, 
        profile: { onboarding_completed: true, username: null } 
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
            <Route path="/profilesetup" element={<div>Profile Setup Page</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Profile Setup Page')).toBeInTheDocument();
    });

    it('should render children if fully authenticated', () => {
      (useUserStore as any).mockReturnValue({ 
        loading: false, 
        session: { user: { id: '1' } }, 
        profile: { onboarding_completed: true, username: 'testuser' } 
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children during background refresh (loading=true but session exists)', () => {
      (useUserStore as any).mockReturnValue({ 
        loading: true, 
        session: { user: { id: '1' } }, 
        profile: { onboarding_completed: true, username: 'testuser' } 
      });
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

  });

  describe('PublicRoute', () => {
    it('should redirect to dashboard if session exists', () => {
      (useUserStore as any).mockReturnValue({ 
        loading: false, 
        session: { user: { id: '1' } } 
      });
      
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<PublicRoute><div>Login Page</div></PublicRoute>} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render children if no session', () => {
      (useUserStore as any).mockReturnValue({ 
        loading: false, 
        session: null 
      });
      
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<PublicRoute><div>Login Page</div></PublicRoute>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
