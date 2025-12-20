
// Domain Models reflecting the Database Structure

export enum MaterialType {
    PLA = 'PLA',
    PETG = 'PETG',
    ABS = 'ABS',
    // RESIN removed
    TPU = 'TPU (Esnek)'
}

export enum SizeType {
    SMALL = 'Küçük',
    MEDIUM = 'Orta',
    LARGE = 'Büyük',
    XLARGE = 'Dev (XL)'
}

export interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    shortDescription: string;
    basePrice: number; // Satış Fiyatı
    costPrice?: number; // Alış/Maliyet Fiyatı (Yeni)
    categories: string[]; // ÇOKLU KATEGORİ DESTEĞİ
    imageUrl: string; // Ana Resim (Thumb)
    images?: string[]; // ÇOKLU RESİM GALERİSİ (Yeni)
    videoUrl?: string; // YOUTUBE YERİNE DIRECT VIDEO URL
    tags?: string[]; // FİLTRELEME ETİKETLERİ (Yeni)
    rating: number;
    reviewCount: number;
    sales?: number; // SATIŞ ADEDİ (Sıralama için)
    // Added for Admin Panel
    stock?: number;
    barcode?: string; 
    // In a real DB, variants are joined. Here we allow options to generate variants.
    availableMaterials: MaterialType[];
    availableColors: string[];
    availableSizes: SizeType[];
    reviews?: Review[]; // Yeni: Ürün yorumları
}

// Simulating the 'product_variants' table
export interface VariantConfig {
    material: MaterialType;
    size: SizeType;
    color: string;
    priceModifier: number; // Added to basePrice
    stock: number;
}

export interface CartItem {
    cartId: string; // Unique ID for the cart line item (product + variants)
    product: Product;
    selectedVariant: VariantConfig;
    quantity: number;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    joinDate: string;
    isAdmin?: boolean; // Admin flag
}

export interface Coupon {
    id: string;
    code: string;
    discountRate: number; // 0.10 for 10%
    description: string;
    isUsed: boolean;
    minAmount?: number;
}

export interface Customer {
    id: string;
    fullName: string;
    location: string;
    phone: string;
    address: string;
    totalOrders: number;
    totalSpent: number;
}

// Yeni: Sipariş içindeki ürün özeti için
export interface OrderItemSummary {
    productName: string;
    variantInfo: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl: string;
}

export interface Order {
    id: string;
    status: 'Hazırlanıyor' | 'Baskı Aşamasında' | 'Kargoya Verildi' | 'Teslim Edildi' | 'İptal Edildi' | 'İade Edildi';
    total: number;
    date: string;
    items: number; // Item count summary
    orderItems?: OrderItemSummary[]; // Detaylı ürün listesi
    orderNumber: string;
    customerName: string; // For Admin
    customerEmail: string; // For Admin
    customerAddress?: string; // New: Full address snapshot
    customerPhone?: string; // New
    // New fields for detailed tracking
    paymentMethod?: 'Nakit' | 'EFT/Havale' | 'Kredi Kartı' | 'Shopier';
    shippingCompany?: string;
    trackingNumber?: string;
}

// Payment Types
export interface CreditCardForm {
    cardHolder: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    installments: number;
}

export interface AddressForm {
    fullName: string;
    email: string; // For guest checkout
    phone: string;
    city: string;
    district: string;
    fullAddress: string;
}

// New: Custom Order Request for Admin Panel
export interface CustomRequest {
    id: string;
    date: string;
    name: string;
    email: string;
    phone: string;
    material: string;
    description: string;
    status: 'Yeni' | 'İncelendi' | 'Teklif Verildi';
    fileUrl?: string; // Müşterinin yüklediği dosya (opsiyonel)
    // Offer details from Admin
    offerPrice?: number;
    offerNote?: string;
    offerDate?: string;
}
