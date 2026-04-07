import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';

export default function NewsAdmin() {
  const [content, setContent] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);

  async function loadNews() {
    try {
      const res = await api.get('/api/news');
      setNewsList(res.data.news || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content || !untilDate) {
      toast.error('Content and Until Date are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/news', {
        content,
        untilDate: new Date(untilDate).toISOString(),
        link,
      });
      toast.success('News added successfully');
      setContent('');
      setUntilDate('');
      setLink('');
      loadNews();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to add news');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage News</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Add New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="Enter news content..."
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Link (Optional)</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Display Until</label>
              <input
                type="datetime-local"
                value={untilDate}
                onChange={(e) => setUntilDate(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Post News'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Active News</h2>
          <div className="space-y-3">
            {newsList.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No active news announcements.</p>
            ) : (
              newsList.map((item) => (
                <div key={item._id} className="rounded-lg border border-gray-100 bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-900">{item.content}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:underline">
                      {item.link}
                    </a>
                  )}
                  <div className="mt-2 text-[10px] text-gray-400">
                    Expires: {new Date(item.untilDate).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
