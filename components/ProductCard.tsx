'use client';

import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

export default function ProductCard({ product }: { product: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 max-w-[320px] mx-auto w-full"
            >
                {/* Modern Book Cover Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                    {product.coverUrl || product.imageUrl ? (
                        <img
                            src={product.coverUrl || product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-emerald-900 flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-4xl mb-4">📚</span>
                            <h4 className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] line-clamp-3 leading-tight">{product.title}</h4>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/40 transition-colors duration-500 flex items-center justify-center">
                        <span className="bg-white text-emerald-900 px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                            Preview manuscript
                        </span>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-emerald-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                            {product.category || 'Digital'}
                        </span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                        {product.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 font-medium italic">
                        {product.author || 'IncarBooks Editorial'}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Access Token</span>
                            <span className="text-lg font-black text-slate-900">${product.price}</span>
                        </div>
                        <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-all text-emerald-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
