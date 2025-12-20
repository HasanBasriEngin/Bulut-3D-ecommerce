import React from 'react';
import { X, Heart, ArrowRight, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    items: Product[];
    onRemoveItem: (e: React.MouseEvent, product: Product) => void;
    onProductSelect: (product: Product) => void;
}

export const WishlistSidebar: React.FC<WishlistSidebarProps> = ({ isOpen, onClose, items, onRemoveItem, onProductSelect }) => {
    return (
        <div className={`fixed inset-0 z-[60] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            
            {/* Panel */}
            <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Heart className="text-red-500 fill-red-500" />
                        <h2 className="text-lg font-bold text-slate-900">Favorilerim ({items.length})</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <Heart size={48} className="text-slate-300" />
                            <p className="text-slate-500 font-medium">Favori listeniz henüz boş.</p>
                            <button onClick={onClose} className="text-brand-600 hover:underline">Ürünleri Keşfet</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-red-100 hover:bg-red-50/30 transition-colors group">
                                <div className="h-20 w-20 flex-shrink-0 bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer" onClick={() => onProductSelect(item)}>
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="cursor-pointer" onClick={() => onProductSelect(item)}>
                                        <h4 className="font-semibold text-slate-900 truncate group-hover:text-red-600 transition-colors">{item.name}</h4>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.shortDescription}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-slate-900 font-bold">₺{item.basePrice.toFixed(0)}</span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => onRemoveItem(e, item)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100"
                                                title="Favorilerden Kaldır"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onProductSelect(item)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                İncele <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};