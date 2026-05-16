import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { ThemeProvider } from '../../context/ThemeContext';

describe('Header component', () => {
  beforeEach(() => {
    const single = vi.fn(() => Promise.resolve({ data: { username: 'testuser' }, error: null }));
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    vi.doMock('../supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: vi.fn(() =>
            Promise.resolve({ data: { session: null }, error: null })
          ),
          signOut: vi.fn(() => Promise.resolve({ error: null })),
          getUser: vi.fn(() =>
            Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })
          ),
        },
        from,
        rpc: vi.fn(() => Promise.resolve({ data: 5, error: null })), // Mock rpc call for streak
      },
    }));
  });

  afterEach(() => {
    document.documentElement.className = '';
    vi.clearAllMocks();
    vi.resetModules();
  });

  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
  };

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <Header session={mockSession} />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('should reveal desktop links on dropdown click', async () => {
    renderComponent();

    const desktopNav = screen.getByTestId('desktop-nav');

    // Links should not be visible initially
    expect(
      within(desktopNav).queryByRole('link', { name: /ejercicios/i })
    ).toBeNull();

    // Click on the 'Explorar' dropdown trigger within the desktop nav
    const explorarTrigger = within(desktopNav).getByText(/Explorar/i);
    fireEvent.click(explorarTrigger);

    // Now the links should be visible within the desktop nav
    await waitFor(() => {
      expect(
        within(desktopNav).getByRole('link', { name: /ejercicios/i })
      ).toBeInTheDocument();
      expect(
        within(desktopNav).getByRole('link', { name: /planes/i })
      ).toBeInTheDocument();
      expect(
        within(desktopNav).getByRole('link', { name: /nutrición/i })
      ).toBeInTheDocument();
    });
  });

  it('should toggle the theme when the theme button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
    });

    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('light');
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
