import React from 'react';
import { Product } from '../types';
import { Coffee, ChevronRight } from 'lucide-react';

interface CoffeeSliderProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    onViewAll?: () => void;
}

export const CoffeeSlider: React.FC<CoffeeSliderProps> = ({ products, onProductSelect, onViewAll }) => {
    return (
        <div className="relative w-full h-full flex flex-col bg-[#2c241b] overflow-hidden">
            <div className="absolute inset-0 z-0">
                 <img 
                    src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop" 
                    alt="Coffee Background"
                    className="w-full h-full object-cover opacity-40 sepia-[0.3]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2c241b] via-[#2c241b]/95 to-transparent"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1 animate-fade-in">
                            <Coffee className="text-amber-500" size={16} />
                            <span className="text-amber-500 font-bold tracking-widest text-[10px] sm:text-xs uppercase">Aksesuar & Hediye</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
                            Kahve Severler İçin <span className="text-amber-500">Anahtarlıklar</span> ☕
                        </h2>
                    </div>
                    {onViewAll && (
                        <button 
                            onClick={onViewAll}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 group"
                        >
                            Tümünü Gör
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
                <p className="text-amber-100/70 text-sm mt-1">3D yazıcı ile üretilmiş kahve konseptli koleksiyon.</p>
            </div>

            <div className="flex-1 w-full relative z-10 px-4 sm:px-6 lg:px-8 pb-8 overflow-hidden">
                <div className="h-full w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:grid-rows-3 gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden no-scrollbar pb-24 lg:pb-0">
                    {products.slice(0, 9).map((product) => (
                        <div 
                            key={product.id}
                            onClick={() => onProductSelect(product)}
                            className="bg-[#1a1512]/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-amber-900/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-amber-900/20 flex flex-row items-center h-24 md:h-40 lg:h-full w-full shrink-0"
                        >
                            <div className="relative w-[60%] h-full flex-shrink-0">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-r-[2rem]" />
                            </div>
                            <div className="flex flex-col justify-center w-[40%] h-full overflow-hidden relative pl-2 md:pl-4 pr-2 py-2">
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold text-white text-xs sm:text-lg line-clamp-2 group-hover:text-amber-500 transition-colors leading-tight">{product.name}</h3>
                                </div>
                                <div className="mt-auto flex justify-between items-center pt-2 border-t border-white/5 w-full">
                                    <span className="font-bold text-xs sm:text-xl text-amber-500">₺{product.basePrice.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};