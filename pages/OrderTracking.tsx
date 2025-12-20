import React, { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingProps {
    orders: Order[]; // Gerçek uygulamada API'den çekilir, şimdilik mock datayı app'ten alalım
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orders }) => {
    const [orderNumber, setOrderNumber] = useState('');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundOrder(null);

        const order = orders.find(o => o.orderNumber === orderNumber.trim());

        if (order) {
            setFoundOrder(order);
        } else {
            setError('Böyle bir sipariş numarası bulunamadı. Lütfen kontrol edip tekrar deneyin.');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Hazırlanıyor': return <Package size={32} className="text-amber-500" />;
            case 'Baskı Aşamasında': return <Clock size={32} className="text-blue-500" />;
            case 'Kargoya Verildi': return <Truck size={32} className="text-purple-500" />;
            case 'Teslim Edildi': return <CheckCircle size={32} className="text-green-500" />;
            case 'İptal Edildi': return <XCircle size={32} className="text-red-500" />;
            default: return <Package size={32} className="text-gray-500" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Sipariş Takibi</h1>
                <p className="text-slate-500">Sipariş numaranızı girerek kargonuzun durumunu sorgulayabilirsiniz.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Sipariş No (Örn: BLT-2024-001)"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white text-slate-900 placeholder-slate-400"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Sorgula
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-3 ml-1">{error}</p>}
            </div>

            {foundOrder && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sipariş No</p>
                            <p className="text-xl font-bold text-slate-900">{foundOrder.orderNumber}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarih</p>
                             <p className="text-sm font-medium text-slate-900">{foundOrder.date}</p>
                        </div>
                    </div>
                    
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 p-4 bg-slate-50 rounded-full">
                            {getStatusIcon(foundOrder.status)}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{foundOrder.status}</h2>
                        <p className="text-slate-500 mb-6">Siparişiniz şu an bu aşamada.</p>
                        
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div 
                                className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: 
                                    foundOrder.status === 'Hazırlanıyor' ? '25%' :
                                    foundOrder.status === 'Baskı Aşamasında' ? '50%' :
                                    foundOrder.status === 'Kargoya Verildi' ? '75%' :
                                    foundOrder.status === 'Teslim Edildi' ? '100%' : '0%'
                                }}
                            ></div>
                        </div>
                        
                        <div className="w-full flex justify-between text-xs text-slate-400 font-medium mt-1 px-1">
                            <span>Hazırlanıyor</span>
                            <span>Baskı</span>
                            <span>Kargo</span>
                            <span>Teslim</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};