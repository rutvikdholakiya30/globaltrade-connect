import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Info } from 'lucide-react';
import { Product } from '@/src/types';
import { formatPrice, cn } from '@/src/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  key?: string | number;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const mainImage = product.images?.[0] || 'https://picsum.photos/seed/product/600/400';

  return (
    <div className={cn(
      "group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        {product.category && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {product.category.name}
          </span>
        )}
      </Link>

      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
