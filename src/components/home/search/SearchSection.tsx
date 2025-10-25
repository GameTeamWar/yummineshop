'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Clock, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchSectionProps {
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobile: boolean;
  stores: any[];
  discountedProducts: any[];
  popularProducts: any[];
  categories: any[];
}

const SearchSection: React.FC<SearchSectionProps> = ({
  darkMode,
  searchQuery,
  setSearchQuery,
  isMobile,
  stores,
  discountedProducts,
  popularProducts,
  categories
}) => {
  const router = useRouter();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDesktopSearchExpanded, setIsDesktopSearchExpanded] = useState(false);

  // Arama yapıldığında kart pozisyonlarını yeniden ayarla
  useEffect(() => {
    if (searchQuery.trim()) {
      // Arama sonuçları kısmına scroll et
      setTimeout(() => {
        const searchResultsElement = document.querySelector('[data-search-results]');
        if (searchResultsElement) {
          searchResultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchQuery]);

  // Search functionality for products
  const searchedProducts = searchQuery.trim() ? [
    ...discountedProducts.filter(product => {
      const query = searchQuery.toLowerCase().trim();
      const productName = product.name.toLowerCase();
      const storeName = product.store.toLowerCase();

      return productName.includes(query) || storeName.includes(query);
    }),
    ...popularProducts.filter(product => {
      const query = searchQuery.toLowerCase().trim();
      const productName = product.name.toLowerCase();
      const storeName = product.store.toLowerCase();

      return productName.includes(query) || storeName.includes(query);
    })
  ] : [];

  // Filtered and sorted stores for search
  const filteredAndSortedStores = stores.filter(store => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const storeName = store.name.toLowerCase();
      const storeTypeName = store.storeType === 'esnaf' ? 'esnaf' :
                           store.storeType === 'avm' ? 'avm' :
                           store.storeType === 'marka' ? 'marka' : '';

      // Search in store name, or store type
      if (!storeName.includes(query) && !storeTypeName.includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="py-8 sm:py-1 pb-2">
      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-8" data-search-results>
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
            Arama Sonuçları "{searchQuery}" ({searchedProducts.length + filteredAndSortedStores.length})
          </h2>

          {/* Products in search results */}
          {searchedProducts.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Ürünler</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchedProducts.map((product, index) => (
                  <div key={`search-product-${product.id}-${index}`} onClick={() => {
                    router.push(`/product/${product.id}`);
                  }} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                    <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      {'discount' in product && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discount}%
                          </span>
                        </div>
                      )}
                      {!('discount' in product) && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            🔥 Popüler
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                          Bu Benim Olmalı!
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        {'discount' in product ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold text-sm">₺{product.currentPrice}</span>
                            <span className={`text-xs line-through ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>₺{product.originalPrice}</span>
                          </div>
                        ) : (
                          <span className="text-green-500 font-bold text-sm">₺{product.price.toLocaleString()}</span>
                        )}
                        <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.rating}</span>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount} yorum)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stores in search results */}
          {filteredAndSortedStores.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Mağazalar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedStores.map(store => (
                <div key={`search-store-${store.id}`} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
                  <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className={`absolute inset-0 ${darkMode ? 'bg-linear-to-br from-black/20 to-black/40' : 'bg-linear-to-br from-black/10 to-black/20'}`}></div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300 ${darkMode ? 'bg-white text-gray-900' : 'bg-neutral-950 text-white'}`}>
                        {store.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 group-hover:opacity-70 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.name}</h3>
                    <div className={`flex items-center gap-4 mb-3 pb-3 border-b transition-colors duration-300 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.rating}</span>
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>({store.items})</span>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 mb-4 text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-700'}`}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{store.distance} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{store.delivery} dk</span>
                      </div>
                    </div>

                    <button onClick={() => router.push(`/store/${store.id}`)} className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group text-xs sm:text-base bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl`}>
                      Mağazayı Gör
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {searchedProducts.length === 0 && filteredAndSortedStores.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">"{searchQuery}" için sonuç bulunamadı</p>
              <p className="text-sm mt-2">Farklı anahtar kelimeler deneyebilirsiniz</p>
            </div>
          )}
        </div>
      )}

      {/* Fixed Search Button - Bottom right for both mobile and desktop */}
      <div className={`fixed z-60 ${isMobile ? 'bottom-28 right-4' : 'bottom-6 right-6'}`}>
        <div className={`relative flex items-center transition-all duration-500 ease-in-out ${isDesktopSearchExpanded ? (isMobile ? 'w-64' : 'w-80') : 'w-12'}`}>
          <button
            onClick={() => setIsDesktopSearchExpanded(!isDesktopSearchExpanded)}
            className={`absolute right-0 z-20 ${isMobile ? 'p-2.5' : 'p-3'} rounded-lg transition-all duration-300 shadow-lg border-2 ${
              isDesktopSearchExpanded 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 animate-pulse' 
                : 'bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-blue-500 hover:border-blue-600 animate-bounce'
            }`}
          >
            <Search className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 ${isDesktopSearchExpanded ? 'scale-110 rotate-12' : 'scale-100'}`} />
          </button>

          {/* Expandable Input */}
          <input
            type="text"
            placeholder={isDesktopSearchExpanded ? "Ürün, kategori, mağaza veya marka ara..." : ""}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              // Auto-collapse when losing focus and empty
              if (!searchQuery.trim()) {
                setTimeout(() => setIsDesktopSearchExpanded(false), 150);
              }
            }}
            className={`w-full ${isMobile ? 'pr-12 pl-3 py-2.5' : 'pr-14 pl-4 py-3'} rounded-lg border transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-lg ${
              isDesktopSearchExpanded
                ? `opacity-100 ${darkMode ? 'bg-gray-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`
                : 'opacity-0 w-0 p-0 border-0'
            }`}
            style={{
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              width: isDesktopSearchExpanded ? '100%' : '0px'
            }}
          />

            <button
              onClick={() => {
                setIsDesktopSearchExpanded(false);
                setSearchQuery('');
              }}
              className={`absolute left-2 z-20 ${isMobile ? 'p-1' : 'p-1.5'} rounded-full transition-all duration-300 ${darkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'}`}
            >
              <X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </button>
        </div>
      </div>
    </div>
  );
};export default SearchSection;