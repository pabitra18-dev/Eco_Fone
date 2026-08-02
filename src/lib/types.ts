
import { z } from 'zod';

export type ProductCategoryRating = 'GOAT' | 'Great' | 'Good' | 'OK';

export interface ProductCategories {
  gamingPerformance: ProductCategoryRating;
  camera: ProductCategoryRating;
  battery: ProductCategoryRating;
  looksAndFeel: ProductCategoryRating;
  valueForMoney: ProductCategoryRating;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: number;
  paymentMobileNumber?: string;
  tags: string[];
  description: string;
  condition: 'Excellent' | 'Very Good' | 'Good' | 'Fair';
  featured?: boolean;
  hero?: boolean;
  categories: ProductCategories;
  specs: {
    network: string;
    dimensions: string;
    weight: string;
    build: string;
    sim: string;
    display: {
      type: string;
      size: string;
      resolution: string;
      protection: string;
    };
    platform: {
      os: string;
      chipset: string;
      cpu: string;
      gpu: string;
    };
    memory: {
      ram: string;
      storage: string;
      card_slot: string;
    };
    mainCamera: {
      modules: string;
      features: string;
      video: string;
    };
    selfieCamera: {
      modules: string;
      features: string;
      video: string;
    };
    sound: {
      loudspeaker: string;
      jack_3_5mm: string;
    };
    features: string[];
    battery: {
      type: string;
      charging: string;
    };
  };
  batteryHealth?: string;
  fullSpecsGsmArena: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    email: string;
    orderDate: string; // Stored as ISO string
    subtotal: number;
    vat: number;
    totalAmount: number;
    status: 'Pending Payment' | 'Processing' | 'Payment Verified' | 'Shipped' | 'Delivered' | 'Cancelled';
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }[];
    shippingAddress: {
        name: string;
        address: string;
        province: string;
        district: string;
        localLevel: string;
        phone: string;
    };
    paymentMethod?: 'online' | 'cod';
    codFee?: number;
    codPrepayment?: number;
    qrCodeUrl?: string;
    esewaTransactionNumber?: string;
    esewaTransactionCode?: string;
    paymentScreenshotUrl?: string;
}


export interface SiteUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'Master Admin' | 'Admin' | 'User';
    joinedDate: string;
    avatar?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  avatar: string;
  dataAiHint?: string;
  rating?: number;
}

export interface Sell {
  id: string;
  userId: string;
  createdAt: string; // ISO string for creation date
  fullName: string;
  email: string;
  phone: string;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  overallCondition: string;
  screenCondition: string;
  batteryHealth: string;
  age: number;
  location: string;
  socialMediaPlatform?: string;
  socialMediaHandle?: string;
  additionalInfo: string;
  deviceSwitchesOn: boolean;
  isMDMSRegistered: boolean;
  wasRepaired: boolean;
  deviceProblems: string[];
  hasOriginalAccessories: boolean;
  accessories: string[];
  otherAccessory: string;
  hasPurchaseBill: boolean;
  accessoryDetails: string;
  imeiMatchesBox: boolean;
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'completed';
  acceptedPrice?: number;
  negotiationReason?: string;
  negotiationPriceRange?: [number, number];
}

export const sellRequestSchema = z.object({
  userId: z.string(),
  brand: z.string().min(1),
  model: z.string().min(1),
  storage: z.string().min(1),
  ram: z.string().optional(),
  overallCondition: z.string().min(1),
  screenCondition: z.string().min(1),
  batteryHealth: z.string().optional(),
  age: z.number().min(0),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  location: z.string().min(1),
  socialMediaPlatform: z.string().optional().nullable(),
  socialMediaHandle: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
  deviceSwitchesOn: z.boolean(),
  isMDMSRegistered: z.boolean(),
  wasRepaired: z.boolean(),
  deviceProblems: z.array(z.string()),
  hasOriginalAccessories: z.boolean(),
  accessories: z.array(z.string()),
  otherAccessory: z.string().optional().nullable(),
  hasPurchaseBill: z.boolean(),
  accessoryDetails: z.string().optional().nullable(),
  imeiMatchesBox: z.boolean(),
  status: z.enum(['pending', 'negotiating', 'accepted', 'rejected', 'completed']),
  acceptedPrice: z.number().optional(),
  negotiationReason: z.string().optional(),
  negotiationPriceRange: z.array(z.number()).length(2).optional(),
});

export type SellRequestSchemaType = z.infer<typeof sellRequestSchema>;

export interface Demand {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  socialMedia?: string;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  createdAt: string; // ISO string
  batteryHealth?: string | null;
  expectedPrice?: [number, number];
  categories: Partial<ProductCategories>; // Customers might not specify all
  status: 'new' | 'in progress' | 'fulfilled' | 'rejected';
}


export type SiteImageKeys = 
  | 'whyUsHero'
  | 'reviewerAvatar1';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface SiteSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  insideValleyRate: number;
  outsideValleyRate: number;
  socialFacebook: string;
  socialInstagram: string;
  socialX: string;
}
