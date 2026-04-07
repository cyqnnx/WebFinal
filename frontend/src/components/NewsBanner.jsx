import { useEffect, useState } from 'react';
import api from '../lib/api.js';

export default function NewsBanner() {
  const [news, setNews] = useState([]);
  const [closedIds, setClosedIds] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await api.get('/api/news');
        setNews(res.data.news || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNews();
  }, []);

  function handleClose(id) {
    setClosedIds([...closedIds, id]);
  }

  const activeNews = news.filter((item) => !closedIds.includes(item._id));

  if (activeNews.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 pt-4 px-4">
      {activeNews.map((item) => (
        <div
          key={item._id}
          className="group relative flex min-h-[48px] items-center justify-between gap-4 rounded-xl border-2 border-black bg-[#39FF14] px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-2px] active:translate-y-[0px]"
        >
          <div className="flex-1 text-sm font-black text-black">
            {item.content}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-block rounded border border-black bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white"
              >
                Learn More
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleClose(item._id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white/40 text-black transition-colors hover:bg-black hover:text-[#39FF14]"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
