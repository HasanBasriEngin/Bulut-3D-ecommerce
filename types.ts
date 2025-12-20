import { User as SupabaseUser } from '@supabase/supabase-js';

// --- Domain Models reflecting the Database Structure ---

export enum MaterialType {
    PLA = 'PLA',
    PETG = 'PETG',
    ABS = 'ABS',
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
    basePrice: number;
    costPrice?: number;
    categories: string[];
    imageUrl: string;
    images?: string[];
    videoUrl?: string;
    tags?: string[];
    rating: number;
    reviewCount: number;
    sales?: number;
    stock?: number;
    barcode?: string; 
    availableMaterials: MaterialType[];
    availableColors: string[];
    availableSizes: SizeType[];
    reviews?: Review[];
}

export interface VariantConfig {
    material: MaterialType;
    size: SizeType;
    color: string;
    priceModifier: number;
    stock: number;
}

export interface CartItem {
    cartId: string;
    product: Product;
    selectedVariant: VariantConfig;
    quantity: number;
}

/**
 * Supabase Kullanıcısını Genişletiyoruz (isAdmin ekliyoruz)
 * Bu sayede hem Supabase özelliklerini kullanırız hem de Admin kontrolü yapabiliriz.
 */
export interface ExtendedUser extends SupabaseUser {
    isAdmin?: boolean;
    // Eğer veritabanında ekstra alanların varsa buraya da ekleyebilirsin:
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    joinDate?: string;
}

export interface Coupon {
    id: string;
    code: string;
    discountRate: number;
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
    items: number;
    orderItems?: OrderItemSummary[];
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: string;
    customerPhone?: string;
    paymentMethod?: 'Nakit' | 'EFT/Havale' | 'Kredi Kartı' | 'Shopier';
    shippingCompany?: string;
    trackingNumber?: string;
}

export interface CreditCardForm {
    cardHolder: string;
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    installments: number;
}

export interface AddressForm {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    fullAddress: string;
}

export interface CustomRequest {
    id: string;
    date: string;
    name: string;
    email: string;
    phone: string;
    material: string;
    description: string;
    status: 'Yeni' | 'İncelendi' | 'Teklif Verildi';
    fileUrl?: string;
    offerPrice?: number;
    offerNote?: string;
    offerDate?: string;
}