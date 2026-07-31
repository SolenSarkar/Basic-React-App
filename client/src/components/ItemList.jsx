import React, { useState, useEffect, useCallback } from 'react';

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch items from the API
  const fetchItems = useCallback(async (searchTerm = '', pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: pageNum, limit });
      if (searchTerm) params.set('search', searchTerm);
      const res = await fetch(`/api/items?${params}`);
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
    if (!name.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) throw new Error('Failed to create item');

      const newItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
      setTotal((prev) => prev + 1);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting an item
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems((prev) => prev.filter((item) => item._id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err.message);
    }
  };

  // Start editing an item
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditDescription(item.description);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  // Save edited item
  const handleSaveEdit = async (id) => {
    if (!editName.trim() || !editDescription.trim()) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });

      if (!res.ok) throw new Error('Failed to update item');

      const updatedItem = await res.json();
      setItems((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
      cancelEdit();
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
      <form className="item-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Item description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
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
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Item description"
                  />
                  <div className="edit-actions">
                    <button
                      className="save-btn"
                      onClick={() => handleSaveEdit(item._id)}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>
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
                        onClick={() => handleDelete(item._id)}
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
              disabled={page <= 1}
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
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              disabled={page >= totalPages}
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

