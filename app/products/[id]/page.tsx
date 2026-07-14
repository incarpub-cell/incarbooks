'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { PayPalButtons } from '@paypal/react-paypal-js';

export default function ProductPage() {
    const params = useParams();
    const id = params?.id as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // Review states
    const [reviewName, setReviewName] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewName || !reviewComment) return;
        setIsSubmittingReview(true);
        try {
            const newReview = {
                id: Date.now().toString(),
                name: reviewName,
                rating: parseInt(reviewRating.toString(), 10),
                comment: reviewComment,
                date: new Date().toISOString()
            };
            const docRef = doc(db!, "products", id);
            await updateDoc(docRef, {
                reviews: arrayUnion(newReview)
            });
            setProduct({ ...product, reviews: [newReview, ...(product.reviews || [])] });
            setReviewName('');
            setReviewComment('');
            setReviewRating(5);
            alert('✅ Review submitted successfully!');
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("❌ Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        if (!id || !db) return;

        const fetchProduct = async () => {
            try {
                const docRef = doc(db!, "products", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-700"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                <Link href="/" className="text-emerald-600 hover:text-emerald-800 underline">Return to Store</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans pb-24">
            {/* Simple Navbar */}
            <nav className="bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                    <span className="font-bold text-xl tracking-tight text-emerald-900 serif">Incarbooks</span>
                </Link>
                <Link href="/" className="text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors">
                    ← Back to Catalog
                </Link>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                {/* Breadcrumbs */}
                <div className="text-xs text-slate-500 mb-8 font-medium">
                    <Link href="/" className="hover:text-emerald-700">Home</Link>
                    <span className="mx-2">›</span>
                    <span>{product.category || 'Digital Library'}</span>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800">{product.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
                    {/* Left: Product Image */}
                    <div className="lg:col-span-4 flex justify-center">
                        <div className="w-full max-w-sm sticky top-32">
                            <div className="bg-[#F0EBE0] rounded-lg shadow-xl overflow-hidden border border-gray-200 relative p-4 flex items-center justify-center min-h-[400px]">
                                {product.coverUrl || product.imageUrl ? (
                                    <img src={product.coverUrl || product.imageUrl} className="w-full h-auto max-h-[500px] object-contain" alt={product.title} />
                                ) : (
                                    <div className="w-full stretch flex items-center justify-center text-6xl">📖</div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest text-emerald-800 shadow-sm">
                                    Digital Edition
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Details & Synopsis */}
                    <div className="lg:col-span-4 flex flex-col pt-4">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight mb-2">
                            {product.title}
                        </h1>
                        <p className="text-sm text-emerald-700 font-bold mb-6">
                            by <span className="underline decoration-emerald-200 underline-offset-4">{product.author || 'IncarBooks Editorial'}</span>
                        </p>

                        <div className="text-sm text-slate-500 mb-8 flex items-center gap-4">
                            <span className="flex items-center text-amber-500 text-lg">★★★★★ <span className="text-xs text-slate-400 ml-2">({product.reviews?.length || 0} reviews)</span></span>
                        </div>

                        <div className="border-t border-gray-100 pt-8 mt-2 space-y-12">
                            <div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Synopsis</h3>
                                <p className="text-slate-600 leading-loose text-sm whitespace-pre-wrap">
                                    {product.description || 'No detailed description available for this authentic digital manuscript.'}
                                </p>
                            </div>

                            {/* Promo Image */}
                            {product.promoImageUrl && (
                                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                                    <img src={product.promoImageUrl} alt="Promotional Content" className="w-full h-auto" />
                                </div>
                            )}

                            {/* Author Intro */}
                            {(product.authorIntro) && (
                                <div>
                                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">About the Author</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                                            {product.authorIntro}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Product Details */}
                            <div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Product Details</h3>
                                <div className="space-y-4 text-sm bg-white p-6 rounded-2xl border border-slate-100">
                                    {product.publisher && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-slate-400 font-medium tracking-tight">Publisher</div>
                                            <div className="text-slate-800 font-bold">{product.publisher}</div>
                                        </div>
                                    )}
                                    {product.publishDate && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-slate-400 font-medium tracking-tight">Publication Date</div>
                                            <div className="text-slate-800 font-bold">{product.publishDate}</div>
                                        </div>
                                    )}
                                    {product.language && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-slate-400 font-medium tracking-tight">Language</div>
                                            <div className="text-slate-800 font-bold">{product.language}</div>
                                        </div>
                                    )}
                                    {product.fileFormat && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-slate-400 font-medium tracking-tight">File Format</div>
                                            <div className="text-slate-800 font-bold">{product.fileFormat}</div>
                                        </div>
                                    )}
                                    {product.isbn && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-slate-400 font-medium tracking-tight">ISBN</div>
                                            <div className="text-slate-800 font-bold">{product.isbn}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Buy Box (Amazon style) */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 lg:p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                                    ${product.price}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start text-sm text-slate-600">
                                    <span className="text-emerald-600 mr-3 text-lg leading-none">✓</span>
                                    <span>Instant PDF/ePub Download</span>
                                </div>
                                <div className="flex items-start text-sm text-slate-600">
                                    <span className="text-emerald-600 mr-3 text-lg leading-none">✓</span>
                                    <span>Lifetime digital access</span>
                                </div>
                                <div className="flex items-start text-sm text-slate-600">
                                    <span className="text-emerald-600 mr-3 text-lg leading-none">✓</span>
                                    <span>Secure processing via PayPal</span>
                                </div>
                            </div>

                            {paymentStatus !== 'success' ? (
                                <div className="w-full">
                                    <PayPalButtons
                                        style={{ layout: "vertical", shape: "rect", color: "gold", label: "checkout", height: 48 }}
                                        createOrder={async () => {
                                            setPaymentStatus('processing');
                                            try {
                                                const res = await fetch("/api/orders", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ cart: [{ id: product.id, price: product.price }] })
                                                });
                                                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                                                return (await res.json()).id;
                                            } catch (err) {
                                                setPaymentStatus('failed');
                                                alert("❌ Failed to initiate transaction. Please try again.");
                                                throw err;
                                            }
                                        }}
                                        onApprove={async (data) => {
                                            try {
                                                const res = await fetch(`/api/orders/${data.orderID}/capture`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" }
                                                });
                                                const details = await res.json();
                                                if (details.status === "COMPLETED") {
                                                    setPaymentStatus('success');
                                                    setDownloadUrl(product.fileUrl || null);
                                                } else {
                                                    setPaymentStatus('failed');
                                                    alert("❌ Payment process was not completed successfully.");
                                                }
                                            } catch (err) {
                                                setPaymentStatus('failed');
                                                alert("❌ Error processing payment capture.");
                                            }
                                        }}
                                        onCancel={() => setPaymentStatus('idle')}
                                    />
                                </div>
                            ) : (
                                <div className="text-center animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                                    <h4 className="font-bold text-slate-900 mb-4">Payment Successful!</h4>
                                    <a
                                        href={downloadUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-700/20"
                                    >
                                        📥 Download Manuscript
                                    </a>
                                </div>
                            )}

                            <div className="mt-6 flex justify-center gap-2 grayscale opacity-40">
                                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm max-w-5xl mx-auto">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Customer Reviews</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Review Form */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Write a Review</h3>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Your Name</label>
                                    <input required value={reviewName} onChange={e => setReviewName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Rating</label>
                                    <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm text-amber-600 font-bold">
                                        <option value="5">★★★★★ (5/5)</option>
                                        <option value="4">★★★★☆ (4/5)</option>
                                        <option value="3">★★★☆☆ (3/5)</option>
                                        <option value="2">★★☆☆☆ (2/5)</option>
                                        <option value="1">★☆☆☆☆ (1/5)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Review</label>
                                    <textarea required rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm" />
                                </div>
                                <button type="submit" disabled={isSubmittingReview}
                                    className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50">
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>

                        {/* Review List */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Recent Testimonials</h3>
                            {(!product.reviews || product.reviews.length === 0) ? (
                                <p className="text-slate-400 italic text-sm">No reviews yet. Be the first to review this digital edition!</p>
                            ) : (
                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
                                    {product.reviews.map((r: any) => (
                                        <div key={r.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <strong className="text-slate-800 font-bold text-sm tracking-tight">{r.name}</strong>
                                                <span className="text-amber-500 text-sm">
                                                    {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-3">&quot;{r.comment}&quot;</p>
                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                                {new Date(r.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
