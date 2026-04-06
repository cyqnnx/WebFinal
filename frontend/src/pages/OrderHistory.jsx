import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../lib/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function OrderHistory() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthed = Boolean(token);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  async function cancelOrder(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/api/order/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o)));
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to cancel order');
    }
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        if (!isAuthed) {
          toast.error('Please login to view your orders.');
          navigate('/');
          return;
        }
        const res = await api.get('/api/order');
        if (!alive) return;
        setOrders(res.data.orders || []);
      } catch (err) {
        toast.error(err?.response?.data?.error?.message || 'Failed to load orders');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="mt-10 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Order History</h1>

      {orders.length ? (
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">{o.drinkName}</div>
                  <div className="mt-1 flex flex-col gap-1 text-xs text-gray-600">
                    <div>Qty: {o.quantity} | Discount: {o.discount}%</div>
                    <div className="font-medium text-gray-700">Delivery Info:</div>
                    <div className="flex flex-col border-l-2 border-gray-200 pl-2">
                      <span>Address: {o.address}</span>
                      <span>Phone: {o.phone}</span>
                      {o.notes && <span>Notes: {o.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-900">{o.status}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </div>
                  {o.status === 'waiting' && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(o._id)}
                      className="mt-2 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          No orders yet.
        </div>
      )}
    </div>
  );
}

