import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookCard from '../../components/BookCard';

const book = {
  title: 'Dune', author: 'Frank Herbert', year: 1965, pages: 412,
  cover: null, olKey: '/works/OL1W',
};

const shelves = [
  { id: 1, name: 'Main Shelf' },
  { id: 2, name: 'Sci-Fi' },
];

describe('BookCard', () => {
  test('renders title and author', () => {
    render(<BookCard book={book} />);
    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
  });

  test('renders year and page count', () => {
    render(<BookCard book={book} />);
    expect(screen.getByText(/1965/)).toBeInTheDocument();
    expect(screen.getByText(/412 pages/)).toBeInTheDocument();
  });

  test('shows no-cover placeholder when cover is null', () => {
    render(<BookCard book={book} />);
    expect(screen.getByText('No cover')).toBeInTheDocument();
  });

  test('shows save button when onSave prop provided', () => {
    render(<BookCard book={book} onSave={vi.fn()} />);
    expect(screen.getByRole('button', { name: /save to shelf/i })).toBeInTheDocument();
  });

  test('hides save button when onSave not provided', () => {
    render(<BookCard book={book} />);
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  test('calls onSave directly when no shelves provided', () => {
    const onSave = vi.fn();
    render(<BookCard book={book} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /save to shelf/i }));
    expect(onSave).toHaveBeenCalledWith(book);
  });

  test('shows shelf picker when shelves provided and save clicked', () => {
    render(<BookCard book={book} onSave={vi.fn()} shelves={shelves} />);
    fireEvent.click(screen.getByRole('button', { name: /save to shelf/i }));
    expect(screen.getByText('Main Shelf')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
  });

  test('calls onSave with shelfId when shelf picked', () => {
    const onSave = vi.fn();
    render(<BookCard book={book} onSave={onSave} shelves={shelves} />);
    fireEvent.click(screen.getByRole('button', { name: /save to shelf/i }));
    fireEvent.click(screen.getByText('Sci-Fi'));
    expect(onSave).toHaveBeenCalledWith(book, 2);
  });

  test('shows saving label while status is saving', () => {
    render(<BookCard book={book} onSave={vi.fn()} saveStatus="saving" />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
  });

  test('shows saved label and disables button when saved', () => {
    render(<BookCard book={book} onSave={vi.fn()} saveStatus="saved" />);
    const btn = screen.getByRole('button', { name: /saved/i });
    expect(btn).toBeDisabled();
  });

  test('shows duplicate message when already saved', () => {
    render(<BookCard book={book} onSave={vi.fn()} saveStatus="duplicate" />);
    expect(screen.getByText(/already saved/i)).toBeInTheDocument();
  });

  test('shows popularity count when saveCount provided', () => {
    render(<BookCard book={book} saveCount={42} />);
    expect(screen.getByText(/42 readers/i)).toBeInTheDocument();
  });

  test('does not show popularity when saveCount is 0', () => {
    render(<BookCard book={book} saveCount={0} />);
    expect(screen.queryByText(/readers/i)).not.toBeInTheDocument();
  });

  test('closes picker when cancel clicked', () => {
    render(<BookCard book={book} onSave={vi.fn()} shelves={shelves} />);
    fireEvent.click(screen.getByRole('button', { name: /save to shelf/i }));
    expect(screen.getByText('Main Shelf')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/cancel/i));
    expect(screen.queryByText('Main Shelf')).not.toBeInTheDocument();
  });
});
