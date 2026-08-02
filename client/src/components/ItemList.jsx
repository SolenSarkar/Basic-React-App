import React, { useState, useEffect, useCallback, useRef } from 'react';

// API base URL:
// - If VITE_API_URL is set (e.g. a hosted backend on Render/Railway), use it.
// - Otherwise fall back to a relative '/api' path (works in local dev via the
//   Vite proxy to http://localhost:5000).
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Client-side validation state
  const [formErrors, setFormErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Search state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Toast / success feedback
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Show an auto-dismissing toast message
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Clear toast on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Fetch items from the API
  const fetchItems = useCallback(async (searchTerm = '', pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: pageNum, limit });
      if (searchTerm) params.set('search', searchTerm);
      const res = await fetch(`${API_URL}/items?${params}`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data.items);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Validate a new-item field
  const validateField = (field, value) => {
    if (!value.trim()) {
      return `${field === 'name' ? 'Name' : 'Description'} is required`;
    }
    if (value.trim().length < 3) {
      return `${field === 'name' ? 'Name' : 'Description'} must be at least 3 characters`;
    }
    return '';
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchItems(searchInput, 1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    fetchItems('', 1);
  };

  // Handle form submission to create a new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateField('name', name);
    const descErr = validateField('description', description);

    if (nameErr || descErr) {
      setFormErrors({ name: nameErr, description: descErr });
      return;
    }
    setFormErrors({});

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create item');
      }

      const newItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
      setTotal((prev) => prev + 1);
      setName('');
      setDescription('');
      showToast('✅ Item added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting an item
  const handleDelete = async (id, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete item');
      }

      const remaining = items.filter((item) => item._id !== id);
      setItems(remaining);
      setTotal((prev) => prev - 1);

      // Pagination edge case: if the current page is now empty and we're
      // not on the first page, move back one page.
      if (remaining.length === 0 && page > 1) {
        fetchItems(search, page - 1);
      } else {
        setTotalPages((prev) => (remaining.length === 0 && prev > 1 ? prev - 1 : prev));
      }

      showToast('🗑️ Item deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Start editing an item
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditErrors({});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setEditErrors({});
  };

  // Save edited item
  const handleSaveEdit = async (id) => {
    const nameErr = validateField('name', editName);
    const descErr = validateField('description', editDescription);

    if (nameErr || descErr) {
      setEditErrors({ name: nameErr, description: descErr });
      return;
    }
    setEditErrors({});

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update item');
      }

      const updatedItem = await res.json();
      setItems((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
      cancelEdit();
      showToast('💾 Item updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Pagination handlers
  const goToPage = (pageNum) => {
    fetchItems(search, pageNum);
  };

  return (
    <div>
      {/* --- Toast Message --- */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      {/* --- Search Bar --- */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="🔍 Search items by name or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
        {search && (
          <button type="button" className="clear-btn" onClick={clearSearch}>
            ✕ Clear
          </button>
        )}
      </form>

      {/* --- Add Item Form --- */}
      <form className="item-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {formErrors.name && <span className="field-error">{formErrors.name}</span>}
        <textarea
          placeholder="Item description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {formErrors.description && (
          <span className="field-error">{formErrors.description}</span>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : '➕ Add Item'}
        </button>
      </form>

      {/* --- Items List --- */}
      <div className="items-container">
        <h2>
          📋 Items
          {total > 0 && <span className="item-count">({total} total)</span>}
        </h2>

        {loading && <div className="loading">Loading items...</div>}
        {error && <div className="error">❌ {error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="empty">
            {search ? 'No items match your search.' : 'No items yet. Add one above!'}
          </div>
        )}

        {!loading &&
          !error &&
          items.map((item) => (
            <div className="item-card" key={item._id}>
              {editingId === item._id ? (
                /* --- Edit Mode --- */
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Item name"
                  />
                  {editErrors.name && (
                    <span className="field-error">{editErrors.name}</span>
                  )}
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Item description"
                  />
                  {editErrors.description && (
                    <span className="field-error">{editErrors.description}</span>
                  )}
                  <div className="edit-actions">
                    <button
                      className="save-btn"
                      onClick={() => handleSaveEdit(item._id)}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* --- Display Mode --- */
                <>
                  <div className="item-card-header">
                    <h3>{item.name}</h3>
                    <div className="card-actions">
                      <button
                        className="edit-btn"
                        onClick={() => startEdit(item)}
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item._id, item.name)}
                        title="Delete item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p>{item.description}</p>
                  <div className="item-date">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </>
              )}
            </div>
          ))}

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={page <= 1 || loading}
              onClick={() => goToPage(page - 1)}
            >
              ◀ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  className={pageNum === page ? 'active' : ''}
                  onClick={() => goToPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              disabled={page >= totalPages || loading}
              onClick={() => goToPage(page + 1)}
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemList;

