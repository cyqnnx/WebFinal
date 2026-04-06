import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { getGuestId } from '../lib/guestId.js';
import NoteCard from '../components/NoteCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function calcFinalPrice(product) {
  const discountPercent = Number(product.discountPercent || 0);
  return product.price * (1 - discountPercent / 100);
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const isAuthed = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get('/api/products');
        if (!alive) return;
        setProducts(res.data.products || []);
      } catch (err) {
        toast.error(err?.response?.data?.error?.message || 'Failed to load products');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function addToCart(productId) {
    try {
      const guestId = getGuestId();
      await api.post('/api/cart/items', { drinkId: productId, quantity: 1, guestId });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to add to cart');
    }
  }

  return (
    <div>
      <div className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-gray-800 to-stone-900 px-6 py-12 shadow-2xl sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-[80px]"></div>
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-rose-500/20 blur-[80px]"></div>
        <div className="relative z-10 flex flex-col items-start">
          <span className="mb-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-100 ring-1 ring-inset ring-white/20 backdrop-blur-sm sm:text-xs">
            Handcrafted Classics
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Our Menu
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-300 sm:text-base">
            Discover a premium selection of authentic milk teas, fresh fruit blends, and rich signature brews tailored to your taste.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => {
          const finalPrice = calcFinalPrice(p);
          return (
            <NoteCard
              key={p._id}
              to={`/products/${p._id}`}
              title={p.name}
              subtitle={null}
              thumbnailUrl={p.thumbnailUrl}
              footer={
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-[10px] font-bold uppercase tracking-widest text-transparent">
                        Price
                      </span>
                      <span className="text-sm font-extrabold text-gray-900">
                        {Math.round(finalPrice).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    {p.discountPercent ? (
                      <span className="flex items-center rounded-full bg-gradient-to-br from-rose-100 to-rose-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-rose-600 shadow-sm ring-1 ring-inset ring-rose-500/20">
                        -{p.discountPercent}%
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(p._id);
                    }}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-gray-900/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-900/40 active:translate-y-0"
                  >
                    <span className="relative z-10 transition-transform group-hover:scale-105">Add to Cart</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </button>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
}

