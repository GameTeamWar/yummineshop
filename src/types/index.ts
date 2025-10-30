export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  categoryName: string;
  options: string[]; // Option ID'leri
  tags: string[]; // Tag ID'leri
  images: string[]; // Firebase Storage URL'leri
  description?: string;
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  material?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
  partnerId: string; // Mağaza sahibi ID'si
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string; // Mağaza alt kategorileri için
  hasSubcategories: boolean;
  subcategories?: Category[];
  productCount: number;
  isActive: boolean;
  filterType: 'checkbox' | 'radio' | 'dropdown';
  hasSearch: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  partnerId: string;
  icon?: string;
  color?: string;
  courierCompatible?: boolean;
  order?: number; // Admin panelinde kullanılan sıralama field'ı
  // Mağaza kategorileri için ek alanlar
  childCategories?: string[]; // Alt kategori ID'leri
  productCategories?: string[]; // Ürün kategori ID'leri
}

export interface Option {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  type: 'color' | 'size' | 'material' | 'brand' | 'other';
  value: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  partnerId: string;
}

export interface Tag {
  id: string;
  name: string;
  category: string; // popularity, promotion, seasonal, urgency, quality, trend, other
  color: string;
  description?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  partnerId: string;
  icon?: string;
}

export interface StoreSettings {
  id: string;
  partnerId: string;
  storeName: string;
  isOpen: boolean;
  workingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'banned' | 'needs_correction';
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  categoryName?: string; // Site kategori adı
  categories?: string[]; // Ürün kategorileri ID'leri
  storeType?: 'esnaf' | 'avm' | 'marka';
  description?: string;
  image?: string;
  logo?: string; // Logo URL'i
  rating?: number;
  items?: number;
  distance?: number;
  delivery?: number;
  badge?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Yeni alanlar
  taxId?: string;
  companyName?: string;
  corporateType?: 'PRIVATE' | 'LIMITED' | 'INCORPORATED';
  iban?: string;
  birthDate?: string;
  kepAddress?: string;
  branchCount?: number;
  isMainBranch?: boolean;
  branchReferenceCode?: string;
  hasBranches?: boolean;
  hasAuthorizedPersons?: boolean;
  logoURL?: string;
  ownerName?: string; // Mağaza sahibi adı
  location?: { // Detaylı adres bilgileri
    province?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
    detailedAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  authorizedPersons?: Array<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: string;
    idCard?: string;
  }>;
  documents?: {
    idCard?: string;
    driversLicense?: string;
    taxCertificate?: string;
  };
  // Onay süreci için
  correctionRequests?: Array<{
    id: string;
    requestedBy: string; // Admin ID
    requestedAt: Date;
    fields: string[]; // Düzeltilecek alanlar
    description: string; // Düzeltme açıklaması
    status: 'pending' | 'completed' | 'cancelled';
    corrections?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      correctedAt: Date;
    }>;
  }>;
  approvedBy?: string; // Admin ID
  approvedAt?: Date;
  rejectionReason?: string;
  siteCategory?: string; // Site ana kategorisi
  siteCategoryId?: string;
}

export interface SiteCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  storeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: number; // 0: Admin, 1: Mağaza, 2: Müşteri, 3: Kurye, 5: Alt Kullanıcı
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  banned?: boolean;
  banDuration?: number; // Yasaklama süresi (gün cinsinden)
  banReason?: string; // Yasaklama sebebi
  banNote?: string; // Yasaklama notu
  bannedAt?: Date; // Yasaklama tarihi
  bannedBy?: string; // Yasaklayan admin ID
  deleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  permissions?: {
    canViewUsers: boolean;
    canManageUsers: boolean;
    canViewStores: boolean;
    canManageStores: boolean;
    canViewProducts: boolean;
    canManageProducts: boolean;
    canViewOrders: boolean;
    canManageOrders: boolean;
    canViewFinance: boolean;
    canViewAnalytics: boolean;
    canSendNotifications: boolean;
    canManageCouriers: boolean;
  };
}