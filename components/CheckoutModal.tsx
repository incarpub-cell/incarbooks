'use client';

import { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface CheckoutModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ product, isOpen, onClose }: CheckoutModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1E293B]/80 backdrop-blur-md">
      <div className="bg-[#FDFCF8] rounded-sm overflow-hidden max-w-lg w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-[#E5E5E5] animate-in fade-in zoom-in duration-300">

        {/* Modal Header */}
        <div className="p-8 border-b border-[#E5E5E5] flex justify-between items-center bg-white">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37] block mb-1">Secure Checkout</span>
            <h3 className="text-2xl font-serif font-bold text-[#1E293B]">Complete Your Acquisition</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#1E293B] transition-colors p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {paymentStatus !== 'success' ? (
            <>
              {/* Product Brief */}
              <div className="flex gap-8 mb-10 pb-8 border-b border-dashed border-[#E5E5E5]">
                <div className="w-24 h-32 bg-[#F0EBE0] rounded-sm shadow-md overflow-hidden flex-shrink-0 border border-gray-200">
                  {product.coverUrl || product.imageUrl ? (
                    <img src={product.coverUrl || product.imageUrl} className="w-full h-full object-cover" alt={product.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-serif font-bold text-[#1E293B] text-xl mb-1">{product.title}</h4>
                  <p className="text-sm italic font-serif text-[#6B7280] mb-4">by {product.author || 'IncarBooks Author'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#1E293B] text-white px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm">Digital Edition</span>
                    <span className="text-2xl font-bold text-[#1E293B]">${product.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-[#4B5563] mb-6">Select a secure payment method to finalize your purchase:</p>
                  <div className="max-w-sm mx-auto">
                    <PayPalButtons
                      style={{ layout: "vertical", shape: "rect", color: "gold", label: "checkout" }}
                      createOrder={async () => {
                        setPaymentStatus('processing');
                        try {
                          const res = await fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              cart: [{ id: product.id, price: product.price }]
                            })
                          });

                          if (!res.ok) throw new Error(`Server error: ${res.status}`);

                          const order = await res.json();
                          return order.id;
                        } catch (err) {
                          setPaymentStatus('failed');
                          console.error("PayPal Order Error:", err);
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
                          console.error("Capture Error:", err);
                          alert("❌ Error processing payment capture.");
                        }
                      }}
                      onCancel={() => setPaymentStatus('idle')}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-center text-[#9CA3AF] italic">
                  Your purchase is governed by the IncarBooks Digital License Agreement. <br />
                  Instant access will be provided upon successful authentication.
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
                ✓
              </div>
              <h4 className="text-3xl font-serif font-bold text-[#1E293B] mb-4">Acquisition Complete</h4>
              <p className="text-[#4B5563] mb-10 max-w-sm mx-auto leading-relaxed">
                Thank you for supporting literary excellence. Your digital edition of <span className="font-bold underline decoration-[#D4AF37] decoration-2 underline-offset-4">{product.title}</span> is now ready for collection.
              </p>

              <div className="space-y-4">
                <a
                  href={downloadUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#1E293B] text-white py-4 rounded-sm font-bold tracking-widest hover:bg-[#0F172A] transition-all shadow-lg text-sm uppercase"
                >
                  📥 Download Your Manuscript
                </a>
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-[#6B7280] hover:text-[#1E293B] transition-colors"
                >
                  Return to the Gallery
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-[#F8F9FA] border-t border-[#E5E5E5] flex justify-center items-center gap-4 grayscale opacity-60">
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-tighter">Powered By</span>
          <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-4" />
          <span className="w-px h-3 bg-gray-300"></span>
          <span className="text-[10px] font-serif italic text-gray-400">IncarBooks Publishing House</span>
        </div>
      </div>
    </div>
  );
}
