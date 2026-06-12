import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

const mockLogin    = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('../../services/authService', () => ({
  login:          vi.fn(),
  register:       vi.fn(),
  recoverAccount: vi.fn(),
}));

const { login: loginApi, register: registerApi, recoverAccount } =
  await import('../../services/authService');

const renderPage = () => render(<MemoryRouter><LoginPage /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage — sign in tab', () => {
  test('renders username and password fields', () => {
    renderPage();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('does not show email field in login mode', () => {
    renderPage();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  const clickSubmit = (name) => {
    const btn = screen.getAllByRole('button', { name }).find(b => b.type === 'submit');
    fireEvent.click(btn);
  };

  test('submits login and redirects on success', async () => {
    loginApi.mockResolvedValueOnce({ token: 'tok', user: { id: 1, username: 'alice', isAdmin: false } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    clickSubmit(/sign in/i);
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(
      { id: 1, username: 'alice', isAdmin: false }, 'tok'
    ));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows error message on failed login', async () => {
    loginApi.mockRejectedValueOnce({ response: { data: { error: 'Invalid username or password' } } });
    renderPage();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    clickSubmit(/sign in/i);
    await waitFor(() => expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument());
  });

  test('shows generic error when no server message', async () => {
    loginApi.mockRejectedValueOnce(new Error('Network error'));
    renderPage();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'u' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'p' } });
    clickSubmit(/sign in/i);
    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
  });
});

describe('LoginPage — create account tab', () => {
  const switchToRegister = () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
  };

  test('shows email field in register mode', () => {
    switchToRegister();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('shows password hint in register mode', () => {
    switchToRegister();
    expect(screen.getByText(/min\. 6 characters/i)).toBeInTheDocument();
  });

  test('submits registration and redirects on success', async () => {
    registerApi.mockResolvedValueOnce({ token: 'tok2', user: { id: 2, username: 'bob', isAdmin: false } });
    switchToRegister();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'mypassword' } });
    const submitBtn = screen.getAllByRole('button', { name: /create account/i }).find(b => b.type === 'submit');
    fireEvent.click(submitBtn);
    await waitFor(() => expect(registerApi).toHaveBeenCalledWith('bob', 'mypassword', 'bob@example.com'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('LoginPage — account recovery', () => {
  test('recovery panel hidden by default', () => {
    renderPage();
    expect(screen.queryByText(/get my username/i)).not.toBeInTheDocument();
  });

  test('opens recovery panel when link clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText(/forgot username or password/i));
    expect(screen.getByText(/get my username/i)).toBeInTheDocument();
  });

  test('closes panel when "never mind" clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText(/forgot username or password/i));
    fireEvent.click(screen.getByText(/never mind/i));
    expect(screen.queryByText(/get my username/i)).not.toBeInTheDocument();
  });

  test('submits username recovery and shows success message', async () => {
    recoverAccount.mockResolvedValueOnce({ message: 'Check your email' });
    renderPage();
    fireEvent.click(screen.getByText(/forgot username or password/i));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'alice@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /email me my username/i }));
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument());
  });
});
