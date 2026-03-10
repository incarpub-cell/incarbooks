'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import ProductCard from '@/components/ProductCard';
import { PayPalButtons } from '@paypal/react-paypal-js';

function MembershipCheckout() {
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  if (status === 'success') {
    return (
      <div className="text-center py-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h4 className="font-bold text-slate-900 mb-2">Welcome to Pro!</h4>
        <p className="text-sm text-slate-500">Your membership is now active. Enjoy unlimited access to all content.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' }}
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
        onApprove={async (data) => {
          const res = await fetch(`/api/orders/${data.orderID}/capture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const details = await res.json();
          if (details.status === 'COMPLETED') {
            setStatus('success');
          } else {
            setStatus('failed');
            alert('❌ Payment was not completed.');
          }
        }}
        onCancel={() => setStatus('idle')}
        onError={() => {
          setStatus('failed');
          alert('❌ An error occurred. Please try again.');
        }}
      />
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching products: ", error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar to match Netlify */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold tracking-tight text-emerald-900">Incarbooks</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-emerald-600 transition-colors">Bestsellers</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Categories</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Membership</a>
            <a href="/admin" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold hover:bg-emerald-800 transition-all shadow-md">Start Reading</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - SaaS style */}
      <header className="relative pt-24 pb-32 px-4 overflow-hidden">
        <div className="hero-glow"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-8">
            <span className="animate-pulse">✨</span> Unlock Your Potential
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 leading-[1.1] mb-8">
            Knowledge That <br /> <span className="text-emerald-700">Transforms Your Life</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Unlimited access to premium eBooks, audiobooks, and exclusive digital courses. Read anywhere, anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-200/50">
              Join Incarbooks
            </button>
            <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
              Browse Library
            </button>
          </div>
        </div>
      </header>

      {/* Curated for Growth Section */}
      <section className="py-24 bg-white/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Curated for Growth</h2>
          <p className="text-slate-500 mb-16">Hand-picked content to supercharge your career and mindset.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📘', title: 'Expert eBooks', desc: 'In-depth guides tailored for modern professionals and creators.' },
              { icon: '🎧', title: 'Audio Summaries', desc: 'Listen to key insights on the go. Perfect for busy schedules.' },
              { icon: '💻', title: 'Digital Courses', desc: 'Interactive video lessons to master new skills rapidly.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products Section - Integrated into Layout */}
      <main id="collection" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 text-center md:text-left">Latest Releases</h2>
              <p className="text-slate-500 text-center md:text-left">Explore our newest digital manuscripts and publications.</p>
            </div>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-700"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
              <p className="font-serif italic text-emerald-900/60">The digital archives are being updated...</p>
            </div>
          )}
        </div>
      </main>

      {/* Pro Membership Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/10 flex flex-col md:flex-row border border-slate-100">
          <div className="flex-1 bg-emerald-900 p-12 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4 block">Unlimited Access</span>
            <h2 className="text-4xl font-bold mb-6">Pro Membership</h2>
            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-6xl font-black">$100</span>
              <span className="text-emerald-300 font-medium">/ year</span>
            </div>
            <ul className="space-y-4 text-emerald-50/80 mb-8">
              {['Access to 5,000+ eBooks', 'Offline reading & listening', 'Exclusive author webinars', 'New titles added weekly'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 p-12 md:p-16 flex flex-col justify-center text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Secure Checkout</h3>
            <p className="text-slate-500 mb-6">Start your reading journey in seconds.</p>
            <MembershipCheckout />
            <p className="text-[10px] text-slate-400 mt-4">🔒 Works on all devices. By subscribing, you agree to our Terms.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <span className="text-xl">📚</span>
            <span className="font-bold tracking-tight text-slate-900">Incarbooks</span>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">© 2026 Incarbooks Inc. Empowering minds efficiently.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
