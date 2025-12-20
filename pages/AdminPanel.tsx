import React, { useState, useMemo } from 'react';
import { Product, Order, Customer, CustomRequest, MaterialType } from '../types';
import { 
    LayoutDashboard, 
    Box, 
    ShoppingBag, 
    Users, 
    Plus, 
    Printer, 
    Moon, 
    TrendingUp, 
    Calculator,
    Trash2,
    MapPin,
    Phone,
    Sun,
    X,
    ImagePlus,
    Maximize2,
    Info,
    Edit2,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Square,
    Search,
    Layers,
    ListChecks,
    Pencil,
    Tags,
    FileText,
    Palette,
    Settings2,
    Youtube,
    Video,
    Film,
    Zap,
    CircleDollarSign,
    Package,
    BarChart3,
    AlertCircle,
    MessageSquare,
    Mail,
    Eye,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    RotateCcw,
    CreditCard,
    Save,
    Upload,
    Send,
    Tag,
    Download,
    History
} from 'lucide-react';

interface AdminPanelProps {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    customRequests?: CustomRequest[];
    onAddProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onUpdateProductStock: (id: number, stock: number) => void;
    onBulkUpdateStock: (ids: number[], stockToAdd: number) => void;
    onUpdateOrderStatus: (id: string, newStatus: Order['status']) => void;
    onAddCustomer: (customer: Customer) => void;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (id: string) => void;
    onExit: () => void;
}

type AdminView = 'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'CUSTOMERS' | 'CUSTOM_REQUESTS';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    products, 
    orders, 
    customers, 
    customRequests = [],
    onAddProduct, 
    onEditProduct,
    onDeleteProduct, 
    onUpdateProductStock, 
    onBulkUpdateStock,
    onUpdateOrderStatus, 
    onAddCustomer,
    onUpdateCustomer,
    onDeleteCustomer,
    onExit 
}) => {
    const [view, setView] = useState<AdminView>('DASHBOARD');
    const [darkMode, setDarkMode] = useState(false);

    // --- STATES ---
    
    // Dashboard Modals
    const [isActiveOrdersModalOpen, setIsActiveOrdersModalOpen] = useState(false);
    const [isCriticalStockModalOpen, setIsCriticalStockModalOpen] = useState(false);

    // Products State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(true); // Default enabled for easier access
    const [zoomedImage, setZoomedImage] = useState<string | null>(null); // Image Lightbox State
    
    // Global Filter Management
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
    const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null); // New Tag Filter

    // Quick Stock Add State
    const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
    const [quickStockAmount, setQuickStockAmount] = useState<number>(0);

    const [productForm, setProductForm] = useState<Partial<Product>>({
        name: '', 
        categories: [], 
        basePrice: 0, 
        costPrice: 0, 
        stock: 10, 
        barcode: '', 
        imageUrl: '',
        images: [], // Çoklu resimler
        videoUrl: '',
        tags: [], // Etiketler
        description: '',
        shortDescription: '',
        availableColors: [],
        availableMaterials: []
    });
    // Temporary state for comma-separated colors in edit modal
    const [colorsString, setColorsString] = useState('');
    // State for managing tags inside modal
    const [tagInput, setTagInput] = useState('');

    const [editingProductId, setEditingProductId] = useState<number | null>(null);

    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    
    // Orders State
    const [orderTab, setOrderTab] = useState<'ACTIVE' | 'HISTORY' | 'CANCELLED' | 'RETURNED'>('ACTIVE');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For Order Detail Modal

    // Customer State
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null); // For detailed customer view
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // Editing
    const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
        fullName: '', phone: '', location: '', address: ''
    });

    // Custom Requests & Offers State
    const [viewingRequest, setViewingRequest] = useState<CustomRequest | null>(null);
    const [offeringRequest, setOfferingRequest] = useState<CustomRequest | null>(null);
    const [offerForm, setOfferForm] = useState({
        price: '',
        note: '',
        image: '' as string,
        video: '' as string
    });

    // Profit Calculator State
    const [expenses, setExpenses] = useState({
        electricityRate: 4.5, // TL/kW
        consumption: 250, // kW
        filament: 2000,
        rent: 5000,
        other: 500
    });

    // Extract all unique tags from all products for the filter list
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        // Add some default tags if they don't exist
        tags.add('Yeni Sezon');
        tags.add('İndirim');
        tags.add('Çok Satan');
        
        products.forEach(p => {
            if (p.tags) {
                p.tags.forEach(t => tags.add(t));
            }
        });
        return Array.from(tags);
    }, [products]);

    // --- LOGIC ---

    // File Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'videoUrl') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (field === 'images') {
            const newImages: string[] = [];
            const fileReaders: Promise<string>[] = [];

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                const promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                });
                reader.readAsDataURL(file as Blob);
                fileReaders.push(promise);
            });

            Promise.all(fileReaders).then(base64Images => {
                setProductForm(prev => {
                    const updatedImages = [...(prev.images || []), ...base64Images];
                    const mainImage = prev.imageUrl || updatedImages[0];
                    return { 
                        ...prev, 
                        images: updatedImages,
                        imageUrl: mainImage
                    };
                });
            });
        } else {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductForm(prev => ({ ...prev, videoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOfferFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOfferForm(prev => ({ ...prev, [type]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setProductForm(prev => {
            const currentImages = prev.images || [];
            const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
            let newMainImage = prev.imageUrl;
            if (currentImages[indexToRemove] === prev.imageUrl) {
                newMainImage = newImages.length > 0 ? newImages[0] : '';
            }
            return { ...prev, images: newImages, imageUrl: newMainImage };
        });
    };
    
    // Tag Management in Modal
    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        setProductForm(prev => ({
            ...prev,
            tags: [...(prev.tags || []), tagInput.trim()]
        }));
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setProductForm(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(t => t !== tagToRemove)
        }));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || p.barcode?.includes(productSearchTerm);
            const matchesCategory = selectedCategory === 'Tümü' || p.categories.includes(selectedCategory);
            const matchesTag = selectedFilterTag === null || (p.tags && p.tags.includes(selectedFilterTag));
            
            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [products, productSearchTerm, selectedCategory, selectedFilterTag]);

    // Dashboard Stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCostOfGoods = orders.reduce((sum, o) => sum + (o.total * 0.35), 0); 
    const activeOrdersList = orders.filter(o => o.status !== 'Teslim Edildi' && o.status !== 'İptal Edildi' && o.status !== 'İade Edildi');
    const activeOrdersCount = activeOrdersList.length;
    const criticalStockList = products.filter(p => (p.stock || 0) < 5);
    const criticalStockCount = criticalStockList.length;
    
    const bestSellingProducts = useMemo(() => {
        return products.slice(0, 5).map(p => ({
            name: p.name,
            sales: Math.floor(Math.random() * 50) + 10,
            revenue: p.basePrice * (Math.floor(Math.random() * 50) + 10)
        })).sort((a, b) => b.sales - a.sales);
    }, [products]);

    const maxSales = Math.max(...bestSellingProducts.map(p => p.sales));

    const electricityCost = expenses.electricityRate * expenses.consumption;
    const totalOperatingExpenses = electricityCost + Number(expenses.filament) + Number(expenses.rent) + Number(expenses.other);
    const netProfit = totalRevenue - (totalCostOfGoods + totalOperatingExpenses);
    
    const handleSelectProduct = (id: number) => {
        if (selectedProductIds.includes(id)) setSelectedProductIds(prev => prev.filter(pid => pid !== id));
        else setSelectedProductIds(prev => [...prev, id]);
    };
    const handleSelectAllVisibleProducts = () => {
        const visibleIds = filteredProducts.map(p => p.id);
        const allSelected = visibleIds.every(id => selectedProductIds.includes(id));
        if (allSelected) setSelectedProductIds(prev => prev.filter(id => !visibleIds.includes(id)));
        else setSelectedProductIds(Array.from(new Set([...selectedProductIds, ...visibleIds])));
    };
    
    const openAddProductModal = () => {
        setEditingProductId(null);
        setProductForm({ 
            name: '', 
            categories: selectedCategory !== 'Tümü' ? [selectedCategory] : ['Figür'], 
            basePrice: 0, 
            costPrice: 0, 
            stock: 10, 
            barcode: '', 
            imageUrl: '', 
            images: [],
            videoUrl: '', 
            tags: [],
            description: '', 
            shortDescription: '', 
            availableColors: ['Beyaz', 'Siyah', 'Gri'],
            availableMaterials: [MaterialType.PLA]
        });
        setColorsString('Beyaz, Siyah, Gri');
        setTagInput('');
        setIsProductModalOpen(true);
    };
    const openEditProductModal = (product: Product) => {
        setEditingProductId(product.id);
        const initialImages = (product.images && product.images.length > 0) 
            ? product.images 
            : (product.imageUrl ? [product.imageUrl] : []);

        setProductForm({ 
            ...product,
            images: initialImages,
            tags: product.tags || []
        });
        setColorsString(product.availableColors?.join(', ') || '');
        setTagInput('');
        setIsProductModalOpen(true);
    };
    const saveProduct = () => {
        if (!productForm.name) return;
        const colorsArray = colorsString.split(',').map(c => c.trim()).filter(c => c !== '');
        
        const finalImages = productForm.images || [];
        const finalImageUrl = finalImages.length > 0 ? finalImages[0] : (productForm.imageUrl || '');

        const updatedForm = { 
            ...productForm, 
            availableColors: colorsArray,
            images: finalImages,
            imageUrl: finalImageUrl 
        };
        
        if (editingProductId) onEditProduct({ ...updatedForm, id: editingProductId } as Product);
        else onAddProduct(updatedForm as any);
        setIsProductModalOpen(false);
    };

    const toggleProductMaterial = (material: MaterialType) => {
        setProductForm(prev => {
            const current = prev.availableMaterials || [];
            if (current.includes(material)) {
                return { ...prev, availableMaterials: current.filter(m => m !== material) };
            } else {
                return { ...prev, availableMaterials: [...current, material] };
            }
        });
    };
    
    const openQuickStockModal = (product: Product) => {
        setQuickStockProduct(product);
        setQuickStockAmount(0);
    };
    const submitQuickStock = () => {
        if(quickStockProduct && quickStockAmount !== 0) {
            onUpdateProductStock(quickStockProduct.id, (quickStockProduct.stock || 0) + quickStockAmount);
            setQuickStockProduct(null);
        }
    };
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Teslim Edildi': return 'bg-green-100 text-green-700 border-green-200';
            case 'Hazırlanıyor': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Baskı Aşamasında': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Kargoya Verildi': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'İptal Edildi': return 'bg-red-100 text-red-700 border-red-200';
            case 'İade Edildi': return 'bg-slate-200 text-slate-700 border-slate-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };
    const filteredOrders = orders.filter(o => {
        if (orderTab === 'HISTORY') return o.status === 'Teslim Edildi';
        if (orderTab === 'CANCELLED') return o.status === 'İptal Edildi';
        if (orderTab === 'RETURNED') return o.status === 'İade Edildi';
        return o.status !== 'Teslim Edildi' && o.status !== 'İptal Edildi' && o.status !== 'İade Edildi';
    });
    const openAddCustomer = () => { setEditingCustomer(null); setCustomerForm({ fullName: '', phone: '', location: '', address: '' }); setIsCustomerModalOpen(true); };
    const openEditCustomer = (customer: Customer) => { setEditingCustomer(customer); setCustomerForm(customer); setIsCustomerModalOpen(true); };
    
    const openCustomerDetail = (customer: Customer) => {
        setViewingCustomer(customer);
    };

    const saveCustomer = () => {
        if (!customerForm.fullName) return;
        if (editingCustomer) onUpdateCustomer({ ...editingCustomer, ...customerForm } as Customer);
        else onAddCustomer({ ...customerForm, id: `cust_${Date.now()}`, totalOrders: 0, totalSpent: 0 } as Customer);
        setIsCustomerModalOpen(false);
    };

    const handleStatusStep = (direction: 'next' | 'prev') => {
        if (!selectedOrder) return;
        const steps: Order['status'][] = ['Hazırlanıyor', 'Baskı Aşamasında', 'Kargoya Verildi', 'Teslim Edildi'];
        const currentIndex = steps.indexOf(selectedOrder.status as any);
        if (currentIndex === -1) return;
        let newIndex = currentIndex;
        if (direction === 'next' && currentIndex < steps.length - 1) newIndex++;
        else if (direction === 'prev' && currentIndex > 0) newIndex--;
        if (newIndex !== currentIndex) {
            onUpdateOrderStatus(selectedOrder.id, steps[newIndex]);
            setSelectedOrder({ ...selectedOrder, status: steps[newIndex] });
        }
    };

    const openRequestDetail = (req: CustomRequest) => {
        setViewingRequest(req);
    };

    const openOfferModal = (req: CustomRequest) => {
        setOfferingRequest(req);
        setOfferForm({ price: '', note: '', image: '', video: '' });
    };

    const sendOffer = () => {
        if(!offerForm.price) return;
        alert(`Teklif başarıyla gönderildi!\nAlıcı: ${offeringRequest?.email}\nTutar: ${offerForm.price} TL\nNot: ${offerForm.note}\nDosyalar eklendi.`);
        setOfferingRequest(null);
    };

    // Dosya indirme simülasyonu
    const handleDownloadFile = (req: CustomRequest) => {
        // Dosya adı formatı: MusteriAdi_Tarih
        const safeName = req.name.replace(/\s+/g, '_');
        const safeDate = req.date.replace(/\./g, '-');
        const fileName = `${safeName}_${safeDate}.txt`;

        // Dosya içeriği (Demo)
        const content = `Müşteri: ${req.name}\nTarih: ${req.date}\nTalep: ${req.description}\n\nBu bir demo dosyadır.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get specific orders for a customer (Matching by Name or Email mostly for mock data)
    const getCustomerOrders = (customer: Customer) => {
        return orders.filter(o => 
            o.customerName === customer.fullName || 
            (customer.fullName && o.customerName.toLowerCase().includes(customer.fullName.toLowerCase()))
        );
    };

    const inputClassName = `w-full p-2.5 rounded-lg border border-blue-200 text-sm outline-none transition-colors bg-blue-50 text-slate-900 placeholder-slate-400 focus:border-brand-500`;

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
            
            {/* Sidebar */}
            <aside className={`w-64 border-r flex flex-col fixed h-full z-20 transition-colors duration-300 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`p-6 flex items-center gap-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <Printer className="text-slate-900" size={24} />
                    <h1 className="text-xl font-bold tracking-tight">Bulut 3D</h1>
                    <button onClick={() => setDarkMode(!darkMode)} className="ml-auto p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {['DASHBOARD', 'PRODUCTS', 'ORDERS', 'CUSTOMERS', 'CUSTOM_REQUESTS'].map((item) => (
                        <button 
                            key={item}
                            onClick={() => setView(item as AdminView)} 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === item ? 'bg-[#d0e8f2] text-slate-900 font-bold' : 'hover:bg-[#f3e0f7] text-slate-500 dark:hover:bg-slate-800'}`}
                        >
                            {item === 'DASHBOARD' && <><LayoutDashboard size={18} /> Genel Bakış</>}
                            {item === 'PRODUCTS' && <><Box size={18} /> Stok Yönetimi</>}
                            {item === 'ORDERS' && <><ShoppingBag size={18} /> Siparişler</>}
                            {item === 'CUSTOMERS' && <><Users size={18} /> Müşteriler</>}
                            {item === 'CUSTOM_REQUESTS' && <><MessageSquare size={18} /> Özel Siparişler</>}
                        </button>
                    ))}
                    <button onClick={onExit} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-8">
                        <TrendingUp size={18} className="rotate-180" /> Çıkış Yap
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ml-64 p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-[#f8fafc]'}`}>
                {/* ... (Dashboard) ... */}
                {view === 'DASHBOARD' && (
                     <div className="max-w-7xl mx-auto space-y-8">
                        {/* ... Stats ... */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <p className={`text-sm opacity-60 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Toplam Ciro</p>
                                <p className="text-2xl font-bold mt-1">₺ {totalRevenue.toLocaleString('tr-TR')}</p>
                            </div>
                            <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <p className={`text-sm opacity-60 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Tahmini Kâr</p>
                                <p className={`text-2xl font-bold mt-1 ${netProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>₺ {netProfit.toLocaleString('tr-TR')}</p>
                            </div>
                            
                            {/* Clickable Active Orders Card */}
                            <div 
                                onClick={() => setIsActiveOrdersModalOpen(true)}
                                className={`p-6 rounded-xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 group ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500/50' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className={`text-sm opacity-60 font-medium group-hover:text-brand-500 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Aktif Siparişler</p>
                                        <p className="text-2xl font-bold mt-1">{activeOrdersCount}</p>
                                    </div>
                                    <div className="bg-[#d0e8f2] p-2 rounded-lg text-slate-900">
                                        <ShoppingBag size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Clickable Critical Stock Card */}
                            <div 
                                onClick={() => setIsCriticalStockModalOpen(true)}
                                className={`p-6 rounded-xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 group ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-red-500/50' : 'bg-white border-slate-200 hover:border-red-200'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className={`text-sm opacity-60 font-medium group-hover:text-red-500 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Kritik Stok</p>
                                        <p className="text-2xl font-bold mt-1 text-red-500">{criticalStockCount}</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                                        <AlertCircle size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Products Chart */}
                        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className={darkMode ? "text-slate-100" : "text-slate-900"} />
                                <h3 className="text-lg font-bold">En Çok Satanlar</h3>
                            </div>
                            <div className="space-y-4">
                                {bestSellingProducts.map((product, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-48 text-sm font-medium truncate shrink-0">{product.name}</div>
                                        <div className={`flex-1 h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                            <div 
                                                className="h-full bg-brand-600 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${(product.sales / maxSales) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className={`w-20 text-xs font-bold text-right ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{product.sales} Adet</div>
                                        <div className="w-24 text-xs opacity-60 text-right">₺{product.revenue.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                 )}

                {/* OTHER VIEWS */}
                {view !== 'DASHBOARD' && (
                    <>
                        {view === 'PRODUCTS' && (
                            <div className="max-w-7xl mx-auto space-y-6">
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Stok Yönetimi</h2>
                                        <div className="flex gap-3">
                                            <div 
                                                className={`border rounded-lg flex items-center px-3 cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                                                onClick={() => setIsSelectionMode(!isSelectionMode)}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelectionMode} 
                                                    readOnly
                                                    className="mr-2 accent-slate-900 pointer-events-none"
                                                />
                                                <span className="text-sm select-none">Çoklu Seçim</span>
                                            </div>
                                            <button onClick={openAddProductModal} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                                <Plus size={16}/> Yeni Ürün
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                                <input type="text" placeholder="Ürün ara..." value={productSearchTerm} onChange={e=>setProductSearchTerm(e.target.value)} className={`${inputClassName} pl-10`} />
                                            </div>
                                        </div>
                                        
                                        {/* TAG FILTER BAR */}
                                        <div className="flex gap-2 flex-wrap items-center">
                                            <span className="text-xs font-bold text-slate-500 uppercase mr-2"><Tags size={14} className="inline mr-1"/> Etiket Filtrele:</span>
                                            <button 
                                                onClick={() => setSelectedFilterTag(null)}
                                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedFilterTag === null ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                                            >
                                                Tümü
                                            </button>
                                            {availableTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setSelectedFilterTag(selectedFilterTag === tag ? null : tag)}
                                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedFilterTag === tag ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'}`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <table className="w-full text-left text-sm">
                                        <thead className={`border-b ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-brand-50/50 border-slate-100'}`}>
                                            <tr>{isSelectionMode && <th className="p-4"><button onClick={handleSelectAllVisibleProducts}><CheckSquare size={18}/></button></th>}<th className="p-4">Ürün</th><th className="p-4">Stok</th><th className="p-4">Fiyat</th><th className="p-4">Etiketler</th><th className="p-4 text-right">İşlem</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(p => (
                                                <tr key={p.id} onClick={() => openEditProductModal(p)} className={`cursor-pointer hover:bg-[#f3e0f7] dark:hover:bg-slate-700 group transition-colors border-b last:border-0 ${darkMode ? 'border-slate-700' : 'border-slate-100'} ${selectedProductIds.includes(p.id) ? 'bg-[#d0e8f2]/50' : ''}`}>
                                                    {isSelectionMode && (
                                                        <td className="p-4" onClick={e=>e.stopPropagation()}>
                                                            <button 
                                                                onClick={()=>handleSelectProduct(p.id)}
                                                                className={`text-slate-400 group-hover:text-slate-900 transition-colors ${darkMode ? 'group-hover:text-white' : ''}`}
                                                            >
                                                                {selectedProductIds.includes(p.id)?<CheckSquare size={18} className={darkMode ? "text-white" : "text-slate-900"}/>:<Square size={18}/>}
                                                            </button>
                                                        </td>
                                                    )}
                                                    <td className="p-4 flex gap-3 items-center">
                                                        <img 
                                                            src={p.imageUrl} 
                                                            className="w-10 h-10 rounded bg-slate-100 object-cover cursor-zoom-in hover:scale-110 transition-transform shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setZoomedImage(p.imageUrl);
                                                            }}
                                                        />
                                                        <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{p.name}</span>
                                                    </td>
                                                    <td className={`p-4 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{p.stock}</td>
                                                    <td className={`p-4 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>₺{p.basePrice}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {p.tags?.slice(0, 2).map((t, i) => (
                                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{t}</span>
                                                            ))}
                                                            {p.tags && p.tags.length > 2 && <span className="text-[10px] text-slate-400">+{p.tags.length - 2}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); openQuickStockModal(p); }}
                                                                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Hızlı Stok Ekle"
                                                            >
                                                                <Zap size={18}/>
                                                            </button>

                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); openEditProductModal(p); }}
                                                                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                                                title="Düzenle"
                                                            >
                                                                <Pencil size={18}/>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); onDeleteProduct(p.id); }} 
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Sil"
                                                            >
                                                                <Trash2 size={18}/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* ... (Orders) ... */}
                        {view === 'ORDERS' && (
                            <div className="max-w-7xl mx-auto">
                                <h2 className="text-2xl font-bold mb-6">Sipariş Yönetimi</h2>
                                <div className="flex gap-4 mb-6 border-b overflow-x-auto">
                                    <button onClick={()=>setOrderTab('ACTIVE')} className={`pb-3 px-4 border-b-2 whitespace-nowrap ${orderTab==='ACTIVE'?'border-brand-600 text-brand-900 font-bold':'text-slate-500'}`}>Aktif</button>
                                    <button onClick={()=>setOrderTab('HISTORY')} className={`pb-3 px-4 border-b-2 whitespace-nowrap ${orderTab==='HISTORY'?'border-brand-600 text-brand-900 font-bold':'text-slate-500'}`}>Geçmiş</button>
                                    <button onClick={()=>setOrderTab('RETURNED')} className={`pb-3 px-4 border-b-2 whitespace-nowrap ${orderTab==='RETURNED'?'border-brand-600 text-brand-900 font-bold':'text-slate-500'}`}>İade Edilenler</button>
                                    <button onClick={()=>setOrderTab('CANCELLED')} className={`pb-3 px-4 border-b-2 whitespace-nowrap ${orderTab==='CANCELLED'?'border-brand-600 text-brand-900 font-bold':'text-slate-500'}`}>İptal</button>
                                </div>
                                <div className={`rounded-xl border ${darkMode?'bg-slate-800 border-slate-700':'bg-white border-slate-200'}`}>
                                    {filteredOrders.length === 0 ? <div className="p-8 text-center text-slate-500">Bu kategoride sipariş bulunmuyor.</div> : filteredOrders.map(o => (
                                        <div key={o.id} onClick={()=>setSelectedOrder(o)} className={`p-4 border-b flex justify-between items-center cursor-pointer hover:bg-[#f3e0f7] dark:hover:bg-slate-700 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <div><p className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{o.orderNumber}</p><p className="text-xs opacity-60 text-slate-500">{o.customerName} • {o.items} Ürün</p></div>
                                            <div onClick={e=>e.stopPropagation()}>
                                                <select value={o.status} onChange={e=>onUpdateOrderStatus(o.id, e.target.value as any)} className={`text-xs p-2 rounded border ${getStatusColor(o.status)}`}>
                                                    <option>Hazırlanıyor</option>
                                                    <option>Baskı Aşamasında</option>
                                                    <option>Kargoya Verildi</option>
                                                    <option>Teslim Edildi</option>
                                                    <option>İade Edildi</option>
                                                    <option>İptal Edildi</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* ... (Customers) ... */}
                        {view === 'CUSTOMERS' && (
                            <div className="max-w-7xl mx-auto">
                                <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Müşteriler</h2><button onClick={openAddCustomer} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus size={16}/> Ekle</button></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {customers.map(c=>(
                                        <div 
                                            key={c.id} 
                                            onClick={() => openCustomerDetail(c)}
                                            className={`p-6 rounded-xl border relative group cursor-pointer hover:shadow-md transition-shadow ${darkMode?'bg-slate-800 border-slate-700':'bg-white'}`}
                                        >
                                            <h3 className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{c.fullName}</h3>
                                            <p className="text-xs opacity-60 mb-2">{c.location}</p>
                                            <div className="flex gap-2 text-xs opacity-70">
                                                <span>{c.totalOrders} Sipariş</span>
                                                <span>•</span>
                                                <span>₺{c.totalSpent}</span>
                                            </div>
                                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e)=>{e.stopPropagation(); openEditCustomer(c);}} className="p-1 hover:bg-slate-100 rounded text-slate-600"><Edit2 size={14}/></button>
                                                <button onClick={(e)=>{e.stopPropagation(); onDeleteCustomer(c.id);}} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {view === 'CUSTOM_REQUESTS' && (
                            <div className="max-w-7xl mx-auto">
                                <h2 className="text-2xl font-bold mb-6">Özel Sipariş Talepleri</h2>
                                <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    {customRequests.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">Henüz bir talep bulunmuyor.</div>
                                    ) : (
                                        customRequests.map(req => (
                                            <div key={req.id} className={`p-5 border-b last:border-0 hover:bg-[#f3e0f7] dark:hover:bg-slate-700 flex flex-col sm:flex-row gap-4 justify-between ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{req.name}</h3>
                                                        <span className="text-xs bg-[#d0e8f2] text-slate-800 px-2 py-0.5 rounded-full">{req.status}</span>
                                                        <span className="text-xs text-slate-400">{req.date}</span>
                                                    </div>
                                                    <p className={`text-sm opacity-80 mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{req.description}</p>
                                                    <div className="flex gap-4 text-xs opacity-60 text-slate-600">
                                                        <span className="flex items-center gap-1"><Mail size={12} /> {req.email}</span>
                                                        <span className="flex items-center gap-1"><Phone size={12} /> {req.phone}</span>
                                                        <span className="flex items-center gap-1"><Box size={12} /> {req.material}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <button onClick={() => openRequestDetail(req)} className="text-xs border px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Detay</button>
                                                    <button onClick={() => openOfferModal(req)} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded hover:bg-brand-700 transition-colors">Teklif Oluştur</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </main>

            {/* --- MODALS --- */}
            
            {/* VIEWING CUSTOMER DETAIL MODAL (Updated Logic) */}
            {viewingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className={`rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                        {/* Header */}
                        <div className={`p-6 border-b flex justify-between items-start bg-[#d0e8f2] text-slate-900`}>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-brand-600 shadow-sm">
                                    {viewingCustomer.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{viewingCustomer.fullName}</h3>
                                    <p className="text-sm opacity-80 flex items-center gap-2">
                                        <MapPin size={14} /> {viewingCustomer.location}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setViewingCustomer(null)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className="text-xs opacity-60 font-bold uppercase">Toplam Harcama</p>
                                    <p className="text-xl font-bold text-brand-600 mt-1">₺{viewingCustomer.totalSpent}</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className="text-xs opacity-60 font-bold uppercase">Toplam Sipariş</p>
                                    <p className="text-xl font-bold mt-1">{getCustomerOrders(viewingCustomer).length} Adet</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className="text-xs opacity-60 font-bold uppercase">İade / İptal</p>
                                    <p className="text-xl font-bold text-red-500 mt-1">
                                        {getCustomerOrders(viewingCustomer).filter(o => ['İade Edildi', 'İptal Edildi'].includes(o.status)).length} Adet
                                    </p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold border-b pb-2 mb-3 text-sm uppercase opacity-70">İletişim Bilgileri</h4>
                                    <p className="text-sm mb-1"><span className="font-semibold">Telefon:</span> {viewingCustomer.phone}</p>
                                    <p className="text-sm"><span className="font-semibold">Adres:</span> {viewingCustomer.address}</p>
                                </div>
                            </div>

                            {/* Orders History Sections */}
                            <div className="space-y-8">
                                {/* Active & Completed Orders */}
                                <div>
                                    <h4 className="font-bold border-b pb-2 mb-4 text-sm uppercase opacity-70 flex items-center gap-2">
                                        <ShoppingBag size={16}/> Sipariş Geçmişi <span className="text-[10px] text-slate-400 normal-case font-normal ml-2">(Detay için tıklayın)</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {getCustomerOrders(viewingCustomer)
                                            .filter(o => !['İade Edildi', 'İptal Edildi'].includes(o.status))
                                            .map(order => (
                                            <div 
                                                key={order.id} 
                                                onClick={() => setSelectedOrder(order)}
                                                className={`flex justify-between items-center p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${darkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${order.status === 'Teslim Edildi' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {order.status === 'Teslim Edildi' ? <CheckCircle size={20}/> : <Clock size={20}/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">#{order.orderNumber}</p>
                                                        <p className="text-xs opacity-60">{order.date} • {order.items} Ürün</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">₺{order.total}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>{order.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {getCustomerOrders(viewingCustomer).filter(o => !['İade Edildi', 'İptal Edildi'].includes(o.status)).length === 0 && (
                                            <p className="text-sm opacity-50 italic">Aktif veya tamamlanmış sipariş bulunmuyor.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Returned & Cancelled Orders */}
                                <div>
                                    <h4 className="font-bold border-b pb-2 mb-4 text-sm uppercase opacity-70 flex items-center gap-2 text-red-500">
                                        <RotateCcw size={16}/> İade ve İptaller
                                    </h4>
                                    <div className="space-y-3">
                                        {getCustomerOrders(viewingCustomer)
                                            .filter(o => ['İade Edildi', 'İptal Edildi'].includes(o.status))
                                            .map(order => (
                                            <div 
                                                key={order.id} 
                                                onClick={() => setSelectedOrder(order)}
                                                className={`flex justify-between items-center p-4 rounded-lg border border-red-100 bg-red-50/50 cursor-pointer hover:bg-red-50 transition-colors ${darkMode ? 'bg-red-900/10 border-red-900/30 hover:bg-red-900/20' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                                        <XCircle size={20}/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">#{order.orderNumber}</p>
                                                        <p className="text-xs opacity-60">{order.date} • {order.items} Ürün</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold line-through opacity-60">₺{order.total}</p>
                                                    <span className="text-[10px] px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-200">{order.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {getCustomerOrders(viewingCustomer).filter(o => ['İade Edildi', 'İptal Edildi'].includes(o.status)).length === 0 && (
                                            <p className="text-sm opacity-50 italic">İade veya iptal edilmiş sipariş bulunmuyor.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard: Active Orders Modal */}
            {isActiveOrdersModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className={`bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl ${darkMode ? 'bg-slate-900 text-white' : ''}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Aktif Siparişler</h3>
                            <button onClick={() => setIsActiveOrdersModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {activeOrdersList.map(o => (
                                <div key={o.id} className={`p-3 rounded-lg border flex justify-between items-center ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                                    <div>
                                        <p className="font-bold text-sm">{o.orderNumber}</p>
                                        <p className="text-xs opacity-60">{o.customerName}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full border ${getStatusColor(o.status)}`}>{o.status}</span>
                                </div>
                            ))}
                            {activeOrdersList.length === 0 && <p className="text-center text-slate-500 py-4">Aktif sipariş bulunmuyor.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard: Critical Stock Modal */}
            {isCriticalStockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className={`bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl ${darkMode ? 'bg-slate-900 text-white' : ''}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-red-500 flex items-center gap-2"><AlertCircle size={20}/> Kritik Stok Seviyesi</h3>
                            <button onClick={() => setIsCriticalStockModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {criticalStockList.map(p => (
                                <div key={p.id} className={`p-3 rounded-lg border flex justify-between items-center ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" />
                                        <p className="font-bold text-sm">{p.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-500">{p.stock} Adet</p>
                                        <button 
                                            onClick={() => { setIsCriticalStockModalOpen(false); openQuickStockModal(p); }}
                                            className="text-xs underline text-slate-500 hover:text-slate-900"
                                        >
                                            Stok Ekle
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {criticalStockList.length === 0 && <p className="text-center text-slate-500 py-4">Kritik seviyede ürün yok.</p>}
                        </div>
                    </div>
                </div>
            )}
            
            {/* ... (LightBox Modal Same as before) ... */}
            
            {/* ... (Order Detail Modal) ... */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className={`p-6 rounded-xl w-full max-w-3xl overflow-y-auto max-h-[90vh] ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                        {/* Header */}
                        <div className={`flex justify-between items-start mb-6 border-b pb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-2">Sipariş Detayı <span className="text-slate-400 text-base font-normal">#{selectedOrder.orderNumber}</span></h3>
                                <p className="text-xs opacity-60 mt-1">{selectedOrder.date}</p>
                            </div>
                            <button onClick={()=>setSelectedOrder(null)}><X size={24}/></button>
                        </div>
                        {selectedOrder.status !== 'İptal Edildi' && selectedOrder.status !== 'İade Edildi' && (
                             <div className="mb-8 bg-[#d0e8f2] p-4 rounded-xl text-slate-900">
                                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-600 mb-2">
                                    <span>Süreç Durumu</span>
                                    <span>{selectedOrder.status}</span>
                                </div>
                                <div className="relative h-2 bg-slate-300/50 rounded-full mb-4">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-slate-800 rounded-full transition-all duration-500"
                                        style={{ width: 
                                            selectedOrder.status === 'Hazırlanıyor' ? '25%' : 
                                            selectedOrder.status === 'Baskı Aşamasında' ? '50%' : 
                                            selectedOrder.status === 'Kargoya Verildi' ? '75%' : '100%' 
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between">
                                    <button onClick={() => handleStatusStep('prev')} className="px-3 py-1 rounded bg-white shadow-sm text-xs font-bold hover:bg-slate-50 disabled:opacity-50 text-slate-800" disabled={selectedOrder.status === 'Hazırlanıyor'}>
                                        <ChevronLeft size={14} className="inline mr-1" /> Geri Al
                                    </button>
                                    <button onClick={() => handleStatusStep('next')} className="px-3 py-1 rounded bg-brand-600 text-white shadow-sm text-xs font-bold hover:bg-brand-700 disabled:opacity-50" disabled={selectedOrder.status === 'Teslim Edildi'}>
                                        İlerle <ChevronRight size={14} className="inline ml-1" />
                                    </button>
                                </div>
                             </div>
                        )}
                        {/* ... Items ... */}
                        <div className="mb-8">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase opacity-70 border-b pb-2"><ShoppingBag size={16}/> Sipariş Edilen Ürünler</h4>
                            <div className="space-y-4">
                                {selectedOrder.orderItems?.map((item, index) => (
                                    <div key={index} className={`flex gap-4 items-center p-3 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                                        <div className="flex-1">
                                            <h5 className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.productName}</h5>
                                            <p className="text-xs text-slate-500 mt-1">{item.variantInfo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.quantity} Adet</p>
                                            <p className="text-sm text-brand-600 font-semibold">₺{item.totalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4 pt-4 border-t">
                                <span className="text-lg font-bold">Toplam: ₺{selectedOrder.total.toFixed(2)}</span>
                            </div>
                        </div>
                        {/* ... Info ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className={`border p-4 rounded-lg ${darkMode ? 'border-slate-700' : ''}`}>
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase opacity-70"><Users size={16}/> Müşteri Bilgileri</h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold">Ad:</span> {selectedOrder.customerName}</p>
                                    <p><span className="font-semibold">E-posta:</span> {selectedOrder.customerEmail}</p>
                                    <p><span className="font-semibold">Telefon:</span> {selectedOrder.customerPhone || '-'}</p>
                                    <p><span className="font-semibold">Adres:</span> {selectedOrder.customerAddress || '-'}</p>
                                </div>
                            </div>
                            <div className={`border p-4 rounded-lg ${darkMode ? 'border-slate-700' : ''}`}>
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase opacity-70"><CreditCard size={16}/> Ödeme & Kargo</h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold">Ödeme:</span> {selectedOrder.paymentMethod || 'Kredi Kartı'}</p>
                                    <p><span className="font-semibold">Kargo:</span> {selectedOrder.shippingCompany || 'Standart Kargo'}</p>
                                    {selectedOrder.trackingNumber && <p><span className="font-semibold">Takip No:</span> {selectedOrder.trackingNumber}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM REQUEST DETAIL MODAL */}
            {viewingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h3 className="font-bold text-lg">Talep Detayı</h3>
                            <button onClick={()=>setViewingRequest(null)}><X size={20}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Müşteri</label>
                                <p>{viewingRequest.name}</p>
                                <p className="text-sm text-slate-500">{viewingRequest.email} • {viewingRequest.phone}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Materyal</label>
                                <p>{viewingRequest.material}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Açıklama</label>
                                <p className="bg-slate-50 p-3 rounded-lg text-sm border">{viewingRequest.description}</p>
                            </div>
                            
                            {/* File Download Section */}
                            {viewingRequest.fileUrl && (
                                <div className="mt-2 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">Müşteri Dosyası Mevcut</p>
                                            <p className="text-xs text-blue-600">Yüklenen tasarım dosyası</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDownloadFile(viewingRequest)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <Download size={14} /> İndir
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                                <button onClick={()=>setViewingRequest(null)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">Kapat</button>
                                <button onClick={()=>{setViewingRequest(null); openOfferModal(viewingRequest);}} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800">Teklif Ver</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE OFFER MODAL */}
            {offeringRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h3 className="font-bold text-lg">Teklif Oluştur</h3>
                            <button onClick={()=>setOfferingRequest(null)}><X size={20}/></button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm bg-brand-50 text-brand-800 p-2 rounded">
                                <span className="font-bold">{offeringRequest.name}</span> isimli müşteriye teklif gönderiyorsunuz.
                            </p>
                            
                            <div>
                                <label className="block text-sm font-bold mb-1">Teklif Tutarı (TL)</label>
                                <input 
                                    type="number" 
                                    className={inputClassName}
                                    placeholder="0.00"
                                    value={offerForm.price}
                                    onChange={(e) => setOfferForm({...offerForm, price: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Notunuz</label>
                                <textarea 
                                    className={inputClassName}
                                    rows={3} 
                                    placeholder="Teklif detaylarını buraya yazabilirsiniz..."
                                    value={offerForm.note}
                                    onChange={(e) => setOfferForm({...offerForm, note: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Görsel Ekle</label>
                                    <div className="border border-dashed border-blue-200 bg-blue-50 p-2 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition-colors relative h-20 flex items-center justify-center">
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleOfferFileUpload(e, 'image')} />
                                        {offerForm.image ? <span className="text-xs text-green-600 font-bold">Görsel Seçildi</span> : <ImagePlus className="text-slate-400"/>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Video Ekle</label>
                                    <div className="border border-dashed border-blue-200 bg-blue-50 p-2 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition-colors relative h-20 flex items-center justify-center">
                                        <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleOfferFileUpload(e, 'video')} />
                                        {offerForm.video ? <span className="text-xs text-green-600 font-bold">Video Seçildi</span> : <Video className="text-slate-400"/>}
                                    </div>
                                </div>
                            </div>

                            <button onClick={sendOffer} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2">
                                <Send size={18} /> Teklifi E-posta ile Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            {/* FULLY DETAILED PRODUCT EDIT MODAL */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                         {/* ... (Existing Modal Content with new input class) ... */}
                         {/* Header */}
                         <div className="flex justify-between items-center p-6 bg-[#d0e8f2] text-slate-900">
                             <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit2 size={20} />
                                {editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                             </h3>
                             <button onClick={() => setIsProductModalOpen(false)} className="hover:bg-white/50 p-1 rounded-full"><X size={24} /></button>
                         </div>

                         <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {/* Left Column: Media & Stock */}
                             <div className="space-y-6">
                                
                                {/* Image Upload - MULTIPLE SUPPORT */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Ürün Görselleri</label>
                                    <div className="relative group cursor-pointer border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors h-32 flex items-center justify-center overflow-hidden mb-4">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                                            onChange={(e) => handleFileUpload(e, 'images')}
                                        />
                                        <div className="text-center p-4">
                                            <ImagePlus className="text-slate-400 mx-auto mb-2" size={24} />
                                            <p className="text-xs text-slate-500 font-medium">Görsel seçmek için tıklayın (Çoklu)</p>
                                        </div>
                                    </div>
                                    {productForm.images && productForm.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {productForm.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden group">
                                                    <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                                    <button onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                                    {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-white text-[10px] text-center py-0.5">Ana Resim</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Video Upload */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Video Yükle</label>
                                    <div className="flex flex-col gap-2">
                                        {!productForm.videoUrl ? (
                                            <div className="relative group cursor-pointer border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors h-32 flex items-center justify-center overflow-hidden">
                                                <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={(e) => handleFileUpload(e, 'videoUrl')}/>
                                                <div className="text-center p-4"><Youtube className="text-slate-400 mx-auto mb-2" size={32} /><p className="text-xs text-slate-500 font-medium">Video seçmek için tıklayın</p></div>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-black">
                                                <video src={productForm.videoUrl} controls className="w-full h-48 object-contain" />
                                                <button onClick={(e) => {e.preventDefault(); setProductForm({...productForm, videoUrl: ''})}} className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-700 z-10 shadow-sm">Videoyu Kaldır</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Stok Adedi</label>
                                        <input className={inputClassName} type="number" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: Number(e.target.value)})}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Barkod</label>
                                        <input className={inputClassName} value={productForm.barcode || ''} onChange={e=>setProductForm({...productForm, barcode: e.target.value})}/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-slate-700">Satış Fiyatı (TL)</label>
                                        <input className={inputClassName} type="number" value={productForm.basePrice} onChange={e=>setProductForm({...productForm, basePrice: Number(e.target.value)})}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-slate-500">Maliyet (TL)</label>
                                        <input className={inputClassName} type="number" value={productForm.costPrice || 0} onChange={e=>setProductForm({...productForm, costPrice: Number(e.target.value)})}/>
                                    </div>
                                </div>
                             </div>

                             {/* Right Column: Details & Tags */}
                             <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Ürün Adı</label>
                                    <input className={inputClassName} value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})}/>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2">Etiketler (Filtreleme İçin)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input className={inputClassName} placeholder="Etiket yazıp enter veya butona basın..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleAddTag(); }}/>
                                        <button onClick={handleAddTag} className="bg-brand-600 text-white p-2.5 rounded-lg"><Plus size={18}/></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {productForm.tags?.map((tag, idx) => (
                                            <span key={idx} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-brand-100">
                                                <Tag size={12} /> {tag} <button onClick={() => handleRemoveTag(tag)} className="hover:text-brand-900 ml-1"><X size={12}/></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2">Kısa Açıklama</label>
                                    <input className={inputClassName} value={productForm.shortDescription || ''} onChange={e=>setProductForm({...productForm, shortDescription: e.target.value})}/>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2">Detaylı Açıklama</label>
                                    <textarea rows={4} className={inputClassName} value={productForm.description || ''} onChange={e=>setProductForm({...productForm, description: e.target.value})}/>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2">Renk Seçenekleri (Virgül ile ayırın)</label>
                                    <div className="relative">
                                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input className={`${inputClassName} pl-10`} value={colorsString} onChange={e=>setColorsString(e.target.value)} placeholder="Örn: Beyaz, Siyah, Kırmızı, Altın"/>
                                    </div>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {colorsString.split(',').filter(c => c.trim()).map((c, i) => (
                                            <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-slate-400"></div> {c.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                             </div>
                         </div>

                         <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                             <button onClick={() => setIsProductModalOpen(false)} className="px-6 py-3 rounded-xl border border-slate-300 font-bold hover:bg-slate-100">İptal</button>
                             <button onClick={saveProduct} className="px-8 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 flex items-center gap-2 transition-colors">
                                 <Save size={18} /> Değişiklikleri Kaydet
                             </button>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Quick Stock Modal */}
            {quickStockProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                        <h3 className="mb-4 font-bold text-lg">{quickStockProduct.name} Stok Ekle</h3>
                        <input 
                            type="number" 
                            autoFocus 
                            className="border-2 border-blue-200 bg-blue-50 p-3 rounded-xl w-full mb-4 text-lg text-slate-900 font-bold focus:border-brand-500 outline-none" 
                            value={quickStockAmount === 0 ? '' : quickStockAmount} 
                            onChange={e=>setQuickStockAmount(Number(e.target.value))} 
                            placeholder="0"
                        />
                        <button onClick={submitQuickStock} className="bg-brand-600 text-white px-4 py-3 rounded-xl w-full font-bold hover:bg-brand-700 transition-colors">Onayla</button>
                        <button onClick={()=>setQuickStockProduct(null)} className="mt-3 text-slate-500 w-full text-sm hover:text-slate-700">İptal</button>
                    </div>
                </div>
            )}

        </div>
    );
};