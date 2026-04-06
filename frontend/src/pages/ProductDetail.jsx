import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../lib/api.js';
import { getGuestId } from '../lib/guestId.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function calcFinalPrice(product) {
  const discountPercent = Number(product.discountPercent || 0);
  return product.price * (1 - discountPercent / 100);
}

export default function ProductDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${id}`);
        if (!alive) return;
        setProduct(res.data.product);
      } catch (err) {
        toast.error(err?.response?.data?.error?.message || 'Failed to load product');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [id]);

  async function addToCart() {
    if (!product) return;
    try {
      const guestId = getGuestId();
      await api.post('/api/cart/items', { drinkId: product._id, quantity: 1, guestId });
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to add to cart');
    }
  }

  if (loading) {
    return (
      <div className="mt-10 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return <div className="mt-8 text-sm text-gray-600">Product not found.</div>;
  }

  const finalPrice = calcFinalPrice(product);

  const images = [];
  if (product.thumbnailUrl) images.push(product.thumbnailUrl);
  if (product.descriptionImageUrls?.length) images.push(...product.descriptionImageUrls);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {images.length > 0 ? (
          <>
            <img
              src={images[activeImage] || images[0]}
              alt={product.name}
              className=" w-full aspect-[1] rounded-xl object-cover"
            />
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === idx ? 'border-gray-900 ring-2 ring-gray-900/20' : 'border-transparent'}`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-20 w-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
            No image available
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-[60px]"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-rose-500/20 blur-[60px]"></div>
        
        <div className="relative z-10 flex h-full flex-col">
          <div>
            <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Details
            </span>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{product.name}</h1>
            
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="bg-gradient-to-r from-gray-900 to-stone-600 bg-clip-text text-3xl font-extrabold text-transparent">
                {Math.round(finalPrice).toLocaleString('vi-VN')} VNĐ
              </span>
              {product.discountPercent ? (
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-inset ring-rose-200/50">
                  -{product.discountPercent}% OFF
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-base leading-relaxed text-gray-700">
              {product.description || 'A delicious and refreshing drink crafted perfectly for your taste buds.'}
            </p>
          </div>

          <div className="mt-auto pt-10">
            <button
              type="button"
              onClick={addToCart}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gray-900 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-gray-900/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-900/40 active:translate-y-0"
            >
              <span className="relative z-10 transition-transform group-hover:scale-105">Add to Order</span>
              <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-black opacity-0 transition-opacity group-hover:opacity-100"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

