'use client';

import { ChevronLeft, MapPin, Clock, Star, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StoreInfoBarProps {
  store: {
    name: string;
    rating: number;
    reviews: number;
    distance: number;
    delivery: number;
    items: number;
  };
  darkMode: boolean;
  showBackButton?: boolean;
  showSortSelector?: boolean;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  currentProduct?: any;
  showProductDetail?: boolean;
}

export default function StoreInfoBar({ 
  store, 
  darkMode, 
  showBackButton = false, 
  showSortSelector = false,
  sortBy = 'popular',
  onSortChange,
  currentProduct,
  showProductDetail = false
}: StoreInfoBarProps) {
  const router = useRouter();

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border-b`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Geri</span>
            </button>
          )}
          <div className="flex items-center gap-1">
            <span className={`text-lg font-bold mr-5 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.name}</span>
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-bold">{store.rating}</span>
            <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>({store.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{store.distance} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{store.delivery} dakika</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{store.items} ürün</span>
          </div>
          {!currentProduct && showSortSelector && (
            <div className="flex justify-end ml-auto">
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-neutral-700 text-white'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-950'
                }`}
              >
                <option value="popular">Popüler</option>
                <option value="price-low">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-high">Fiyat (Yüksekten Düşüğe)</option>
              </select>
            </div>
          )}
          {showProductDetail && (
            <div className="ml-auto">
              <span className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                Ürün Detayları
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
