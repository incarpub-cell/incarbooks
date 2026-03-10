'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { PayPalButtons } from '@paypal/react-paypal-js';
import ProductCard from '@/components/ProductCard';

function MembershipCheckout() {
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (status === 'success') {
    return (
      <div className="mt-4 p-4 rounded-lg text-center text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        📖 Subscription Activated! Happy Reading.
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="mt-4 p-4 rounded-lg text-center text-sm font-medium bg-red-50 text-red-700 border border-red-200">
        ⚠️ {statusMessage || 'Payment Failed. Please try again.'}
        <button onClick={() => setStatus('idle')} className="block mt-2 text-xs underline mx-auto hover:text-red-900">Try Again</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'checkout', height: 48 }}
        createOrder={async () => {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: [{ id: 'pro-membership', price: 100 }] }),
          });
          if (!res.ok) throw new Error('Failed to create order');
          const order = await res.json();
          return order.id;
        }}
        onApprove={async (data, actions) => {
          try {
            const res = await fetch(`/api/orders/${data.orderID}/capture`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            const details = await res.json();

            const errorDetail = Array.isArray(details.details) && details.details[0];
            if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED') {
              return actions.restart();
            }
            if (errorDetail) {
              throw new Error(`${errorDetail.description} (${details.debug_id})`);
            }

            if (details.status === 'COMPLETED' || details.id) {
              setStatus('success');
            } else {
              setStatus('failed');
              setStatusMessage('Payment was not completed.');
            }
          } catch (error: any) {
            setStatus('failed');
            setStatusMessage(error.message || 'Payment Failed. Please try again.');
          }
        }}
        onCancel={() => setStatus('idle')}
        onError={(err) => {
          console.error(err);
          setStatus('failed');
          setStatusMessage('An error occurred. Please try again.');
        }}
      />
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        // Suppress the distracting AbortError in development
        if (error.name === 'AbortError' || error.code === 'cancelled') return;
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <span className="font-bold text-xl tracking-tight text-emerald-900 serif">Incarbooks</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#featured" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">Bestsellers</a>
              <a href="#categories" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">Categories</a>
              <a href="#pricing" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">Membership</a>
            </div>
            <div>
              <a href="#pricing" className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-emerald-700/20">
                Start Reading
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-emerald-50 bg-[radial-gradient(#A7F3D0_1px,transparent_1px)] bg-[size:24px_24px] pt-32 pb-24 lg:pt-48 lg:pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6 border border-emerald-200">
            Unlock Your Potential 🚀
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-slate-900">
            Knowledge That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">Transforms Your Life</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Unlimited access to premium eBooks, audiobooks, and exclusive digital courses. Read anywhere, anytime.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#pricing" className="bg-emerald-700 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-emerald-800 transition-colors shadow-xl shadow-emerald-700/20">
              Join Incarbooks
            </a>
            <a href="#featured" className="px-8 py-3.5 rounded-full font-medium text-emerald-800 border border-emerald-200 bg-white hover:bg-emerald-50 transition-colors">
              Browse Library
            </a>
          </div>
        </div>
      </section>

      {/* Features / Categories Grid */}
      <section id="categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Curated for Growth</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Hand-picked content to supercharge your career and mindset.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">📘</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Expert eBooks</h3>
              <p className="text-slate-600 leading-relaxed">In-depth guides tailored for modern professionals and creators.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🎧</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Audio Summaries</h3>
              <p className="text-slate-600 leading-relaxed">Listen to key insights on the go. Perfect for busy schedules.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform">💻</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Digital Courses</h3>
              <p className="text-slate-600 leading-relaxed">Interactive video lessons to master new skills rapidly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers: dynamic products from Firebase */}
      <section id="featured" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest Bestsellers</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Directly from our digital archives, ready to read.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-700"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 opacity-60">
              <p className="italic">No digital content available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing / Checkout Section */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

            {/* Product Info */}
            <div className="p-10 md:p-12 md:w-1/2 bg-emerald-900 text-white flex flex-col justify-center relative overflow-hidden">
              {/* Deco Circles */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-teal-500 rounded-full blur-3xl opacity-20"></div>

              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-widest mb-2">Unlimited Access</h3>
                <h2 className="text-4xl font-bold mb-6">Pro Membership</h2>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold">$100</span>
                  <span className="text-emerald-200 ml-2">/ year</span>
                </div>
                <ul className="space-y-4 text-emerald-100">
                  <li className="flex items-center gap-3">
                    <span className="bg-emerald-800 p-1 rounded-full"><svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                    Access to 5,000+ eBooks
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-emerald-800 p-1 rounded-full"><svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                    Offline reading & listening
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-emerald-800 p-1 rounded-full"><svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                    Exclusive author webinars
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="bg-emerald-800 p-1 rounded-full"><svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                    New titles added weekly
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Form */}
            <div className="p-10 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2 font-serif">Secure Checkout</h3>
              <p className="text-slate-500 mb-8 text-sm">Start your reading journey in seconds.</p>

              <MembershipCheckout />

              <p className="text-xs text-slate-400 mt-6 text-center leading-relaxed">
                <span className="flex justify-center items-center gap-1 mb-2">🔒 Works on all devices</span>
                By subscribing, you agree to our Terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm flex flex-col items-center gap-4">
          <span className="text-2xl grayscale opacity-50">📚</span>
          <p>&copy; {new Date().getFullYear()} Incarbooks Inc. Empowering minds efficiently.</p>
        </div>
      </footer>
    </>
  );
}
