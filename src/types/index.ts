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
  hasSubcategories: boolean;
  productCount: number;
  isActive: boolean;
  filterType: 'checkbox' | 'radio' | 'dropdown';
  hasSearch: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  partnerId: string;
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