import React from 'react';
import { Product } from '../types';
import { Gift, ChevronRight } from 'lucide-react';

interface ChristmasSliderProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    onViewAll?: () => void;
}

export const ChristmasSlider: React.FC<ChristmasSliderProps> = ({ products, onProductSelect, onViewAll }) => {
    const displayProducts = products.slice(0, 16);

    return (
        <div className="relative w-full h-full flex flex-col bg-[#1a0505] overflow-hidden">
            <div className="absolute inset-0 z-0">
                 <img 
                    src="https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=2000&auto=format&fit=crop" 
                    alt="Christmas Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-[#1a0505]/80 to-transparent"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1 animate-fade-in">
                            <Gift className="text-red-500" size={16} />
                            <span className="text-red-500 font-bold tracking-widest text-[10px] uppercase">Sezon İndirimi</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
                            Yılbaşı <span className="text-red-500">Kataloğu</span> 🎄
                        </h2>
                    </div>
                    {onViewAll && (
                        <button 
                            onClick={onViewAll}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 group"
                        >
                            Tümünü Gör
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full relative z-10 px-4 sm:px-6 lg:px-8 pb-4 overflow-hidden">
                <div className="h-full w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-4 gap-3 md:gap-5 overflow-y-auto lg:overflow-hidden no-scrollbar pb-20 lg:pb-0">
                    {displayProducts.map((product) => (
                        <div 
                            key={product.id}
                            onClick={() => onProductSelect(product)}
                            className="bg-[#7f1d1d]/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-amber-500/30 hover:ring-1 hover:ring-amber-400 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-2 border-amber-500/50 flex flex-row items-center h-24 md:h-40 lg:h-full w-full overflow-hidden shrink-0"
                        >
                            <div className="relative w-[60%] h-full flex-shrink-0">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-r-[2rem]" />
                            </div>
                            <div className="flex flex-col justify-center w-[40%] h-full overflow-hidden relative pl-2 md:pl-4 pr-2 py-2">
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold text-white text-[10px] md:text-sm lg:text-sm line-clamp-2 group-hover:text-amber-400 transition-colors leading-tight">{product.name}</h3>
                                </div>
                                <div className="mt-auto flex justify-between items-center pt-2 border-t border-amber-500/30 w-full">
                                    <span className="font-bold text-xs sm:text-lg text-amber-400">₺{product.basePrice.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};