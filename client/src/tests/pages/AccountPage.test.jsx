import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountPage from '../../pages/AccountPage';

const mockLogout   = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'rebecca', isAdmin: false }, logout: mockLogout }),
}));

vi.mock('../../services/accountService', () => ({
  getAccountStats: vi.fn(),
  deleteAccount:   vi.fn(),
}));

const { getAccountStats, deleteAccount } = await import('../../services/accountService');

const stats = {
  username: 'rebecca', createdAt: '2025-01-15T12:00:00Z',
  books: 42, shelves: 5, buddies: 8,
};

const renderPage = () => render(<MemoryRouter><AccountPage /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  getAccountStats.mockResolvedValue(stats);
});

describe('AccountPage', () => {
  test('shows username and join date', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('rebecca')).toBeInTheDocument());
    expect(screen.getByText(/january 15, 2025/i)).toBeInTheDocument();
  });

  test('displays book, shelf, and buddy stats', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('shows error when stats fail to load', async () => {
    getAccountStats.mockRejectedValueOnce(new Error('Network'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/could not load account/i)).toBeInTheDocument()
    );
  });

  test('shows delete confirmation when button clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('rebecca'));
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('rebecca')).toBeInTheDocument();
  });

  test('"Delete Forever" button disabled until username typed', async () => {
    renderPage();
    await waitFor(() => screen.getByText('rebecca'));
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    const confirmBtn = screen.getByRole('button', { name: /delete forever/i });
    expect(confirmBtn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('rebecca'), { target: { value: 'rebec' } });
    expect(confirmBtn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('rebecca'), { target: { value: 'rebecca' } });
    expect(confirmBtn).not.toBeDisabled();
  });

  test('deletes account, logs out, and redirects on confirm', async () => {
    deleteAccount.mockResolvedValueOnce(undefined);
    renderPage();
    await waitFor(() => screen.getByText('rebecca'));
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    fireEvent.change(screen.getByPlaceholderText('rebecca'), { target: { value: 'rebecca' } });
    fireEvent.click(screen.getByRole('button', { name: /delete forever/i }));
    await waitFor(() => expect(deleteAccount).toHaveBeenCalled());
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows error when deletion fails', async () => {
    deleteAccount.mockRejectedValueOnce(new Error('Server error'));
    renderPage();
    await waitFor(() => screen.getByText('rebecca'));
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    fireEvent.change(screen.getByPlaceholderText('rebecca'), { target: { value: 'rebecca' } });
    fireEvent.click(screen.getByRole('button', { name: /delete forever/i }));
    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
  });

  test('cancel button hides deletion panel', async () => {
    renderPage();
    await waitFor(() => screen.getByText('rebecca'));
    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(screen.queryByText(/this cannot be undone/i)).not.toBeInTheDocument();
  });
});
