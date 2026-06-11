import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ShelfCard from '../components/ShelfCard';
import BookshelfGraphic from '../components/BookshelfGraphic';
import { useShelves } from '../hooks/useShelves';
import * as shelvesApi from '../services/shelvesService';

const BOOKS_PER_ROW = 4;
const SORTS = [
  { value: 'date', label: 'Date Added' },
  { value: 'title', label: 'Title' },
];
const DEFAULT_DIR = { date: 'desc', title: 'asc' };

export default function ShelvesPage() {
  const { shelves, loading: shelvesLoading, createShelf, updateShelf, deleteShelf } = useShelves();
  const [activeId, setActiveId] = useState(null);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Shelf management UI state
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [editingShelf, setEditingShelf] = useState(false);
  const [editName, setEditName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState(null);

  const activeShelf = shelves.find((s) => s.id === activeId) || null;

  // Set default active shelf when shelves load
  useEffect(() => {
    if (!shelvesLoading && shelves.length > 0 && activeId === null) {
      const main = shelves.find((s) => s.isDefault) || shelves[0];
      setActiveId(main.id);
    }
  }, [shelvesLoading, shelves, activeId]);

  const loadBooks = useCallback(async (shelfId, sort, dir) => {
    if (!shelfId) return;
    setBooksLoading(true);
    try {
      setBooks(await shelvesApi.getShelfBooks(shelfId, sort, dir));
    } catch {
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) loadBooks(activeId, sortBy, sortDir);
  }, [activeId, loadBooks, sortBy, sortDir]);

  const handleSort = (key) => {
    if (key === sortBy) {
      const newDir = sortDir === 'desc' ? 'asc' : 'desc';
      setSortDir(newDir);
      loadBooks(activeId, key, newDir);
    } else {
      const newDir = DEFAULT_DIR[key];
      setSortBy(key);
      setSortDir(newDir);
      loadBooks(activeId, key, newDir);
    }
  };

  const sortArrow = (key) => (key === sortBy ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '');

  const handleTabClick = (id) => {
    setActiveId(id);
    setEditingShelf(false);
    setConfirmDelete(false);
    setActionError(null);
  };

  const handleCreateShelf = async (e) => {
    e.preventDefault();
    if (!newShelfName.trim()) return;
    setActionError(null);
    try {
      const shelf = await createShelf(newShelfName.trim());
      setNewShelfName('');
      setCreatingShelf(false);
      setActiveId(shelf.id);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not create shelf.');
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !activeShelf) return;
    setActionError(null);
    try {
      await updateShelf(activeShelf.id, { name: editName.trim() });
      setEditingShelf(false);
    } catch {
      setActionError('Could not rename shelf.');
    }
  };

  const handleToggleVisibility = async () => {
    if (!activeShelf) return;
    try {
      await updateShelf(activeShelf.id, { isPublic: !activeShelf.isPublic });
    } catch {
      setActionError('Could not update shelf.');
    }
  };

  const handleDeleteShelf = async () => {
    if (!activeShelf) return;
    try {
      await deleteShelf(activeShelf.id);
      setConfirmDelete(false);
      setActiveId(null);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not delete shelf.');
      setConfirmDelete(false);
    }
  };

  const handleRemoveBook = async (bookId) => {
    if (!activeId) return;
    await shelvesApi.removeBookFromShelf(activeId, bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleAddToShelf = async (bookId, targetShelfId) => {
    try {
      await shelvesApi.addBookToShelf(targetShelfId, bookId);
    } catch {
      // silently ignore duplicate
    }
  };

  const rows = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_ROW) {
    rows.push(books.slice(i, i + BOOKS_PER_ROW));
  }

  return (
    <div className="main-content">
      <BookshelfGraphic />

      <div className="shelf-tabs">
        {!shelvesLoading && shelves.map((s) => (
          <button
            key={s.id}
            className={`shelf-tab${s.id === activeId ? ' shelf-tab--active' : ''}`}
            onClick={() => handleTabClick(s.id)}
          >
            {s.name}
            <span className="shelf-tab-count">{s.bookCount}</span>
          </button>
        ))}
        {!creatingShelf ? (
          <button className="shelf-tab shelf-tab--new" onClick={() => setCreatingShelf(true)}>
            + New Shelf
          </button>
        ) : (
          <form className="shelf-tab-create" onSubmit={handleCreateShelf}>
            <input
              className="shelf-tab-input"
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              placeholder="Shelf name…"
              autoFocus
            />
            <button type="submit" className="shelf-tab-create-btn">Add</button>
            <button type="button" className="shelf-tab-cancel-btn" onClick={() => { setCreatingShelf(false); setNewShelfName(''); }}>
              ✕
            </button>
          </form>
        )}
      </div>

      {activeShelf && (
        <div className="shelf-toolbar">
          <div className="shelf-toolbar-left">
            {editingShelf ? (
              <form className="shelf-rename-form" onSubmit={handleRename}>
                <input
                  className="shelf-rename-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="shelf-rename-save">Save</button>
                <button type="button" className="shelf-rename-cancel" onClick={() => setEditingShelf(false)}>Cancel</button>
              </form>
            ) : (
              <div className="shelf-title-row">
                <h2 className="page-heading">{activeShelf.name}</h2>
                <div className="shelf-meta-actions">
                  <button
                    className={`shelf-visibility-btn${activeShelf.isPublic ? ' shelf-visibility-btn--public' : ''}`}
                    onClick={handleToggleVisibility}
                    title={activeShelf.isPublic ? 'Click to make private' : 'Click to make public'}
                  >
                    {activeShelf.isPublic ? 'Public' : 'Private'}
                  </button>
                  <button
                    className="shelf-meta-btn"
                    onClick={() => { setEditName(activeShelf.name); setEditingShelf(true); setConfirmDelete(false); }}
                  >
                    Rename
                  </button>
                  {!activeShelf.isDefault && (
                    <button
                      className="shelf-meta-btn shelf-meta-btn--danger"
                      onClick={() => { setConfirmDelete(true); setEditingShelf(false); }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
            {actionError && <p className="shelf-action-error">{actionError}</p>}
          </div>
          <div className="shelf-sort">
            {SORTS.map(({ value, label }) => (
              <button
                key={value}
                className={`sort-btn${sortBy === value ? ' sort-btn--active' : ''}`}
                onClick={() => handleSort(value)}
              >
                {label}{sortArrow(value)}
              </button>
            ))}
          </div>
        </div>
      )}

      {confirmDelete && activeShelf && (
        <div className="shelf-delete-warning">
          <div className="shelf-delete-warning-icon">!</div>
          <div className="shelf-delete-warning-body">
            <p className="shelf-delete-warning-title">
              Delete &ldquo;{activeShelf.name}&rdquo;?
            </p>
            <p className="shelf-delete-warning-text">
              {activeShelf.bookCount > 0
                ? `This shelf has ${activeShelf.bookCount} book${activeShelf.bookCount === 1 ? '' : 's'}. Any books saved only here will be permanently removed from your collection.`
                : 'This shelf is empty and will be permanently deleted.'}
            </p>
            <div className="shelf-delete-warning-actions">
              <button className="shelf-delete-confirm-btn" onClick={handleDeleteShelf}>
                Delete forever
              </button>
              <button className="shelf-delete-cancel-btn" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {booksLoading && <p className="shelf-loading">Loading…</p>}

      {!booksLoading && activeShelf && books.length === 0 && (
        <div className="shelf-empty">
          <p className="shelf-empty-title">This shelf is empty.</p>
          <p className="shelf-empty-sub">
            <Link to="/search">Search for books</Link> and save them, or add them from another shelf.
          </p>
        </div>
      )}

      {rows.map((rowBooks, rowIndex) => (
        <div key={rowIndex} className="shelf-row">
          <div className="shelf-grid">
            {rowBooks.map((book) => (
              <ShelfCard
                key={book.id}
                book={book}
                onDelete={handleRemoveBook}
                allShelves={shelves}
                currentShelfId={activeId}
                onAddToShelf={handleAddToShelf}
              />
            ))}
            {rowBooks.length < BOOKS_PER_ROW &&
              Array.from({ length: BOOKS_PER_ROW - rowBooks.length }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
          </div>
          <div className="shelf-plank" />
        </div>
      ))}
    </div>
  );
}
