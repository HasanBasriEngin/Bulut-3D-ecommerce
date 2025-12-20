import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onRemoveItem: (cartId: string) => void;
    onUpdateQuantity: (cartId: string, delta: number) => void;
    onSetQuantity: (cartId: string, quantity: number) => void; 
    onCheckout: () => void;
}

// Renk kodlarını Türkçe isme çeviren yardımcı fonksiyon
const getColorName = (code: string) => {
    const map: Record<string, string> = {
        '#ef4444': 'Kırmızı', 'red': 'Kırmızı',
        '#3b82f6': 'Mavi', 'blue': 'Mavi',
        '#22c55e': 'Yeşil', 'green': 'Yeşil',
        '#a855f7': 'Mor', 'purple': 'Mor',
        'gold': 'Altın', '#ffd700': 'Altın',
        'silver': 'Gümüş', '#c0c0c0': 'Gümüş',
        '#1e293b': 'Koyu Slate', 'black': 'Siyah', '#000000': 'Siyah',
        '#ffffff': 'Beyaz', 'white': 'Beyaz',
        '#94a3b8': 'Gri', 'gray': 'Gri',
        '#78350f': 'Kahverengi', 'brown': 'Kahverengi',
        '#ea580c': 'Turuncu', 'orange': 'Turuncu',
        'yellow': 'Sarı'
    };
    return map[code] || map[code.toLowerCase()] || code;
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, onSetQuantity, onCheckout }) => {
    const total = items.reduce((sum, item) => {
        const itemPrice = item.product.basePrice + item.selectedVariant.priceModifier;
        return sum + (itemPrice * item.quantity);
    }, 0);

    const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        onClose();
        onCheckout();
    };

    const handleQuantityChange = (cartId: string, val: string) => {
        if (val === '') {
            onSetQuantity(cartId, 0); // Kullanıcı sildiğinde 0 yapıyoruz (görünümde boş gözükecek)
            return;
        }
        const num = parseInt(val);
        if (!isNaN(num) && num >= 0) {
            onSetQuantity(cartId, num);
        }
    };

    const handleBlur = (cartId: string, quantity: number) => {
        if (quantity === 0) {
            onSetQuantity(cartId, 1);
        }
    };

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
                        <ShoppingBag className="text-brand-600" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Sepetiniz</h2>
                            <p className="text-xs text-slate-500 font-medium">Toplam {totalItemCount} Ürün</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <ShoppingBag size={48} className="text-slate-300" />
                            <p className="text-slate-500 font-medium">Sepetiniz henüz boş.</p>
                            <button onClick={onClose} className="text-brand-600 hover:underline">Alışverişe Başla</button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const unitPrice = item.product.basePrice + item.selectedVariant.priceModifier;
                            const colorName = getColorName(item.selectedVariant.color);
                            // 0 ise input boş görünsün diye string'e çevirip kontrol ediyoruz
                            const displayValue = item.quantity === 0 ? '' : item.quantity.toString();

                            return (
                                <div key={item.cartId} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                                    <div className="h-24 w-24 flex-shrink-0 bg-white rounded-lg border border-slate-200 overflow-hidden">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 truncate">{item.product.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {item.selectedVariant.material} • {item.selectedVariant.size}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span 
                                                    className="w-3 h-3 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: item.selectedVariant.color }}
                                                />
                                                <span className="text-xs text-slate-500 capitalize">{colorName}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            {/* Quantity Controls - Manual Input */}
                                            <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 px-1 py-0.5 shadow-sm">
                                                <button 
                                                    onClick={() => onUpdateQuantity(item.cartId, -1)}
                                                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    className="w-8 text-center text-sm font-bold text-slate-900 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={displayValue}
                                                    onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
                                                    onBlur={() => handleBlur(item.cartId, item.quantity)}
                                                />
                                                <button 
                                                    onClick={() => onUpdateQuantity(item.cartId, 1)}
                                                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-brand-600 font-bold">₺{unitPrice.toFixed(2)}</span>
                                                <button 
                                                    onClick={() => onRemoveItem(item.cartId)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600 font-medium">Ara Toplam</span>
                        <span className="text-xl font-bold text-slate-900">₺{total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                        className="w-full bg-slate-900 hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                    >
                        Ödemeye Geç
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">
                        Güvenli Ödeme Altyapısı (iyzico)
                    </p>
                </div>
            </div>
        </div>
    );
};