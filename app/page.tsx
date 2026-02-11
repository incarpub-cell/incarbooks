import { SAMPLE_PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            DigitalStore
          </h1>
          <nav>
            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">Sign In</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Unlock Your Potential with <br className="hidden sm:block" />
            <span className="text-blue-600">Premium Digital Assets</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Curated guides, templates, and tools to accelerate your success. Instant download, secure payment, lifetime access.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#products" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-transform hover:-translate-y-1">
              Browse Collection
            </a>
            <a href="#" className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-200 transition-colors">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section id="products" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h3>
            <p className="text-gray-500 max-w-xl mx-auto">Discover our best-selling digital resources designed to help you achieve more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {SAMPLE_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals / Features */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">⚡</div>
            <h4 className="text-lg font-bold mb-2">Instant Download</h4>
            <p className="text-gray-500">Get immediate access to your files after purchase.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🔒</div>
            <h4 className="text-lg font-bold mb-2">Secure Payment</h4>
            <p className="text-gray-500">Processed securely via PayPal. Your data is safe.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">∞</div>
            <h4 className="text-lg font-bold mb-2">Lifetime Access</h4>
            <p className="text-gray-500">Download your purchases anytime, anywhere.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-white">DigitalStore</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Digital Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
