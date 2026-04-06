import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function OrdersDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await api.get('/api/orders/manage');
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load orders dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    try {
      await api.patch(`/api/orders/manage/${orderId}/status`, { status });
      toast.success('Order status updated');
      await loadOrders();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to update order status');
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
    <div>
      <h1 className="text-xl font-bold text-gray-900">Orders Dashboard</h1>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{o.drinkName}</div>
                <div className="text-xs text-gray-600">
                  Qty: {o.quantity} | Discount: {o.discount}% | User: {o.userId}
                </div>
                <div className="mt-1 flex flex-col border-l-2 border-gray-200 pl-2 text-xs text-gray-600">
                  <span>Address: {o.address}</span>
                  <span>Phone: {o.phone}</span>
                  {o.notes && <span>Notes: {o.notes}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-700">Status:</span>
                <select
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                >
                  <option value="waiting">waiting</option>
                  <option value="paid">paid</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

