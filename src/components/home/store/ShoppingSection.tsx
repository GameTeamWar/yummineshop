'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Shopping Page Component
const ShoppingPage = ({ darkMode, searchQuery }: { darkMode: boolean, searchQuery: string }) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [popularProductsSlide, setPopularProductsSlide] = useState(0);
  const [discountedProductsSlide, setDiscountedProductsSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    rating: 0,
    delivery: 0,
    distance: 0,
    price: 'all',
    storeType: 'all'
  });
  const [sortBy, setSortBy] = useState('recommended');
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'Tümü', icon: '🛍️' },
    { id: 'products', name: 'Ürünler', icon: '🛒', subcategories: [
      { id: 'popular', name: 'Popüler Ürünler', icon: '🔥' },
      { id: 'discounted', name: 'İndirimli Ürünler', icon: '💰' },
      { id: 'new', name: 'Yeni Ürünler', icon: '✨' },
      { id: 'trending', name: 'Trend Ürünler', icon: '📈' },
      { id: 'flash', name: 'Flaş İndirimler', icon: '⚡' },
      // { id: 'school', name: 'Okul Ürünleri', icon: '📚' },
      { id: 'winter', name: 'Kışlık Ürünler', icon: '❄️' },
      { id: 'summer', name: 'Yazlık Ürünler', icon: '☀️' },
      { id: 'electronics', name: 'Elektronik Ürünler', icon: '📱' },
      { id: 'sports', name: 'Spor Ürünler', icon: '⚽' }
    ]},
    { id: 'textile', name: 'Tekstil', icon: '👕' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '💄' },
    { id: 'accessories', name: 'Aksesuar', icon: '⌚' },
    { id: 'decor', name: 'Dekorasyon', icon: '🏠' }
  ];

  const stores = [
    { id: 1, name: 'Stil Fashion', category: 'textile', distance: 0.8, delivery: 30, rating: 4.8, items: 145, badge: 'Popüler', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop' },
    { id: 2, name: 'Beauty Haven', category: 'cosmetics', distance: 1.2, delivery: 35, rating: 4.6, items: 89, badge: 'Hızlı', price: 'yuksek', storeType: 'avm', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop' },
    { id: 3, name: 'Aksesuar Dünyası', category: 'accessories', distance: 0.5, delivery: 25, rating: 4.9, items: 234, badge: 'En yakın', price: 'dusuk', storeType: 'esnaf', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop' },
    { id: 4, name: 'Modern Ev', category: 'decor', distance: 1.5, delivery: 40, rating: 4.7, items: 167, badge: 'Yeni', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
    { id: 5, name: 'Trend Moda', category: 'textile', distance: 2.1, delivery: 45, rating: 4.5, items: 198, badge: 'İndirim', price: 'dusuk', storeType: 'avm', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop' },
    { id: 6, name: 'Güzellik Plus', category: 'cosmetics', distance: 0.9, delivery: 28, rating: 4.9, items: 156, badge: 'Popüler', price: 'orta', storeType: 'esnaf', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
  ];

  // Products data
  const discountedProducts = [
    { id: 1, name: 'Kışlık Mont', discount: 40, originalPrice: 299, currentPrice: 179, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop', store: 'Zara', category: 'textile', rating: 4.7, reviewCount: 89 },
    { id: 2, name: 'Spor Ayakkabı', discount: 30, originalPrice: 450, currentPrice: 315, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', store: 'Nike', category: 'accessories', rating: 4.8, reviewCount: 156 },
    { id: 3, name: 'Cüzdan', discount: 25, originalPrice: 120, currentPrice: 90, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', store: 'Adidas', category: 'accessories', rating: 4.5, reviewCount: 67 },
    { id: 4, name: 'Güneş Gözlüğü', discount: 35, originalPrice: 180, currentPrice: 117, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop', store: 'Ray-Ban', category: 'accessories', rating: 4.6, reviewCount: 94 },
    { id: 5, name: 'Saat', discount: 20, originalPrice: 350, currentPrice: 280, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', store: 'Casio', category: 'accessories', rating: 4.4, reviewCount: 78 },
    { id: 6, name: 'Çanta', discount: 45, originalPrice: 200, currentPrice: 110, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', store: 'Gucci', category: 'accessories', rating: 4.9, reviewCount: 203 },
  ];

  const popularProducts = [
    { id: 1, name: 'iPhone 15', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', price: 25000, store: 'Apple Store', category: 'electronics', rating: 4.8, reviewCount: 342 },
    { id: 2, name: 'MacBook Air', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop', price: 35000, store: 'Apple Store', category: 'electronics', rating: 4.9, reviewCount: 287 },
    { id: 3, name: 'AirPods', image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop', price: 4500, store: 'Apple Store', category: 'electronics', rating: 4.7, reviewCount: 198 },
    { id: 4, name: 'iPad Pro', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop', price: 18000, store: 'Apple Store', category: 'electronics', rating: 4.6, reviewCount: 167 },
    { id: 5, name: 'Apple Watch', image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=300&fit=crop', price: 8000, store: 'Apple Store', category: 'electronics', rating: 4.5, reviewCount: 134 },
  ];

  // Search functionality for products
  const searchedProducts = searchQuery.trim() ? [
    ...discountedProducts.filter(product => {
      const query = searchQuery.toLowerCase().trim();
      const productName = product.name.toLowerCase();
      const storeName = product.store.toLowerCase();
      const categoryName = categories.find(cat => cat.id === product.category)?.name.toLowerCase() || '';
      
      return productName.includes(query) || storeName.includes(query) || categoryName.includes(query);
    }),
    ...popularProducts.filter(product => {
      const query = searchQuery.toLowerCase().trim();
      const productName = product.name.toLowerCase();
      const storeName = product.store.toLowerCase();
      
      return productName.includes(query) || storeName.includes(query);
    })
  ] : [];

  // Filtered and sorted stores
  const filteredAndSortedStores = stores
    .filter(store => {
      if (selectedCategory !== 'all' && store.category !== selectedCategory) return false;
      if (filters.rating > 0 && store.rating < filters.rating) return false;
      if (filters.delivery > 0 && store.delivery > filters.delivery) return false;
      if (filters.distance > 0 && store.distance > filters.distance) return false;
      if (filters.price !== 'all' && store.price !== filters.price) return false;
      if (filters.storeType !== 'all' && store.storeType !== filters.storeType) return false;
      
      // Search functionality
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const storeName = store.name.toLowerCase();
        const categoryName = categories.find(cat => cat.id === store.category)?.name.toLowerCase() || '';
        const storeTypeName = store.storeType === 'esnaf' ? 'esnaf' : 
                             store.storeType === 'avm' ? 'avm' : 
                             store.storeType === 'marka' ? 'marka' : '';
        
        // Search in store name, category name, or store type
        if (!storeName.includes(query) && 
            !categoryName.includes(query) && 
            !storeTypeName.includes(query)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      // Özel sıralama mantığı: seçilen kritere uyan mağazalar en üstte
      let aMatches = false;
      let bMatches = false;

      switch (sortBy) {
        case 'indirim':
          // İndirimli ürünleri olan mağazaları öne çıkar (şimdilik yüksek rating)
          aMatches = a.rating >= 4.5;
          bMatches = b.rating >= 4.5;
          break;
        case 'hizli':
          // Hızlı teslimat yapan mağazaları öne çıkar (30dk altında)
          aMatches = a.delivery <= 30;
          bMatches = b.delivery <= 30;
          break;
        case 'populer':
          // Popüler mağazaları öne çıkar (yüksek puanlı)
          aMatches = a.rating >= 4.5;
          bMatches = b.rating >= 4.5;
          break;
        case 'yeni':
          // Yeni mağazaları öne çıkar (badge kontrolü)
          aMatches = a.badge?.toLowerCase().includes('yeni') || false;
          bMatches = b.badge?.toLowerCase().includes('yeni') || false;
          break;
        case 'rating':
          return b.rating - a.rating;
        case 'delivery':
          return a.delivery - b.delivery;
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          const priceOrder: { [key: string]: number } = { dusuk: 1, orta: 2, yuksek: 3 };
          return priceOrder[a.price] - priceOrder[b.price];
        default:
          return 0;
      }

      // Özel sıralama için: önce eşleşenler sonra eşleşmeyenler
      if (sortBy === 'indirim' || sortBy === 'hizli' || sortBy === 'populer' || sortBy === 'yeni') {
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;

        // Her iki mağaza da aynı gruba aitse, kendi içinde sırala
        if (aMatches && bMatches) {
          switch (sortBy) {
            case 'indirim':
            case 'populer':
              return b.rating - a.rating;
            case 'hizli':
              return a.delivery - b.delivery;
            case 'yeni':
              return b.rating - a.rating;
          }
        } else {
          // Hiçbiri eşleşmiyorsa normal sıralama
          return b.rating - a.rating;
        }
      }

      return 0;
    });


  return (
    <div className="py-6 sm:py-8 pb-32 ">
      <div className="grid lg:grid-cols-4 gap-6 sm:gap-8 ">
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-42 lg:self-start">
          <div className={`rounded-2xl p-4 sm:p-6 pt-12 transition-colors duration-300 max-h-[calc(100vh-8rem)] overflow-y-auto ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
            {/* Categories */}
            <div className="mb-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Kategoriler</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.id}>
                    <button 
                      onClick={() => {
                        if (cat.id === 'all') {
                          window.scrollTo({top: 0, behavior: 'smooth'});
                        } else if (cat.id === 'products') {
                          // Ürünler kategorisi için dropdown aç/kapa
                          setProductsDropdownOpen(!productsDropdownOpen);
                        } else {
                          const element = document.getElementById(`category-${cat.id}`);
                          element?.scrollIntoView({behavior: 'smooth'});
                        }
                      }} 
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${darkMode ? 'hover:bg-neutral-700 border border-transparent' : 'hover:bg-neutral-100 border border-transparent'}`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{cat.name}</span>
                      {cat.subcategories && <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-300 ${productsDropdownOpen ? 'rotate-90' : ''}`} />}
                    </button>
                    
                    {/* Ürünler alt kategorileri */}
                    {cat.id === 'products' && productsDropdownOpen && cat.subcategories && (
                      <div className="ml-6 mt-2 space-y-1">
                        {cat.subcategories.map(subcat => (
                          <button 
                            key={subcat.id}
                            onClick={() => {
                              const element = document.getElementById(`subcategory-${subcat.id}`);
                              element?.scrollIntoView({behavior: 'smooth'});
                            }}
                            className={`w-full text-left p-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm ${darkMode ? 'hover:bg-neutral-600 border border-transparent text-neutral-300 hover:text-white' : 'hover:bg-neutral-200 border border-transparent text-neutral-600 hover:text-neutral-950'}`}
                          >
                            <span className="text-base">{subcat.icon}</span>
                            <span className="font-medium">{subcat.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Filtreler</h3>
              
              {/* Rating Filter */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Minimum Puan</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: Number(e.target.value)})}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                >
                  <option value={0}>Tümü</option>
                  <option value={4}>4+ yıldız</option>
                  <option value={4.5}>4.5+ yıldız</option>
                  <option value={4.8}>4.8+ yıldız</option>
                </select>
              </div>

              {/* Delivery Time Filter */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Teslimat Süresi (dk)</label>
                <select
                  value={filters.delivery}
                  onChange={(e) => setFilters({...filters, delivery: Number(e.target.value)})}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                >
                  <option value={0}>Tümü</option>
                  <option value={30}>30 dk altında</option>
                  <option value={45}>45 dk altında</option>
                  <option value={60}>60 dk altında</option>
                </select>
              </div>

              {/* Distance Filter */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Mesafe (km)</label>
                <select
                  value={filters.distance}
                  onChange={(e) => setFilters({...filters, distance: Number(e.target.value)})}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                >
                  <option value={0}>Tümü</option>
                  <option value={1}>1 km altında</option>
                  <option value={2}>2 km altında</option>
                  <option value={5}>5 km altında</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Fiyat Aralığı</label>
                <select
                  value={filters.price}
                  onChange={(e) => setFilters({...filters, price: e.target.value})}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                >
                  <option value="all">Tümü</option>
                  <option value="dusuk">Düşük</option>
                  <option value="orta">Orta</option>
                  <option value="yuksek">Yüksek</option>
                </select>
              </div>

              {/* Store Type Filter */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Mağaza Türü</label>
                <select
                  value={filters.storeType}
                  onChange={(e) => setFilters({...filters, storeType: e.target.value})}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                >
                  <option value="all">Tümü</option>
                  <option value="esnaf">Esnaf</option>
                  <option value="avm">AVM</option>
                  <option value="marka">Marka</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sıralama</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
              >
                <option value="recommended">Önerilen</option>
                <option value="indirim">İndirim</option>
                <option value="hizli">Hızlı</option>
                <option value="populer">Popüler</option>
                <option value="yeni">Yeni</option>
                <option value="rating">Puana Göre</option>
                <option value="delivery">Teslimat Süresine Göre</option>
                <option value="distance">Mesafeye Göre</option>
                <option value="price">Fiyata Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mb-8">
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                Arama Sonuçları "{searchQuery}" ({searchedProducts.length + filteredAndSortedStores.length})
              </h2>
              
              {/* Products in search results */}
              {searchedProducts.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Ürünler</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchedProducts.map((product, index) => (
                      <div key={`search-product-${product.id}-${index}`} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
                              Bu Benim Olmalı
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedStores.map(store => (
                    <div key={`search-store-${store.id}`} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
                      <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-black/20 to-black/40' : 'bg-gradient-to-br from-black/10 to-black/20'}`}></div>
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300 ${darkMode ? 'bg-white text-gray-900' : 'bg-neutral-950 text-white'}`}>
                            {store.badge}
                          </span>
                        </div>
                      </div>                        <div className="p-4">
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

                          <button className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base ${darkMode ? 'bg-white text-gray-900 hover:bg-neutral-100' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>
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

          {/* Featured Sections - Only show when not searching */}
          {!searchQuery.trim() && (
            <div className="space-y-8 mb-8">
              {/* Ürünler Ana Bölümü */}
              <div id="category-products" className="mb-8">
                <h2 className={`text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-2xl">🛒</span> Ürünler
                </h2>
                <p className={`text-sm mb-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Mağazalarımızdaki ürünleri keşfedin ve en iyi fırsatları yakalayın
                </p>
              </div>

              {/* Popüler Ürünler */}
              <div id="subcategory-popular" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">🔥</span> Popüler Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {popularProducts.slice(0, 4).map((product, index) => (
                    <div key={`popular-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            🔥
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-500 font-bold text-xs">₺{product.price.toLocaleString()}</span>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* İndirimli Ürünler */}
              <div id="subcategory-discounted" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">💰</span> İndirimli Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {discountedProducts.slice(0, 4).map((product, index) => (
                    <div key={`discounted-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            -{product.discount}%
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold text-xs line-through">₺{product.originalPrice.toLocaleString()}</span>
                            <span className="text-green-500 font-bold text-xs">₺{product.currentPrice}</span>
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Okul Ürünleri */}
              {/*
              <div id="subcategory-school" className="mb-8">
                <h2 className={`text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-2xl">📚</span> Okul Ürünleri
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discountedProducts.filter(product => product.name.toLowerCase().includes('çanta') || product.name.toLowerCase().includes('kalem') || product.name.toLowerCase().includes('defter') || product.name.toLowerCase().includes('kitap')).map((product, index) => (
                    <div key={`school-${product.id}-${index}`} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-2 right-2">
                          <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            📚 Okul
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button className="bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                            Bu Benim Olmalı
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold text-sm">₺{product.currentPrice}</span>
                            <span className={`text-xs line-through ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>₺{product.originalPrice}</span>
                          </div>
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              */}

              {/* Kışlık Ürünler */}
              <div id="subcategory-winter" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">❄️</span> Kışlık Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {discountedProducts.filter(product => product.name.toLowerCase().includes('kış') || product.name.toLowerCase().includes('mont') || product.name.toLowerCase().includes('kazak')).slice(0, 4).map((product, index) => (
                    <div key={`winter-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            ❄️
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold text-xs line-through">₺{product.originalPrice.toLocaleString()}</span>
                            <span className="text-green-500 font-bold text-xs">₺{product.currentPrice}</span>
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yeni Ürünler */}
              <div id="subcategory-new" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">✨</span> Yeni Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {discountedProducts.slice(0, 4).map((product, index) => (
                    <div key={`new-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            ✨
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold text-xs line-through">₺{product.originalPrice.toLocaleString()}</span>
                            <span className="text-green-500 font-bold text-xs">₺{product.currentPrice}</span>
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Ürünler */}
              <div id="subcategory-trending" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">📈</span> Trend Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {popularProducts.slice(0, 4).map((product, index) => (
                    <div key={`trending-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            📈
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-500 font-bold text-xs">₺{product.price.toLocaleString()}</span>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flaş İndirimler */}
              <div id="subcategory-flash" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">⚡</span> Flaş İndirimler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {discountedProducts.filter(product => product.discount >= 30).slice(0, 4).map((product, index) => (
                    <div key={`flash-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded animate-pulse">
                            ⚡
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold text-xs line-through">₺{product.originalPrice.toLocaleString()}</span>
                            <span className="text-green-500 font-bold text-xs">₺{product.currentPrice}</span>
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elektronik Ürünler */}
              <div id="subcategory-electronics" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">📱</span> Elektronik Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {popularProducts.slice(0, 4).map((product, index) => (
                    <div key={`electronics-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            📱
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-500 font-bold text-xs">₺{product.price.toLocaleString()}</span>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spor Ürünler */}
              <div id="subcategory-sports" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">⚽</span> Spor Ürünler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {discountedProducts.filter(product => product.name.toLowerCase().includes('spor') || product.name.toLowerCase().includes('ayakkabı') || product.name.toLowerCase().includes('top')).slice(0, 4).map((product, index) => (
                    <div key={`sports-${product.id}-${index}`} className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-28 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-1 left-1">
                          <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            ⚽
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold text-xs line-through">₺{product.originalPrice.toLocaleString()}</span>
                            <span className="text-green-500 font-bold text-xs">₺{product.currentPrice}</span>
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category Sections - Only show when not searching */}
          {!searchQuery.trim() && categories.filter(cat => cat.id !== 'all').map(cat => {
            const categoryStores = filteredAndSortedStores.filter(store => store.category === cat.id);
            if (categoryStores.length === 0) return null;
            return (
              <div key={cat.id} id={`category-${cat.id}`} className="mb-8">
                <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{cat.name} Mağazaları ({categoryStores.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryStores.map(store => (
                    <div key={store.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
                      <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-black/20 to-black/40' : 'bg-gradient-to-br from-black/10 to-black/20'}`}></div>
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

                        <button onClick={() => router.push(`/store/${store.id}`)} className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base ${darkMode ? 'bg-white text-gray-900 hover:bg-neutral-100' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>
                          Mağazayı Gör
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
