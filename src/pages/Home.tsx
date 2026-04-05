import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Settings, FlaskConical, Shirt, Globe, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Category, Product } from '@/src/types';
import Hero from '@/src/components/Hero';
import ProductCard from '@/src/components/ProductCard';
import { motion } from 'motion/react';

const categoryIcons: Record<string, any> = {
  'Agriculture': Sprout,
  'Machinery': Settings,
  'Chemicals': FlaskConical,
  'Textile': Shirt,
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          supabase.from('categories').select('*').limit(4),
          supabase.from('products')
            .select('*, categories(*)')
            .eq('status', 'active')
            .limit(8)
            .order('created_at', { ascending: false })
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (productsRes.data) {
          const productsWithCategory = productsRes.data.map(p => ({
            ...p,
            category: p.categories
          }));
          setFeaturedProducts(productsWithCategory);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="bg-white">
      <Hero />

      {/* Categories Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Browse by Category</h2>
              <p className="text-gray-500 max-w-md">Explore our wide range of products across various industries.</p>
            </div>
            <Link to="/products" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 group transition-colors">
              <span>View All Categories</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.length > 0 ? categories.map((category) => {
              const Icon = categoryIcons[category.name] || Globe;
              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group bg-white p-8 rounded-3xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">High-quality {category.name.toLowerCase()} products for global export.</p>
                  <div className="flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </Link>
              );
            }) : (
              // Fallback categories if none in DB
              ['Agriculture', 'Machinery', 'Chemicals', 'Textile'].map((name) => {
                const Icon = categoryIcons[name] || Globe;
                return (
                  <div key={name} className="bg-white p-8 rounded-3xl border border-gray-100 opacity-50 grayscale">
                    <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">{name}</h3>
                    <p className="text-sm text-gray-300">Category coming soon...</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Featured Products</h2>
              <p className="text-gray-500 max-w-md">Our most popular and high-demand products currently available for export.</p>
            </div>
            <Link to="/products" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 group transition-colors">
              <span>View All Products</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="text-gray-500">Check back later for new arrivals.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section Preview */}
      <section className="py-24 bg-blue-600 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-700/50 skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
                <span>About GlobalTradeConnect</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Your Strategic Partner <br />
                in International Trade
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                With over a decade of experience, we provide end-to-end solutions for businesses looking to expand their global footprint. From sourcing to logistics, we handle the complexities so you can focus on growth.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">1500+</p>
                  <p className="text-blue-100 text-sm">Products Exported</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-blue-100 text-sm">Countries Served</p>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg"
              >
                Learn More About Us
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1000"
                  alt="Business Meeting"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl hidden sm:block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">Verified Trade</p>
                    <p className="text-sm text-gray-500">ISO 9001 Certified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Ready to Expand Your Business Globally?</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Connect with our trade experts today and get a customized quote for your import or export requirements.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                >
                  Contact Us Now
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all backdrop-blur-sm border border-white/10"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
