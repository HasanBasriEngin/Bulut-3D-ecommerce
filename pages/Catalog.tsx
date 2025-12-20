import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Heart, ArrowLeft } from 'lucide-react'; // ArrowLeft ikonunu ekledik

interface CatalogProps {
    title: string;
    products: Product[];
    wishlistIds: number[];
    onBack: () => void;
    onProductSelect: (product: Product) => void;
    onToggleWishlist: (e: React.MouseEvent, product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ 
    title, 
    products, 
    wishlistIds, 
    onBack, 
    onProductSelect, 
    onToggleWishlist 
}) => {
    const categories = [
        "Tümü",
        "Figür & Karakter",
        "Dekorasyon",
        "Yılbaşı Özel",
        "Kahve Temalı Ürünler"
    ];

    const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'Tümü') return products;

        if (selectedCategory === 'Figür & Karakter') {
            return products.filter(p => p.categories.some(c => c === 'Figür' || c === 'Oyuncak' || c === 'Karakter'));
        }
        
        const searchKey = selectedCategory.split(' ')[0];
        return products.filter(p => p.categories.some(c => c.includes(searchKey)));
    }, [products, selectedCategory]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen">
            
            {/* --- YENİ EKLENEN ANA SAYFAYA DÖN BUTONU --- */}
            <button 
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Ana Sayfaya Dön
            </button>
            {/* ------------------------------------------ */}

            <div className="flex flex-col md:flex-row gap-8">
                
                {/* Sol Sidebar (Kategoriler) */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg">Kategoriler</h3>
                        <div className="flex flex-col space-y-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        selectedCategory === cat
                                        ? 'bg-brand-100 text-brand-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sağ Taraf (Ürün Grid) */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">{selectedCategory}</h2>
                    
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                            <p className="text-slate-400">Bu kategoride ürün bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <div 
                                    key={product.id}
                                    onClick={() => onProductSelect(product)}
                                    className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full border border-slate-100"
                                >
                                    {/* Ürün Görseli ve Badge'ler */}
                                    <div className="relative aspect-square overflow-hidden bg-slate-50">
                                        {product.categories.includes('Yılbaşı') && (
                                             <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-slate-700 z-10 uppercase tracking-wider">
                                                Yılbaşı Özel
                                            </span>
                                        )}
                                        {product.id === 1 && (
                                             <span className="absolute top-3 left-3 bg-blue-100 text-[10px] font-bold px-2 py-1 rounded text-blue-700 z-10 uppercase tracking-wider">
                                                YENİ
                                            </span>
                                        )}

                                        <button 
                                            onClick={(e) => onToggleWishlist(e, product)}
                                            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/60 hover:bg-white text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Heart size={18} className={wishlistIds.includes(product.id) ? "fill-red-500 text-red-500" : ""} />
                                        </button>

                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    
                                    {/* Ürün Bilgileri */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="mb-2">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{product.categories[0]}</p>
                                            <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-brand-600 transition-colors">{product.name}</h3>
                                        </div>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <span className="text-lg font-bold text-slate-700">{(product.basePrice ?? 0).toFixed(0)} TL</span>
                                            <button className="bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                                                İncele
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};