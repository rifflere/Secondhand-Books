import { renderHook, waitFor, act } from '@testing-library/react';
import { useShelves } from '../../hooks/useShelves';

vi.mock('../../services/shelvesService', () => ({
  listShelves:  vi.fn(),
  createShelf:  vi.fn(),
  updateShelf:  vi.fn(),
  deleteShelf:  vi.fn(),
  getShelfBooks: vi.fn(),
}));

const { listShelves, createShelf, updateShelf, deleteShelf } =
  await import('../../services/shelvesService');

const shelf1 = { id: 1, name: 'Main Shelf', is_public: true, is_default: true,  book_count: 3 };
const shelf2 = { id: 2, name: 'Sci-Fi',     is_public: false, is_default: false, book_count: 1 };

beforeEach(() => vi.clearAllMocks());

describe('useShelves', () => {
  test('loads shelves on mount', async () => {
    listShelves.mockResolvedValueOnce([shelf1, shelf2]);
    const { result } = renderHook(() => useShelves());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shelves).toHaveLength(2);
    expect(result.current.shelves[0].name).toBe('Main Shelf');
  });

  test('sets error when load fails', async () => {
    listShelves.mockRejectedValueOnce(new Error('Network'));
    const { result } = renderHook(() => useShelves());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/could not load/i);
    expect(result.current.shelves).toHaveLength(0);
  });

  test('createShelf appends new shelf to list', async () => {
    listShelves.mockResolvedValueOnce([shelf1]);
    createShelf.mockResolvedValueOnce(shelf2);
    const { result } = renderHook(() => useShelves());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.createShelf('Sci-Fi'); });
    expect(result.current.shelves).toHaveLength(2);
    expect(result.current.shelves[1].name).toBe('Sci-Fi');
  });

  test('updateShelf merges changes into existing shelf', async () => {
    listShelves.mockResolvedValueOnce([shelf1, shelf2]);
    updateShelf.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useShelves());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateShelf(2, { name: 'Fantasy', isPublic: true });
    });
    const updated = result.current.shelves.find((s) => s.id === 2);
    expect(updated.name).toBe('Fantasy');
    expect(updated.isPublic).toBe(true);
  });

  test('deleteShelf removes shelf from list', async () => {
    listShelves.mockResolvedValueOnce([shelf1, shelf2]);
    deleteShelf.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useShelves());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.deleteShelf(2); });
    expect(result.current.shelves).toHaveLength(1);
    expect(result.current.shelves[0].id).toBe(1);
  });

  test('reload re-fetches shelves', async () => {
    listShelves
      .mockResolvedValueOnce([shelf1])
      .mockResolvedValueOnce([shelf1, shelf2]);
    const { result } = renderHook(() => useShelves());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.shelves).toHaveLength(1);
    await act(async () => { await result.current.reload(); });
    await waitFor(() => expect(result.current.shelves).toHaveLength(2));
  });
});
