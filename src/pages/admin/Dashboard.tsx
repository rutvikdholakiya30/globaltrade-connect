import React, { useEffect, useState } from 'react';
import { Package, Layers, FileText, TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Clock, User } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Product, Category } from '@/src/types';
import { formatDate, formatPrice, cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    activePages: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const fetchPromise = Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('pages').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }).limit(5)
        ]);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Supabase fetch timeout!")), 3000)
        );

        const [productsRes, categoriesRes, pagesRes, recentRes] = await (Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as Promise<any>);

        if (productsRes.error) console.error("Products stat error:", productsRes.error);
        if (categoriesRes.error) console.error("Categories stat error:", categoriesRes.error);
        if (pagesRes.error) console.error("Pages stat error:", pagesRes.error);
        if (recentRes.error) console.error("Recent products stat error:", recentRes.error);

        setStats({
          products: productsRes.count || 0,
          categories: categoriesRes.count || 0,
          activePages: pagesRes.count || 0,
        });

        if (recentRes.data && Array.isArray(recentRes.data)) {
          setRecentProducts(recentRes.data.map(p => ({ ...p, category: p.categories })));
        }
      } catch (err) {
        alert("Dashboard fetch error: " + err.message);
        console.error("Dashboard fetchStats exception:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Categories', value: stats.categories, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Active Pages', value: stats.activePages, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100" />)}
    </div>
    <div className="h-96 bg-white rounded-3xl border border-gray-100" />
  </div>;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back to your trade management portal.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="flex items-center space-x-1 text-green-500 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.name}</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Products</h3>
            <Link to="/admin/products" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Product</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Price</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img src={product.images?.[0] || 'https://picsum.photos/seed/p/100'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-gray-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-gray-600">{product.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        product.status === 'active' ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                      )}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-gray-400 font-medium">{formatDate(product.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            System Activity
          </h3>
          <div className="space-y-8">
            {[
              { action: 'Product Updated', detail: 'Industrial Pump X-500', time: '2 mins ago', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
              { action: 'New Category', detail: 'Renewable Energy', time: '45 mins ago', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
              { action: 'Page Toggled', detail: 'Privacy Policy set to Active', time: '2 hours ago', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
              { action: 'Login Detected', detail: 'Admin session started', time: '5 hours ago', icon: User, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className={cn("p-2.5 rounded-xl shrink-0", activity.bg, activity.color)}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
