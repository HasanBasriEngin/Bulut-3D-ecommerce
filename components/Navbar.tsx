import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, Search, User, LogIn, Heart, Truck, LayoutDashboard, X, Bell, Trash2, Info, Instagram, Cloud, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Buradaki yolun doğruluğundan emin ol

interface NavbarProps {
    cartItemCount: number;
    wishlistCount: number;
    onCartClick: () => void;
    onHomeClick: () => void;
    onLoginClick: () => void;
    onProfileClick: () => void;
    onWishlistClick: () => void;
    onOrderTrackingClick: () => void;
    onAdminClick: () => void;
    onCatalogClick: () => void;
    onKeychainsClick?: () => void;
    onSearch?: (query: string) => void;
}

interface Notification {
    id: number;
    text: string;
    isRead: boolean;
    date: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
    cartItemCount, 
    wishlistCount,
    onCartClick, 
    onHomeClick, 
    onLoginClick, 
    onProfileClick,
    onWishlistClick,
    onOrderTrackingClick,
    onAdminClick,
    onCatalogClick,
    onKeychainsClick,
    onSearch

}) => {
    // AuthContext'ten gerekli fonksiyonları çekiyoruz
    const { user, signInWithGoogle, signOut } = useAuth(); 
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [logoError, setLogoError] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, text: "Siparişiniz kargoya verildi! #BLT-2024-001", isRead: false, date: "2 dk önce" },
        { id: 2, text: "Yılbaşı indirimleri başladı. Sepetine göz at!", isRead: false, date: "1 saat önce" }
    ]);

    const marqueeMessages = [
        "🛠️ Kendi 3D model dosyanı yükle, hemen fiyat al!",
        "🚚 500TL ve üzeri alışverişlerde KARGO BEDAVA!",
        "🎄 Yılbaşına özel figürlerde %10 İNDİRİM!",
        "✨ Kişiye özel tasarımlarınız için hemen teklif alın.",
        "🎨 PLA, PETG ve TPU baskı seçenekleri.",
        "🚀 Hızlı Üretim & Güvenli Teslimat Garantisi."
    ];

    const seamlessMessages = [...marqueeMessages, ...marqueeMessages, ...marqueeMessages, ...marqueeMessages];

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);
    const handleLogout = async () => {
    await signOut(); // Supabase'den çıkış yap
    onHomeClick();   // Kullanıcıyı ana sayfaya yönlendir
};

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        if (isNotificationsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotificationsOpen]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery.trim());
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const deleteNotification = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <header className="sticky top-0 z-50 flex flex-col">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo Area */}
                        <div className="flex items-center cursor-pointer gap-3 group" onClick={onHomeClick}>
                            {!logoError ? (
                                <img 
                                    src="/logo.png" 
                                    alt="Bulut 3D Logo" 
                                    className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <div className="bg-brand-500 p-2 rounded-lg text-white group-hover:bg-brand-600 transition-colors">
                                    <Cloud size={24} strokeWidth={2.5} />
                                </div>
                            )}
                            <div>
                                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">BULUT 3D</span>
                                <span className="text-xs text-slate-500 font-medium tracking-wider">ATÖLYE & MARKET</span>
                            </div>
                        </div>

                        
    {/* Navbar.tsx - Masaüstü Menü Kısmı */}
<div className="hidden lg:flex space-x-6">
    <button onClick={onHomeClick} className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Ana Sayfa</button>
    <button onClick={onCatalogClick} className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Katalog</button>
    <button onClick={onKeychainsClick || onCatalogClick} className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Anahtarlıklar</button>
    <button onClick={onOrderTrackingClick} className="text-slate-600 hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
        <Truck size={16} /> Sipariş Takibi
    </button>

    {/* --- YENİ EKLENEN ADMİN BUTONU --- */}
    {user?.isAdmin && (
        <button 
            onClick={onAdminClick} 
            className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg transition-colors border border-red-100"
        >
            <LayoutDashboard size={16} /> 
            Yönetim Paneli
        </button>
    )}
    {/* ---------------------------------- */}
</div>

                      

                        {/* Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <a href="https://www.instagram.com/bulut3dbaski" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-pink-600 hidden sm:block">
                                <Instagram size={20} />
                            </a>

                            <button onClick={onWishlistClick} className="p-2 text-slate-500 hover:text-red-500 relative hidden sm:block">
                                <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
                                {wishlistCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>}
                            </button>

                            {/* Giriş Yapmış Kullanıcı mı? */}
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={onProfileClick}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
                                    >
                                        {/* Google Fotoğrafı Varsa Onu Göster */}
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Profil" className="w-7 h-7 rounded-full" />
                                        ) : (
                                            <div className="bg-brand-100 text-brand-600 p-1 rounded-full"><User size={18} /></div>
                                        )}
                                        <span className="text-sm font-medium hidden lg:block truncate max-w-[100px]">
                                            {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                                        </span>
                                    </button>
                                    <button onClick={handleLogout} title="Çıkış Yap" className="p-2 text-slate-400 hover:text-red-500">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Standart Giriş */}
                                    <button 
                                        onClick={onLoginClick}
                                        className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                                    >
                                        <LogIn size={16} />
                                        <span className="hidden sm:inline">Giriş</span>
                                    </button>
                                    
                                    {/* Google ile Hızlı Giriş */}
                                    <button 
                                        onClick={() => signInWithGoogle()}
                                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                        title="Google ile Giriş Yap"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <button onClick={onCartClick} className="relative p-2 text-slate-700 hover:text-brand-600">
                                <ShoppingCart size={22} strokeWidth={2} />
                                {cartItemCount > 0 && (
                                    <span className="absolute top-0 right-0 px-1.5 py-0.5 text-xs font-bold text-white bg-brand-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Scrolling Ticker */}
            <div className="bg-brand-600 text-white text-sm font-medium py-3 overflow-hidden border-b border-brand-500 flex">
                <div className="animate-marquee flex">
                    {seamlessMessages.map((msg, index) => (
                        <span key={index} className="mx-8 whitespace-nowrap flex items-center">{msg}</span>
                    ))}
                </div>
            </div>
        </header>
    );
};