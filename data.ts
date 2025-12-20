
import { Product, MaterialType, SizeType } from './types';

export const FEATURED_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Articulated Crystal Dragon",
        shortDescription: "Tam hareketli eklemler, kristal doku.",
        description: "Bu ejderha figürü, baskı yerinden çıktığı andan itibaren tamamen hareketlidir. Her bir pulu ve eklemi özenle tasarlanmıştır. Kristal sırt yapısı ışığı harika yansıtır. Masaüstü aksesuarı veya stres oyuncağı olarak mükemmeldir.",
        basePrice: 450.00,
        categories: ["Figür", "Oyuncak", "Popüler"],
        tags: ["Yeni Sezon", "Çok Satan", "Hareketli"],
        imageUrl: "https://picsum.photos/id/133/600/600",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Örnek MP4
        rating: 4.9,
        reviewCount: 124,
        sales: 1500, // En çok satan
        availableMaterials: [MaterialType.PLA, MaterialType.PETG],
        availableColors: ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', 'gold', 'silver'],
        availableSizes: [SizeType.SMALL, SizeType.MEDIUM, SizeType.LARGE]
    },
    {
        id: 2,
        name: "Geometric Planter Pot",
        shortDescription: "Modern düşük poligonlu saksı tasarımı.",
        description: "Minimalist ev dekorasyonu için tasarlanmış geometrik saksı. İç kısmı su sızdırmazlık işlemi görmüştür. Sukulent ve kaktüsler için ideal hava akışı sağlar. Mat renk seçenekleri ile her odaya uyum sağlar.",
        basePrice: 180.00,
        categories: ["Dekorasyon", "Ev"],
        tags: ["Minimalist", "İndirim"],
        imageUrl: "https://picsum.photos/id/106/600/600",
        rating: 4.7,
        reviewCount: 45,
        sales: 850,
        availableMaterials: [MaterialType.PLA],
        availableColors: ['#1e293b', '#ffffff', '#94a3b8', '#78350f'],
        availableSizes: [SizeType.SMALL, SizeType.MEDIUM, SizeType.LARGE, SizeType.XLARGE]
    },
    {
        id: 3,
        name: "Lithophane Photo Lamp",
        shortDescription: "Fotoğrafınız ışıkla canlansın.",
        description: "Özel üretim litofan lamba. Işık kapalıyken kabartmalı beyaz bir yüzey gibi görünür, ışık açıldığında ise 3 boyutlu derinlik sayesinde fotoğrafınız yüksek detayla ortaya çıkar. Hediye için eşsiz bir seçenek.",
        basePrice: 350.00,
        categories: ["Aydınlatma", "Hediye", "Özel Yapım"],
        tags: ["Kişiye Özel", "Hediye"],
        imageUrl: "https://picsum.photos/id/312/600/600",
        rating: 5.0,
        reviewCount: 82,
        sales: 1200,
        availableMaterials: [MaterialType.PLA], // Resin changed to PLA
        availableColors: ['#ffffff'],
        availableSizes: [SizeType.MEDIUM, SizeType.LARGE]
    },
    {
        id: 4,
        name: "Headphone Stand - Low Poly",
        shortDescription: "Kulaklığınız için şık bir stant.",
        description: "Masanızın düzenini sağlarken estetik bir görünüm katan kulaklık standı. Dengeli ağırlık merkezi sayesinde devrilmez. Kafa bandına zarar vermeyen pürüzsüz yüzey.",
        basePrice: 220.00,
        categories: ["Aksesuar", "Ofis", "Teknoloji"],
        tags: ["Ofis", "Pratik"],
        imageUrl: "https://picsum.photos/id/36/600/600",
        rating: 4.6,
        reviewCount: 29,
        sales: 600,
        availableMaterials: [MaterialType.PLA, MaterialType.ABS],
        availableColors: ['black', '#ea580c', '#475569'],
        availableSizes: [SizeType.MEDIUM]
    }
];
