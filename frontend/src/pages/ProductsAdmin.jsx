import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';

function EmptyForm() {
  return {
    name: '',
    price: '',
    discountPercent: '0',
    description: '',
    thumbnail: null,
    descriptionImages: [],
  };
}

export default function ProductsAdmin() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EmptyForm());
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  // explicitly figure out what is currently selected without using complicated hooks
  let selected = null;
  if (selectedId) {
    selected = products.find((p) => p._id === selectedId);
  }

  // Explicitly calculate the text for the submit button without using confusing nested ternaries
  let submitButtonText = 'Create Product';
  if (selected) {
    if (updating) {
      submitButtonText = 'Updating...';
    } else {
      submitButtonText = 'Update Product';
    }
  } else {
    if (saving) {
      submitButtonText = 'Creating...';
    } else {
      submitButtonText = 'Create Product';
    }
  }

  async function loadProducts(search = q, nextPage = page) {
    try {
      setLoading(true);
      const res = await api.get('/api/products', {
        params: { q: search, page: nextPage, limit: 10 },
      });
      setProducts(res.data.products || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts('', 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    setForm({
      name: selected.name || '',
      price: String(selected.price ?? ''),
      discountPercent: String(selected.discountPercent ?? 0),
      description: selected.description || '',
      thumbnail: null,
      descriptionImages: [],
    });
  }, [selected]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createProduct(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('price', String(Number(form.price)));
      fd.append('discountPercent', String(Number(form.discountPercent)));
      fd.append('description', form.description);
      if (form.thumbnail) fd.append('thumbnail', form.thumbnail);
      for (const f of form.descriptionImages) fd.append('descriptionImages', f);

      await api.post('/api/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product created');
      setForm(EmptyForm());
      await loadProducts(q, 1);
      setPage(1);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  }

  async function updateSelected(e) {
    e.preventDefault();
    if (!selectedId) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('price', String(Number(form.price)));
      fd.append('discountPercent', String(Number(form.discountPercent)));
      fd.append('description', form.description);
      if (form.thumbnail) fd.append('thumbnail', form.thumbnail);
      for (const f of form.descriptionImages) fd.append('descriptionImages', f);

      await api.patch(`/api/products/${selectedId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product updated');
      await loadProducts(q, page);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  }

  async function removeSelected() {
    if (!selectedId) return;
    if (!window.confirm('Delete this product?')) return;

    try {
      await api.delete(`/api/products/${selectedId}`);
      toast.success('Product deleted');
      setSelectedId(null);
      setForm(EmptyForm());
      const nextPage = page > 1 && products.length === 1 ? page - 1 : page;
      setPage(nextPage);
      await loadProducts(q, nextPage);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to delete product');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product name..."
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setPage(1);
              loadProducts(q, 1);
            }}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 lg:col-span-1">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">All Products</h2>
          <div className="max-h-[480px] space-y-2 overflow-auto pr-1">
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : products.length ? (
              products.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setSelectedId(p._id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    selectedId === p._id ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-600">{Math.round(p.price).toLocaleString('vi-VN')} VNĐ</div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-600">No products found.</div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
            <span>
              Page {pagination.page} / {pagination.totalPages} ({pagination.total} items)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  loadProducts(q, next);
                }}
                className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  loadProducts(q, next);
                }}
                className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">
            {selected ? `Edit Product: ${selected.name}` : 'Create New Product'}
          </h2>
          <form onSubmit={selected ? updateSelected : createProduct} className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Name"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                required
              />
            </div>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Discount %"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.discountPercent}
              onChange={(e) => updateField('discountPercent', e.target.value)}
            />
            <textarea
              rows={3}
              placeholder="Description"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs text-gray-700">
                Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateField('thumbnail', e.target.files?.[0] || null)}
                  className="rounded-lg border border-gray-200 px-2 py-2 text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs text-gray-700">
                Description Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => updateField('descriptionImages', Array.from(e.target.files || []))}
                  className="rounded-lg border border-gray-200 px-2 py-2 text-xs"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={saving || updating}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitButtonText}
              </button>
              {selected ? (
                <>
                  <button
                    type="button"
                    onClick={removeSelected}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(null);
                      setForm(EmptyForm());
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900"
                  >
                    New Product
                  </button>
                </>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

