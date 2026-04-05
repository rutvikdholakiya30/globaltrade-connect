import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, ArrowLeft, ShieldCheck, Zap, Truck, CheckCircle2, Mail, Phone, MessageSquare, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Product } from '@/src/types';
import { formatPrice, cn } from '@/src/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setProduct({
            ...data,
            category: data.categories
          });
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-[2rem]" />
          <div className="space-y-8">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded w-3/4" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <Globe className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="text-gray-500 mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="inline-flex items-center text-blue-600 font-bold hover:underline">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://picsum.photos/seed/product/800/800'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <main className="pt-24 pb-24 bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm font-medium text-gray-500">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-blue-600">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div 
              className="aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm cursor-pointer relative group"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold text-gray-900 shadow-2xl transform scale-95 group-hover:scale-100 transition-all">
                  View Full Screen
                </span>
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-8 gap-2 sm:gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                      activeImage === idx ? "border-blue-600 shadow-md" : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-10">
            <div className="space-y-4">
              {product.category && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  In Stock & Ready for Export
                </span>
              </div>
            </div>

            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-sm font-medium text-gray-500">{key}</span>
                      <span className="text-sm font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-700">Quality Assured</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-700">Global Shipping</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-700">Fast Inquiry</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/contact"
                className="flex-1 px-8 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Inquiry Now</span>
              </Link>
              <button className="flex-1 px-8 py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Call for Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section could go here */}
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            className="absolute top-6 right-6 p-3 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-8 h-8" />
          </button>
          
          {images.length > 1 && (
            <button 
              type="button"
              onClick={prevImage}
              className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 p-4 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <img 
            src={images[activeImage]} 
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />

          {images.length > 1 && (
            <button 
              type="button"
              onClick={nextImage}
              className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 p-4 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </main>
  );
}
