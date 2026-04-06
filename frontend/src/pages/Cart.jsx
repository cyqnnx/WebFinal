import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../lib/api.js';
import { getGuestId } from '../lib/guestId.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function calcFinalPrice(item) {
  const discountPercent = Number(item.discountPercent || 0);
  return item.price * (1 - discountPercent / 100);
}

export default function Cart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('token');
  const isAuthed = Boolean(token);

  async function loadCart() {
    try {
      setLoading(true);
      const guestId = getGuestId();
      const res = isAuthed ? await api.get('/api/cart') : await api.get(`/api/cart?guestId=${guestId}`);
      setCart(res.data);
      
      // Explicitly check and set address if missing
      if (!address) {
        setAddress(res.data.address || '');
      }
      
      // Explicitly check and set phone if missing
      if (!phone) {
        setPhone(res.data.phone || '');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addOne(drinkId) {
    try {
      const guestId = getGuestId();
      await api.post('/api/cart/items', { drinkId, quantity: 1, guestId });
      await loadCart();
      toast.success('Updated cart');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to update cart');
    }
  }

  async function placeOrder() {
    if (!isAuthed) {
      toast.error('Please login to place an order.');
      return;
    }
    if (!address.trim() || !phone.trim()) {
      toast.error('Please provide an address and phone number.');
      return;
    }

    try {
      await api.post('/api/order', { address, phone, notes });
      toast.success('Order placed!');
      await loadCart();
      navigate('/my-orders');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to place order');
    }
  }

  // Calculate total explicitly using a standard loop without relying on complicated reduce abstractions or useMemo hooks
  let total = 0;
  if (cart && cart.items) {
    for (const item of cart.items) {
      total += calcFinalPrice(item) * item.quantity;
    }
  }

  if (loading) {
    return (
      <div className="mt-10 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>

        {cart?.items?.length ? (
          <div className="mt-4 space-y-3">
            {cart.items.map((it) => (
              <div key={it.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">{it.name}</div>
                  <div className="text-xs text-gray-600">
                    {Math.round(calcFinalPrice(it)).toLocaleString('vi-VN')} VNĐ x {it.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addOne(it.drinkId)}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                  >
                    +1
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
            Your cart is empty.
          </div>
        )}
      </div>

      <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-600">Total</div>
        <div className="mt-1 text-2xl font-bold text-gray-900">{Math.round(total).toLocaleString('vi-VN')} VNĐ</div>

        <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-900">Address *</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-900">Phone *</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-900">Notes (Optional)</span>
            <textarea
              className="min-h-[60px] rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={placeOrder}
          disabled={!cart?.items?.length}
          className="mt-5 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Place Order
        </button>
        <div className="mt-2 text-xs text-gray-500">
          Orders are created with `waiting` status and stored with a 30-day TTL.
        </div>
      </aside>
    </div>
  );
}

