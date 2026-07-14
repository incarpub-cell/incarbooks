'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
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
  const [coverFileName, setCoverFileName] = useState('');
  const [ebookFileName, setEbookFileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');

  // Extended Details
  const [promoImageBase64, setPromoImageBase64] = useState('');
  const [promoFileName, setPromoFileName] = useState('');
  const [authorIntro, setAuthorIntro] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [language, setLanguage] = useState('English');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [isbn, setIsbn] = useState('');

  // Firebase Auth state listener
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        fetchProducts();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setLoginError('Incorrect email or password.');
      } else {
        setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setProducts([]);
  };

  const fetchProducts = async () => {
    if (!db) {
      console.error("Firestore database is not initialized.");
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db!, "products"), orderBy("createdAt", "desc"));
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
      setCoverFileName(file.name);
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

  const handlePromoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPromoImageBase64(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEbookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEbookFileName(file.name);
      setFileUrl("https://incarbooks-cdn.com/manuscripts/master-demo.pdf");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      alert('Error: Database connection lost.');
      return;
    }
    setUploading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db!, "products", editingId), {
          title,
          author,
          price: parseFloat(price),
          description,
          category,
          coverUrl: coverBase64,
          fileUrl: fileUrl || "https://incarbooks-cdn.com/manuscripts/master-demo.pdf",
          promoImageUrl: promoImageBase64,
          authorIntro,
          publisher,
          publishDate,
          language,
          fileFormat,
          isbn,
          updatedAt: serverTimestamp()
        });
        alert('✅ Archive updated successfully.');
      } else {
        await addDoc(collection(db!, "products"), {
          title,
          author,
          price: parseFloat(price),
          description,
          category,
          coverUrl: coverBase64,
          fileUrl: fileUrl || "https://incarbooks-cdn.com/manuscripts/master-demo.pdf",
          promoImageUrl: promoImageBase64,
          authorIntro,
          publisher,
          publishDate,
          language,
          fileFormat,
          isbn,
          createdAt: serverTimestamp()
        });
        alert('✅ Digital manuscript successfully archived.');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Critical Error: Failed to archive.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setTitle(product.title);
    setAuthor(product.author);
    setPrice(product.price ? product.price.toString() : '0');
    setDescription(product.description || '');
    setCategory(product.category || 'Literature');
    setCoverBase64(product.coverUrl || '');
    setFileUrl(product.fileUrl || '');
    setCoverFileName(product.coverUrl ? 'Existing Cover Retained' : '');
    setEbookFileName(product.fileUrl ? 'Existing E-book Retained' : '');

    setPromoImageBase64(product.promoImageUrl || '');
    setPromoFileName(product.promoImageUrl ? 'Existing Promo Retained' : '');
    setAuthorIntro(product.authorIntro || '');
    setPublisher(product.publisher || '');
    setPublishDate(product.publishDate || '');
    setLanguage(product.language || 'English');
    setFileFormat(product.fileFormat || 'PDF');
    setIsbn(product.isbn || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setPrice('19.99');
    setDescription('');
    setCoverBase64('');
    setFileUrl('');
    setCoverFileName('');
    setEbookFileName('');
    setPromoImageBase64('');
    setPromoFileName('');
    setAuthorIntro('');
    setPublisher('');
    setPublishDate('');
    setLanguage('English');
    setFileFormat('PDF');
    setIsbn('');
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('Permanently delete this archive?')) {
      try {
        await deleteDoc(doc(db!, "products", id));
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-100 border-t-emerald-700"></div>
      </div>
    );
  }

  // Login Page
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg text-center">
          <div className="text-4xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Incarbooks Portal</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-12">Internal Access Only</p>
          <form onSubmit={handleLogin} className="space-y-6 text-left max-w-xs mx-auto">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="admin@incarbooks.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>
            )}
            <button className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredProducts = filterCategory === 'All'
    ? products
    : products.filter((item: any) => item.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Admin Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-700 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">IB</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight serif">Curator Dashboard</h1>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
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
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-xl font-bold flex items-center gap-2 serif">
                <span className="text-emerald-700">{editingId ? '✏️' : '✍️'}</span> {editingId ? 'Edit Manuscript' : 'New Manuscript'}
              </h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>

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
                      <option>Christianity</option>
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
                    <label htmlFor="cover-form" className={`w-full py-4 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl border-2 border-dashed ${coverFileName ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}>
                      <span className="text-xl">🖼️</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${coverFileName ? 'text-emerald-50' : 'text-emerald-700'}`}>{coverFileName ? 'Cover Selected' : 'Cover'}</span>
                      {coverFileName && <span className="text-[8px] text-emerald-100 mt-1 truncate w-[80%] text-center" title={coverFileName}>{coverFileName}</span>}
                    </label>
                  </div>
                  <div className="flex-1">
                    <input type="file" accept=".pdf,.epub" onChange={handleEbookUpload} id="file-form" className="hidden" />
                    <label htmlFor="file-form" className={`w-full py-4 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl border-2 border-dashed ${ebookFileName ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}>
                      <span className="text-xl">📄</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${ebookFileName ? 'text-emerald-50' : 'text-emerald-700'}`}>{ebookFileName ? 'E-book Selected' : 'E-book'}</span>
                      {ebookFileName && <span className="text-[8px] text-emerald-100 mt-1 truncate w-[80%] text-center" title={ebookFileName}>{ebookFileName}</span>}
                    </label>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">Extended Metadata</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Publisher</label>
                      <input value={publisher} onChange={e => setPublisher(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 font-medium text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Publish Date</label>
                      <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 font-medium text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Language</label>
                      <input value={language} onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 font-medium text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Format (e.g., PDF)</label>
                      <input value={fileFormat} onChange={e => setFileFormat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 font-medium text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">ISBN</label>
                      <input value={isbn} onChange={e => setIsbn(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 font-medium text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Author Introduction</label>
                    <textarea rows={2} value={authorIntro} onChange={e => setAuthorIntro(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm" />
                  </div>

                  <div>
                    <input type="file" accept="image/*" onChange={handlePromoUpload} id="promo-form" className="hidden" />
                    <label htmlFor="promo-form" className={`w-full py-4 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl border-2 border-dashed ${promoFileName ? 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                      <span className="text-xl">📸</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${promoFileName ? 'text-indigo-50' : 'text-slate-500'}`}>{promoFileName ? 'Promo Image Selected' : 'Optional Promo Image'}</span>
                      {promoFileName && <span className="text-[8px] text-indigo-100 mt-1 truncate w-[80%] text-center" title={promoFileName}>{promoFileName}</span>}
                    </label>
                  </div>
                </div>
              </div>

              <button disabled={uploading} className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-[0.98] disabled:opacity-50">
                {uploading ? 'Processing...' : (editingId ? 'Update Manuscript' : 'Publish to Collection')}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2 serif">
                <span className="text-emerald-700">📚</span> Active Library
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-emerald-500 shadow-sm"
                >
                  <option value="All">All Categories</option>
                  <option value="Literature">Literature</option>
                  <option value="Self-Improvement">Self-Improvement</option>
                  <option value="Technology">Technology</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Christianity">Christianity</option>
                </select>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">{filteredProducts.length} Units</span>
              </div>
            </div>

            {loading ? (
              <div className="p-20 text-center text-slate-300 italic">Authenticating archives...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Work</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Metadata</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fair Value</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                      <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-slate-100 flex-shrink-0 rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-cover bg-center" style={{ backgroundImage: item.coverUrl ? `url(${item.coverUrl})` : 'none' }}>
                              {!item.coverUrl && <div className="w-full h-full flex items-center justify-center text-xs opacity-20">📖</div>}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-1">{item.title}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-xs font-semibold text-slate-600">{item.author}</td>
                        <td className="p-6 text-sm font-black text-slate-900">${item.price}</td>
                        <td className="p-6">
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-slate-200">
                            {item.category || 'N/A'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(item)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all rounded-xl flex items-center justify-center" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="w-10 h-10 bg-white border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all rounded-xl flex items-center justify-center" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center font-serif italic text-slate-400">No manuscripts found for this category.</div>
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
