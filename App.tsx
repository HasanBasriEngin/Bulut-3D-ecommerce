
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Profile } from './pages/Profile';
import { Catalog } from './pages/Catalog';
import { CustomOrder } from './pages/CustomOrder';
import { CartSidebar } from './components/CartSidebar';
import { WishlistSidebar } from './components/WishlistSidebar';
import { AuthModal } from './components/AuthModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Checkout } from './pages/Checkout'; 
import { OrderTracking } from './pages/OrderTracking'; 
import { AdminPanel } from './pages/AdminPanel'; 
import { Product, CartItem, VariantConfig, Order, AddressForm, CreditCardForm, Customer, CustomRequest, Coupon } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FEATURED_PRODUCTS } from './data';
import { X, LogIn, UserPlus, ArrowRight, Ticket, Gift, Instagram } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase'; // Supabase istemcisini içeri alıyoruz
type ViewState = 'HOME' | 'PRODUCT_DETAIL' | 'PROFILE' | 'CHECKOUT' | 'ORDER_TRACKING' | 'ADMIN' | 'CATALOG' | 'CUSTOM_ORDER';

const AppContent: React.FC = () => {
   const { user, loading } = useAuth();
const isAuthenticated = !!user;
if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-brand-600">Yükleniyor...</div>;
}
    // Products State (To allow Admin to modify)
    // Add random stock and COST PRICE to initial data
    const initializeProducts = (prods: Product[]) => prods.map(p => ({
        ...p, 
        stock: Math.floor(Math.random() * 50) + 1,
        barcode: `869${Math.floor(Math.random() * 10000)}`,
        costPrice: p.basePrice * 0.4 // Maliyet tahmini: Satış fiyatının %40'ı
    }));

    // 39. Satır civarı: Başlangıçta boş bir dizi olarak tanımlıyoruz
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    // Veritabanından ürünleri çeken fonksiyon
  useEffect(() => {
        const fetchData = async () => {
            // 1. Ürünleri Çek
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (productsData) setAllProducts(productsData as Product[]);

            // 2. Siparişleri Çek
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (ordersData) setMockOrders(ordersData as any);

            // 3. Özel İstekleri (Custom Requests) Çek
            const { data: customData } = await supabase
                .from('custom_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (customData) {
                setCustomRequests(customData.map(item => ({
                    id: item.id,
                    name: item.full_name, // TypeScript hatasını önlemek için 'name' olarak eşliyoruz
                    email: item.email,
                    phone: item.phone,
                    description: item.description,
                    date: new Date(item.created_at).toLocaleDateString('tr-TR'),
                    status: item.status,
                    material: "Belirtilmedi" // Interface zorunlu kılıyorsa ekliyoruz
                })));
// 4. Müşterileri (Profiles) Veritabanından Çek
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .order('join_date', { ascending: false });

            if (profilesData) {
                setMockCustomers(profilesData.map(p => ({
                    id: p.id,
                    fullName: p.full_name,
                    email: p.email,
                    phone: p.phone_number || '-',
                    location: p.address || 'Belirtilmedi',
                    address: p.address || 'Belirtilmedi',
                    totalOrders: 0,
                    totalSpent: 0
                })));
            }

            }
        };

        fetchData();
    }, []);

    const [currentView, setCurrentView] = useState<ViewState>('HOME');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [catalogTitle, setCatalogTitle] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false); // New Guest Prompt State
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    
    // Coupons State
    const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);

    // Login olunca kupon tanımlama simülasyonu
    useEffect(() => {
        if (isAuthenticated) {
            // Eğer kullanıcının hiç kuponu yoksa hoşgeldin kuponu ver
            if (userCoupons.length === 0) {
                setUserCoupons([
                    {
                        id: 'cpn_welcome',
                        code: 'HOSGELDIN10',
                        discountRate: 0.10,
                        description: 'Yeni üyelere özel %10 indirim',
                        isUsed: false
                    }
                ]);
            }
            
            // Kullanıcı giriş yaptıysa açık olan modalları kapat
            setIsAuthModalOpen(false);
            setIsGuestPromptOpen(false);
        } else {
            // Çıkış yaparsa kuponları temizle (isteğe bağlı, demo için mantıklı)
            setUserCoupons([]);
        }
    }, [isAuthenticated]);


    // Custom Requests State
    const [customRequests, setCustomRequests] = useState<CustomRequest[]>([
        {
            id: 'req_1',
            date: new Date().toLocaleDateString('tr-TR'),
            name: 'Deneme Kullanıcı',
            email: 'deneme@example.com',
            phone: '05550000000',
            material: 'PLA',
            description: 'Batman figürü istiyorum, yaklaşık 20cm boyunda. Detaylı dosya ektedir.',
            status: 'Teklif Verildi', // Test için teklif verildi yapıldı
            fileUrl: 'mock_file_url',
            offerPrice: 250,
            offerNote: 'Bu model için destek yapıları gerekecektir.',
            offerDate: new Date().toLocaleDateString('tr-TR')
        }
    ]);

    const [mockOrders, setMockOrders] = useState<Order[]>([
        {
            id: 'ord_123456',
            orderNumber: 'BLT-2024-001',
            date: '12 Aralık 2024',
            status: 'Teslim Edildi',
            total: 450.00,
            items: 2,
            customerName: 'Ahmet Yılmaz',
            customerEmail: 'ahmet@demo.com',
            customerAddress: 'Bağdat Cad. No:12 İstanbul/Kadıköy',
            customerPhone: '0555 123 4567',
            paymentMethod: 'Kredi Kartı',
            shippingCompany: 'Yurtiçi Kargo',
            trackingNumber: '12345678901',
            orderItems: [
                {
                    productName: "Articulated Crystal Dragon",
                    variantInfo: "PLA • Küçük • Kırmızı",
                    quantity: 1,
                    unitPrice: 450,
                    totalPrice: 450,
                    imageUrl: "https://picsum.photos/id/133/600/600"
                }
            ]
        },
        {
            id: 'ord_98765',
            orderNumber: 'BLT-2024-042',
            date: '18 Aralık 2024',
            status: 'Hazırlanıyor',
            total: 1250.00,
            items: 3,
            customerName: 'Ayşe Demir',
            customerEmail: 'ayse@demo.com',
            customerAddress: 'Tunalı Hilmi Cad. No:5 Ankara/Çankaya',
            customerPhone: '0555 987 6543',
            paymentMethod: 'EFT/Havale',
            orderItems: [
                 {
                    productName: "Geometric Planter Pot",
                    variantInfo: "PLA • Orta • Beyaz",
                    quantity: 2,
                    unitPrice: 180,
                    totalPrice: 360,
                    imageUrl: "https://picsum.photos/id/106/600/600"
                },
                {
                    productName: "Lithophane Photo Lamp",
                    variantInfo: "PLA • Büyük • Beyaz", // Reçine changed to PLA
                    quantity: 1,
                    unitPrice: 890,
                    totalPrice: 890,
                    imageUrl: "https://picsum.photos/id/312/600/600"
                }
            ]
        }
    ]);

    const [mockCustomers, setMockCustomers] = useState<Customer[]>([
        {
            id: 'cust_1',
            fullName: 'Ahmet Yılmaz',
            location: 'İstanbul / Kadıköy',
            phone: '555-123-4567',
            address: 'Bağdat Cad. No:12',
            totalOrders: 5,
            totalSpent: 4250
        },
        {
            id: 'cust_2',
            fullName: 'Ayşe Demir',
            location: 'Ankara / Çankaya',
            phone: '555-987-6543',
            address: 'Tunalı Hilmi Cad. No:5',
            totalOrders: 3,
            totalSpent: 1850
        },
        {
            id: 'cust_3',
            fullName: 'Mehmet Öz',
            location: 'İzmir / Karşıyaka',
            phone: '555-444-3322',
            address: 'Yalı Mah. 123. Sok',
            totalOrders: 1,
            totalSpent: 450
        }
    ]);

    // Admin Handlers
   // Admin Handlers
    const handleAddProduct = async (newProd: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => {
        // 1. Supabase'e Kaydet
        const { data, error } = await supabase
            .from('products')
            .insert([{
                name: newProd.name,
                description: newProd.description,
                base_price: newProd.basePrice, // TypeScript'teki basePrice -> DB'deki base_price
                image_url: newProd.imageUrl,
                stock: newProd.stock || 20,
                categories: newProd.categories,
                rating: 5.0,
                review_count: 0,
                sales: 0,
                barcode: newProd.barcode || `869${Math.floor(Math.random() * 10000)}`
            }])
            .select();

        if (error) {
            alert('Ekleme Hatası: ' + error.message);
        } else if (data) {
            // 2. State'i Güncelle (Ekranda hemen görünmesi için)
            setAllProducts(prev => [data[0] as Product, ...prev]);
            alert('Ürün başarıyla veritabanına eklendi!');
        }
    };

    const handleEditProduct = async (updatedProduct: Product) => {
        const { error } = await supabase
            .from('products')
            .update({
                name: updatedProduct.name,
                description: updatedProduct.description,
                base_price: updatedProduct.basePrice,
                image_url: updatedProduct.imageUrl,
                stock: updatedProduct.stock,
                categories: updatedProduct.categories
            })
            .eq('id', updatedProduct.id);

        if (error) {
            alert('Güncelleme Hatası: ' + error.message);
        } else {
            setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (confirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?')) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Silme Hatası: ' + error.message);
            } else {
                setAllProducts(prev => prev.filter(p => p.id !== id));
                alert('Ürün veritabanından silindi.');
            }
        }
    };

    const handleUpdateProductStock = (id: number, newStock: number) => {
        setAllProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    };

    const handleBulkUpdateStock = (ids: number[], stockToAdd: number) => {
        setAllProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, stock: (p.stock || 0) + stockToAdd } : p));
        alert(`${ids.length} ürünün stoğu güncellendi.`);
    };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // 1. Supabase'deki sipariş durumunu güncelle
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus }) // DB'deki status sütununu güncelle
        .eq('id', orderId); // Sadece bu ID'ye sahip siparişi seç

    if (error) {
        console.error('Sipariş durumu güncellenemedi:', error);
        alert('Durum güncellenirken bir hata oluştu: ' + error.message);
    } else {
        // 2. İşlem başarılıysa ekrandaki listeyi de hemen güncelle
        setMockOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Opsiyonel: alert('Sipariş durumu güncellendi!');
    }
};
    // User Order Actions
    const handleCancelOrder = (orderId: string) => {
        if(confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
            handleUpdateOrderStatus(orderId, 'İptal Edildi');
            alert('Siparişiniz iptal edilmiştir.');
        }
    };

    const handleReturnOrder = (orderId: string) => {
        if(confirm('İade talebi oluşturmak istediğinize emin misiniz?')) {
            // Normalde burada iade süreci başlar ama demo için durumu değiştiriyoruz
            handleUpdateOrderStatus(orderId, 'İade Edildi'); 
            alert('İade talebiniz alınmıştır. Kargo kodu: 12345678');
        }
    };

    // Customer Admin Handlers
    const handleAddCustomer = (customer: Customer) => {
        setMockCustomers(prev => [customer, ...prev]);
    };

    const handleUpdateCustomer = (customer: Customer) => {
        setMockCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    };

    const handleDeleteCustomer = (id: string) => {
        if(confirm('Müşteriyi silmek istediğinize emin misiniz?')) {
            setMockCustomers(prev => prev.filter(c => c.id !== id));
        }
    };

  // Custom Request Handler (from CustomOrder page)
   const handleCustomRequestSubmit = async (formData: any) => {
        // 1. Supabase 'custom_requests' tablosuna kaydet
        const { data: insertedData, error } = await supabase
            .from('custom_requests')
            .insert([{
                full_name: formData.fullName || formData.name, 
                email: formData.email,
                phone: formData.phone,
                description: formData.description,
                customer_id: user?.id || null,
                status: 'Beklemede'
            }])
            .select();

        if (error) {
            console.error('Özel istek kaydedilemedi:', error);
            alert('İsteğiniz gönderilirken bir hata oluştu: ' + error.message);
        } else if (insertedData) {
            // 2. State'i güncelle (Hataları çözmek için tam eşleme yapıyoruz)
            const newReq: CustomRequest = {
                id: insertedData[0].id,
                name: insertedData[0].full_name, // fullName -> name eşlemesi
                email: insertedData[0].email,
                phone: insertedData[0].phone,
                description: insertedData[0].description,
                date: new Date(insertedData[0].created_at).toLocaleDateString('tr-TR'),
                status: insertedData[0].status,
                material: "Özel Belirtilmedi" // Eksik olan material alanını doldurduk
            };

            setCustomRequests(prev => [newReq, ...prev]);

            alert('Özel sipariş talebiniz başarıyla alındı!');
            setCurrentView('HOME');
            window.scrollTo(0,0);
        }
    };

    // Navigation
    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setCurrentView('PRODUCT_DETAIL');
        setIsWishlistOpen(false);
        window.scrollTo(0, 0);
    };

    const handleGoHome = () => {
        setCurrentView('HOME');
        setSelectedProduct(null);
        window.scrollTo(0, 0);
    };

    const handleOpenCatalog = (title: string, products: Product[]) => {
        setCatalogTitle(title);
        // Varsayılan olarak satışa göre sıralayalım, kullanıcı daha sonra filtreleyebilir.
        const sortedProducts = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0));
        setFilteredProducts(sortedProducts);
        setCurrentView('CATALOG');
        window.scrollTo(0,0);
    };

    const handleSearch = (query: string) => {
        const lowerQuery = query.toLowerCase();
        const results = allProducts.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.categories.some((c:string) => c.toLowerCase().includes(lowerQuery))
        );
        setCatalogTitle(`"${query}" için sonuçlar`);
        setFilteredProducts(results);
        setCurrentView('CATALOG');
        window.scrollTo(0,0);
    };

    const handleGoCustomOrder = () => {
        setCurrentView('CUSTOM_ORDER');
        window.scrollTo(0, 0);
    };

    const handleGoProfile = () => {
        setCurrentView('PROFILE');
        window.scrollTo(0, 0);
    };
    
    // Direct navigation to Checkout Page
    const handleGoCheckout = () => {
        setCurrentView('CHECKOUT');
        setIsCartOpen(false);
        window.scrollTo(0, 0);
    };

    // Logic when clicking "Checkout" in Sidebar
    const handleCartCheckoutAttempt = () => {
        setIsCartOpen(false);
        if (isAuthenticated) {
            handleGoCheckout();
        } else {
            setIsGuestPromptOpen(true);
        }
    };

    const handleBackToCart = () => {
        setCurrentView('HOME'); // Arka planda ana sayfa olsun
        setIsCartOpen(true); // Sepet sidebar'ını aç
    };

    // Guest Prompt Handlers
    const handleGuestProceed = () => {
        setIsGuestPromptOpen(false);
        handleGoCheckout();
    };

    const handleLoginRedirectFromPrompt = () => {
        setIsGuestPromptOpen(false);
        setAuthModalMode('LOGIN');
        setIsAuthModalOpen(true);
    };

    const openAuthModal = (mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    const addToCart = (product: Product, variant: VariantConfig, quantity: number = 1) => {
        const cartId = `${product.id}-${variant.material}-${variant.size}-${variant.color}`;
        setCart(prev => {
            const existing = prev.find(item => item.cartId === cartId);
            if (existing) {
                return prev.map(item => 
                    item.cartId === cartId 
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                );
            }
            return [...prev, { cartId, product, selectedVariant: variant, quantity: quantity }];
        });
        setIsCartOpen(true);
    };

    // Miktar güncelleme fonksiyonu (Delta ile)
    const updateCartItemQuantity = (cartId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: newQty > 0 ? newQty : 1 }; // Minimum 1 olabilir
            }
            return item;
        }));
    };

    // Miktar belirleme fonksiyonu (Manuel input için)
    // 0'a izin veriyoruz ki input boşaltılabilsin. Component tarafında onBlur'da 1'e çekilecek.
    const setCartItemQuantity = (cartId: string, quantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                return { ...item, quantity: quantity >= 0 ? quantity : 1 };
            }
            return item;
        }));
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const toggleWishlist = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        setWishlist(prev => 
            prev.includes(product.id) 
            ? prev.filter(id => id !== product.id)
            : [...prev, product.id]
        );
    };

   const handlePlaceOrder = async (address: AddressForm, payment: CreditCardForm) => {
    const orderTotal = cart.reduce((sum, item) => sum + (item.product.basePrice + item.selectedVariant.priceModifier) * item.quantity, 0);
    const orderNumber = `BLT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

    // 1. Supabase 'orders' tablosuna kalıcı olarak kaydet
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
            order_number: orderNumber,
            customer_id: user?.id || null, // Giriş yapan kullanıcının UUID'si
            total: orderTotal,
            status: 'Hazırlanıyor',
            payment_method: 'Kredi Kartı',
            customer_email: address.email,
            customer_phone: address.phone,
            customer_address: address.fullAddress,
            // Sepet içeriğini JSONB sütununa dizi olarak gönderiyoruz
            items: cart.map(item => ({
                productName: item.product.name,
                variantInfo: `${item.selectedVariant.material} • ${item.selectedVariant.size}`,
                quantity: item.quantity,
                unitPrice: item.product.basePrice + item.selectedVariant.priceModifier,
                totalPrice: (item.product.basePrice + item.selectedVariant.priceModifier) * item.quantity
            }))
        }])
        .select();

    if (orderError) {
        console.error('Sipariş veritabanına kaydedilemedi:', orderError);
        alert('Sipariş oluşturulurken bir hata oluştu: ' + orderError.message);
        return;
    }

    if (orderData) {
        // 2. Ekranda hemen görünmesi için yerel state'i güncelle (Takip sayfası için)
        const newOrderForState = {
            id: orderData[0].id,
            orderNumber: orderNumber,
            date: new Date().toLocaleDateString('tr-TR'),
            status: 'Hazırlanıyor',
            total: orderTotal,
            items: cart.reduce((sum, item) => sum + item.quantity, 0),
            customerName: address.fullName,
            orderItems: cart.map(item => ({
                productName: item.product.name,
                variantInfo: `${item.selectedVariant.material} • ${item.selectedVariant.size}`,
                quantity: item.quantity,
                unitPrice: item.product.basePrice + item.selectedVariant.priceModifier,
                totalPrice: (item.product.basePrice + item.selectedVariant.priceModifier) * item.quantity,
                imageUrl: item.product.imageUrl
            }))
        };

        setMockOrders(prev => [newOrderForState as any, ...prev]);
        setCart([]); // Sepeti boşalt
        alert(`Siparişiniz Alındı! Sipariş No: ${orderNumber}`);
        setCurrentView('ORDER_TRACKING');
        window.scrollTo(0,0);
    }
};

    const wishlistItems = allProducts.filter(p => wishlist.includes(p.id));

    if (currentView === 'ADMIN') {
        return (
            <div>
                <AdminPanel 
                    products={allProducts} 
                    orders={mockOrders} 
                    customers={mockCustomers}
                    customRequests={customRequests} // Pass custom requests
                    onAddProduct={handleAddProduct}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateProductStock={handleUpdateProductStock}
                    onBulkUpdateStock={handleBulkUpdateStock}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onAddCustomer={handleAddCustomer}
                    onUpdateCustomer={handleUpdateCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    onExit={handleGoHome}
                />
            </div>
        );
    }

    const featuredSorted = allProducts
        .filter(p => FEATURED_PRODUCTS.some((fp:any) => fp.id === p.id))
        .sort((a, b) => (b.sales || 0) - (a.sales || 0));

    return (
        <div className="min-h-screen bg-transparent relative flex flex-col">
            <Navbar 
                cartItemCount={cart.reduce((a, b) => a + b.quantity, 0)} 
                wishlistCount={wishlist.length}
                onCartClick={() => {setIsCartOpen(true); setIsWishlistOpen(false);}}
                onHomeClick={handleGoHome}
                onLoginClick={() => openAuthModal('LOGIN')}
                onProfileClick={handleGoProfile}
                onWishlistClick={() => {setIsWishlistOpen(true); setIsCartOpen(false);}}
                onOrderTrackingClick={() => setCurrentView('ORDER_TRACKING')}
                onAdminClick={() => setCurrentView('ADMIN')}
                onCatalogClick={() => handleOpenCatalog('Tüm Ürünler', allProducts)}
                onKeychainsClick={() => handleOpenCatalog('Tüm Ürünler', allProducts)} // Anahtarlıklar -> Tüm Ürünler
                onSearch={handleSearch} // Pass search handler
            />

            <main className="flex-grow">
                {currentView === 'HOME' && (
                    <Home 
                        products={featuredSorted} 
                        wishlistIds={wishlist}
                        onProductSelect={handleProductSelect} 
                        onToggleWishlist={toggleWishlist}
                        onOpenCatalog={handleOpenCatalog}
                        onCustomOrderClick={handleGoCustomOrder}
                    />
                )}
                {currentView === 'CATALOG' && (
                    <Catalog 
                        title={catalogTitle}
                        products={filteredProducts}
                        wishlistIds={wishlist}
                        onBack={handleGoHome}
                        onProductSelect={handleProductSelect}
                        onToggleWishlist={toggleWishlist}
                    />
                )}
                {currentView === 'CUSTOM_ORDER' && (
                    <CustomOrder 
                        onBack={handleGoHome} 
                        onSubmit={handleCustomRequestSubmit} // Pass handler
                    />
                )}
                {currentView === 'PRODUCT_DETAIL' && selectedProduct && (
                    <ProductDetail 
                        product={selectedProduct} 
                        onBack={handleGoHome}
                        onAddToCart={addToCart}
                    />
                )}
                {currentView === 'PROFILE' && (
                    <Profile 
                        onGoHome={handleGoHome} 
                        customRequests={customRequests} // Pass requests
                        orders={mockOrders}
                        coupons={userCoupons} // Pass coupons
                        onCancelOrder={handleCancelOrder}
                        onReturnOrder={handleReturnOrder}
                    />
                )}
                {currentView === 'ORDER_TRACKING' && <OrderTracking orders={mockOrders} />}
                {currentView === 'CHECKOUT' && (
                    <Checkout 
                        items={cart} 
                        onPlaceOrder={handlePlaceOrder}
                        total={cart.reduce((sum, item) => sum + (item.product.basePrice + item.selectedVariant.priceModifier) * item.quantity, 0)}
                        availableCoupons={userCoupons} // Pass available coupons
                        onOpenAuth={() => openAuthModal('REGISTER')}
                        onBack={handleGoHome} 
                        onBackToCart={handleBackToCart} 
                    />
                )}
            </main>

            {currentView !== 'CHECKOUT' && (
                <footer style={{ backgroundColor: '#d0e8f2' }} className="backdrop-blur-md text-slate-900 py-6 border-t border-brand-100 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-slate-900 text-lg font-bold mb-4">BULUT 3D</h3>
                                <p className="text-sm leading-relaxed max-w-xs text-slate-700">Butik üretim anlayışıyla, hayalinizdeki tasarımları en yüksek kalitede basıyoruz.</p>
                            </div>
                            <div>
                                <h4 className="text-slate-900 font-medium mb-4">Hızlı Erişim</h4>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li><button onClick={handleGoHome} className="hover:text-brand-600 transition-colors">Ana Sayfa</button></li>
                                    <li><button onClick={() => handleOpenCatalog('Tüm Ürünler', allProducts)} className="hover:text-brand-600 transition-colors">Mağaza</button></li>
                                    <li><button onClick={handleGoCustomOrder} className="hover:text-brand-600 transition-colors">Özel Sipariş</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-slate-900 font-medium mb-4">İletişim</h4>
                                <ul className="space-y-2 text-sm text-slate-700 mb-4">
                                    <li>info@bulut3d.com</li>
                                    <li>+90 555 123 45 67</li>
                                </ul>
                                
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-900">Bizi Takip Edin</span>
                                    <a 
                                        href="https://www.instagram.com/bulut3dbaski?igsh=MWZ0dHlkYmZjZmY=" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-slate-600 hover:text-pink-600 transition-colors w-fit"
                                    >
                                        <Instagram size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-300 text-xs flex flex-col md:flex-row justify-between items-center text-slate-600 gap-4">
                            <div className="flex gap-4 items-center">
                                <span>&copy; 2024 Bulut 3D. Tüm hakları saklıdır.</span>
                            </div>
                            <div className="font-medium">
                                Powered and Developed By <a href="https://github.com/worldestroyer55" target="_blank" rel="noopener noreferrer" className="text-slate-900 font-bold hover:text-brand-600 hover:underline transition-colors">Hasan Basri Engin</a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            <CartSidebar 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                items={cart}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateCartItemQuantity} 
                onSetQuantity={setCartItemQuantity} 
                onCheckout={handleCartCheckoutAttempt}
            />

            <WishlistSidebar 
                isOpen={isWishlistOpen} 
                onClose={() => setIsWishlistOpen(false)} 
                items={wishlistItems}
                onRemoveItem={toggleWishlist}
                onProductSelect={handleProductSelect}
            />
            
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                initialMode={authModalMode}
            />

            {isGuestPromptOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={handleGuestProceed}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in text-center p-6">
                        <button 
                            onClick={handleGuestProceed}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
                            title="Oturum açmadan devam et"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift size={32} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz Giriş Yapmadınız</h3>
                        
                        {/* PROMOSYON ALANI */}
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-6">
                            <p className="text-green-700 font-bold text-sm mb-1">🎉 %10 İndirim Fırsatı!</p>
                            <p className="text-green-600 text-xs leading-relaxed">
                                Giriş yapın veya üye olun, anında hesabınıza tanımlanacak <strong>%10 indirim kuponunu</strong> bu siparişinizde hemen kullanın.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleLoginRedirectFromPrompt}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <LogIn size={18} /> Giriş Yap / Üye Ol & Kazan
                            </button>
                            <button 
                                onClick={handleGuestProceed}
                                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                İndirimsiz Devam Et <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <WhatsAppButton />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
