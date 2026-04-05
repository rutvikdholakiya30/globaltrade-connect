import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Globe, ArrowRight, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Category, Product } from '@/src/types';
import ProductCard from '@/src/components/ProductCard';
import { cn } from '@/src/lib/utils';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, categories(*)')
          .eq('status', 'active');

        if (selectedCategory !== 'all') {
          query = query.eq('category_id', selectedCategory);
        }

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const productsWithCategory = data.map(p => ({
            ...p,
            category: p.categories
          }));
          setProducts(productsWithCategory);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    if (id === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', id);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <main className="pt-24 min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
              <p className="text-gray-500">Discover quality products for international trade and export.</p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                    selectedCategory === 'all' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-600 hover:bg-white hover:text-blue-600"
                  )}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      selectedCategory === category.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-600 hover:bg-white hover:text-blue-600"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-600 rounded-3xl text-white space-y-4">
              <h4 className="font-bold">Need a Custom Quote?</h4>
              <p className="text-sm text-blue-100 leading-relaxed">Contact our experts for bulk orders and customized trade solutions.</p>
              <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                Contact Us
              </button>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <p className="text-sm text-gray-500 font-medium">
              {products.length} Products Found
            </p>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-200">
                <Globe className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your search or category filters to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSearchParams({});
                  }}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      selectedCategory === 'all' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
