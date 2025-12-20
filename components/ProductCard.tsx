import React from 'react';
import { Product } from '../types';
import { Star, Plus, Heart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    isWishlisted?: boolean;
    onToggleWishlist?: (e: React.MouseEvent, product: Product) => void;
    onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isWishlisted = false, onToggleWishlist, onClick }) => {
    return (
        <div 
            onClick={() => onClick(product)}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
        >
            {/* Wishlist Button */}
            <button 
                onClick={(e) => onToggleWishlist && onToggleWishlist(e, product)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-slate-400 hover:text-red-500 transition-all shadow-sm"
            >
                <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
            </button>

            <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full shadow-sm text-slate-700">
                    {product.categories[0]}
                </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{product.shortDescription}</p>
                    </div>
                </div>

                <div className="flex items-center mb-4">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium text-slate-700 ml-1">{product.rating}</span>
                    <span className="text-xs text-slate-400 ml-1">({product.reviewCount})</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Başlangıç</span>
                        <span className="text-lg font-bold text-slate-900">₺{product.basePrice.toFixed(0)}</span>
                    </div>
                    <button className="bg-slate-900 hover:bg-brand-600 text-white p-2 rounded-lg transition-colors shadow-lg shadow-slate-900/10">
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};