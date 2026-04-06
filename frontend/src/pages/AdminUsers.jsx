import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ROLES = ['guest', 'employee', 'admin'];

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await api.get('/api/users/permissions');
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function changeRole(id, role) {
    try {
      await api.patch(`/api/users/permissions/${id}`, { role });
      toast.success('User role updated');
      await loadUsers();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to update role');
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
      <h1 className="text-xl font-bold text-gray-900">User Management</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-200">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

