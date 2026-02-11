import { SAMPLE_PRODUCTS } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PayPalCheckout from '@/components/PayPalCheckout'; // Import added

interface ProductPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: ProductPageProps) {
    const product = SAMPLE_PRODUCTS.find((p) => p.id === params.id);
    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.title} | DigitalStore`,
        description: product.description,
    };
}

// In Next.js 15, params is a Promise, but for now assuming typical Next.js 14 structured params unless otherwise specified.
// Actually, for dynamic routes in App Router, params is an object.
// Wait, for generateStaticParams it can be used for SSG. Since we have small data, let's use it.

export async function generateStaticParams() {
    return SAMPLE_PRODUCTS.map((product) => ({
        id: product.id,
    }));
}

export default function ProductPage({ params }: ProductPageProps) {
    const product = SAMPLE_PRODUCTS.find((p) => p.id === params.id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Product Image Side */}
                    <div className="bg-gray-100 aspect-square md:aspect-auto flex items-center justify-center relative p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                        <div className="relative z-10 text-9xl">📄</div>
                    </div>

                    {/* Product Details Side */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="mb-6">
                            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
                                ← Back to Store
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-4xl font-bold text-blue-600">${product.price}</span>
                                {/* Trust badge or secure payment icon could go here */}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <span className="mr-3 text-green-500">✓</span> Instant Download
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <span className="mr-3 text-green-500">✓</span> Lifetime Access
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <span className="mr-3 text-green-500">✓</span> Support via Email
                                </li>
                            </ul>

                            <PayPalCheckout amount={product.price} productTitle={product.title} />
                            <p className="text-center text-xs text-gray-400 mt-4">Secure payment via PayPal. 100% Satisfaction Guarantee.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
