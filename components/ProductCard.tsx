import Image from 'next/image';
import Link from 'next/link';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/products/${product.id}`} className="group block relative border border-gray-200 rounded-2xl p-4 transition-all hover:shadow-lg hover:border-blue-500 bg-white">
            <div className="aspect-[4/5] relative overflow-hidden rounded-xl bg-gray-100 mb-4">
                {/* Placeholder for real image or use a colored gradient for digital assets */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📄</span>
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{product.title}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">${product.price}</span>
                <span className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-colors">
                    View Details
                </span>
            </div>
        </Link>
    );
}
