import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Info } from 'lucide-react';
import { Product } from '@/src/types';
import { formatPrice, cn, stripHtml } from '@/src/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  key?: string | number;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const mainImage = product.images?.[0] || 'https://picsum.photos/seed/product/600/400';

  return (
    <div className={cn(
      "group bg-white rounded-[1.5rem] lg:rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white",
      className
    )}>
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-white">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.category && (
          <span className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-white/95 backdrop-blur-md text-blue-600 text-[8px] lg:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-lg lg:rounded-full shadow-sm border border-gray-100/50">
            {product.category.name}
          </span>
        )}
      </Link>

      <div className="p-3 lg:p-5 space-y-2 lg:space-y-3">
        <div className="space-y-0.5 lg:space-y-1">
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="text-sm lg:text-lg font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors h-[2.5rem] lg:h-auto">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] lg:text-sm text-gray-500 line-clamp-1 lg:line-clamp-2 leading-relaxed">
            {stripHtml(product.description)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
             <span className="text-xs lg:text-lg font-black text-blue-600">
               {formatPrice(product.price)}
             </span>
             {product.price === null && (
                <span className="text-[8px] lg:text-[10px] font-bold text-gray-400 uppercase">Consulting</span>
             )}
          </div>
          <button
            type="button"
            className="p-1.5 lg:p-2.5 bg-gray-50 text-gray-600 rounded-lg lg:rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform active:scale-90"
          >
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
