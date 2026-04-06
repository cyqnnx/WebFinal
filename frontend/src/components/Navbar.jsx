import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../lib/api.js';
import { clearAuthSession, getRole, setAuthSession } from '../lib/auth.js';
import { getGuestId } from '../lib/guestId.js';

function AuthModal({ open, defaultMode = 'login', onClose, onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Directly calculate the string logic rather than relying on advanced React caching hooks
  let title = 'Create your account';
  if (mode === 'login') {
    title = 'Sign in to your account';
  }

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [open, defaultMode]);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const guestId = getGuestId();
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await api.post(endpoint, { email, password, guestId });
      setAuthSession({ token: res.data.token, role: res.data.user?.role });
      toast.success(mode === 'login' ? 'Signed in' : 'Account created');
      onLoggedIn();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Request failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === 'login' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === 'signup' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-900">Email</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-gray-900">Password</span>
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState('login');

  const isAuthed = Boolean(localStorage.getItem('token'));
  const role = getRole();

  function openAuth(mode) {
    setAuthDefaultMode(mode);
    setAuthOpen(true);
  }

  function logout() {
    clearAuthSession();
    toast.success('Logged out');
    
    // Give the user time to read the toast, then hard refresh application state
    setTimeout(() => {
      window.location.href = '/';
    }, 800);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/60 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="shrink-0 text-base font-bold text-gray-900 md:text-lg">
            Milk Tea Shop
          </Link>

          <nav className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Cart
            </NavLink>
            {role === 'admin' ? (
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }
              >
                Products
              </NavLink>
            ) : null}
            {(role === 'employee' || role === 'admin') ? (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }
              >
                Orders
              </NavLink>
            ) : null}
            {(isAuthed && role !== 'employee' && role !== 'admin') ? (
              <NavLink
                to="/my-orders"
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }
              >
                My Orders
              </NavLink>
            ) : null}
            {role === 'admin' ? (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }
              >
                Users
              </NavLink>
            ) : null}

            {isAuthed ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Sign up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        defaultMode={authDefaultMode}
        onClose={() => setAuthOpen(false)}
        onLoggedIn={() => {
          // Force a hard web navigation to refresh the entire app state
          setTimeout(() => {
            window.location.href = '/cart';
          }, 800);
        }}
      />
    </>
  );
}

