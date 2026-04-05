import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Globe, MoreVertical, Filter, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Product, Category } from '@/src/types';
import { formatDate, formatPrice, cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch products');
    } else if (data) {
      setProducts(data.map(p => ({ ...p, category: p.categories })));
    }
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', product.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Product marked as ${newStatus}`);
      setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus as any } : p));
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Management</h1>
          <p className="text-gray-500">Manage your global trade inventory and export catalog.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="px-6 py-3.5 bg-gray-50 text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Product Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Created At</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-48" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-24" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-20" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-16" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-24" /></td>
                    <td className="px-8 py-6 text-right"><div className="h-8 bg-gray-100 rounded-lg w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                          <img src={product.images?.[0] || 'https://picsum.photos/seed/p/100'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => toggleStatus(product)}
                        className={cn(
                          "inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                          product.status === 'active'
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {product.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{product.status}</span>
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-gray-400 font-medium">{formatDate(product.created_at)}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View on Website"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search or add a new product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
