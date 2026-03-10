'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('19.99');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Literature');
  const [coverBase64, setCoverBase64] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true') {
      setIsLoggedIn(true);
      fetchProducts();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminAuth', 'true');
      fetchProducts();
    } else {
      alert('Security violation: Incorrect token.');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setCoverBase64(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      await addDoc(collection(db, "products"), {
        title,
        author,
        price: parseFloat(price),
        description,
        category,
        coverUrl: coverBase64,
        fileUrl: fileUrl || "https://incarbooks-cdn.com/manuscripts/master-demo.pdf",
        createdAt: serverTimestamp()
      });
      alert('✅ Digital manuscript successfully archived.');
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Critical Error: Failed to archive.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setPrice('19.99');
    setDescription('');
    setCoverBase64('');
    setFileUrl('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this archive?')) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg text-center">
          <div className="text-4xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Incarbooks Portal</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-12">Internal Access Only</p>
          <form onSubmit={handleLogin} className="space-y-6 text-left max-w-xs mx-auto">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Security Token</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Admin Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-700 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">IB</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Curator Dashboard</h1>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Master Administrator</p>
          </div>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('adminAuth');
            setIsLoggedIn(false);
          }}
          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-emerald-700">✍️</span> New Manuscript
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Leading Author</label>
                  <input required value={author} onChange={e => setAuthor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Price ($)</label>
                    <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500">
                      <option>Literature</option>
                      <option>Self-Improvement</option>
                      <option>Technology</option>
                      <option>Philosophy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Description</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleCoverUpload} id="cover-form" className="hidden" />
                    <label htmlFor="cover-form" className="w-full bg-emerald-50 border-2 border-dashed border-emerald-200 py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all rounded-xl">
                      <span className="text-xl">🖼️</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1">Cover</span>
                    </label>
                  </div>
                  <div className="flex-1">
                    <input type="file" accept=".pdf,.epub" onChange={() => setFileUrl("https://incarbooks-cdn.com/manuscripts/master-demo.pdf")} id="file-form" className="hidden" />
                    <label htmlFor="file-form" className="w-full bg-emerald-50 border-2 border-dashed border-emerald-200 py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all rounded-xl">
                      <span className="text-xl">📄</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1">E-book</span>
                    </label>
                  </div>
                </div>
              </div>

              <button disabled={uploading} className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-[0.98] disabled:opacity-50">
                {uploading ? 'Archiving...' : 'Publish to Collection'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-emerald-700">📚</span> Active Library
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">{products.length} Units</span>
            </div>

            {loading ? (
              <div className="p-20 text-center text-slate-300 italic">Authenticating archives...</div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Work</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Metadata</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fair Value</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-slate-100 flex-shrink-0 rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-cover bg-center" style={{ backgroundImage: item.coverUrl ? `url(${item.coverUrl})` : 'none' }}>
                              {!item.coverUrl && <div className="w-full h-full flex items-center justify-center text-xs opacity-20">📖</div>}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-xs font-semibold text-slate-600">{item.author}</td>
                        <td className="p-6 text-sm font-black text-slate-900">${item.price}</td>
                        <td className="p-6">
                          <button onClick={() => handleDelete(item.id)} className="w-10 h-10 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center font-serif italic text-slate-400">Archives are currently dormant. No manuscripts found.</div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">
        IncarBooks Intelligence Portal • Secure Management Environment
      </footer>
    </div>
  );
}
