'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield } from 'lucide-react';

// Shopping Page Component
const ShoppingPage = ({ darkMode }: { darkMode: boolean }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    rating: 0,
    deliveryTime: 60,
    distance: 5,
    priceRange: 'all'
  });
  const [sortBy, setSortBy] = useState('rating');
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    { id: 'all', name: 'Tümü', icon: '🛍️' },
    { id: 'textile', name: 'Tekstil', icon: '👕' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '💄' },
    { id: 'accessories', name: 'Aksesuar', icon: '⌚' },
    { id: 'decor', name: 'Dekorasyon', icon: '🏠' }
  ];

  const sortOptions = [
    { id: 'rating', name: 'Puana Göre', icon: Star },
    { id: 'distance', name: 'Mesafeye Göre', icon: MapPin },
    { id: 'delivery', name: 'Teslimat Süresine Göre', icon: Clock },
    { id: 'name', name: 'İsme Göre', icon: ShoppingBag }
  ];

  const stores = [
    { id: 1, name: 'Stil Fashion', category: 'textile', distance: 0.8, delivery: 30, rating: 4.8, items: 145, badge: 'Popüler', price: 'orta' },
    { id: 2, name: 'Beauty Haven', category: 'cosmetics', distance: 1.2, delivery: 35, rating: 4.6, items: 89, badge: 'Hızlı', price: 'yuksek' },
    { id: 3, name: 'Aksesuar Dünyası', category: 'accessories', distance: 0.5, delivery: 25, rating: 4.9, items: 234, badge: 'En yakın', price: 'dusuk' },
    { id: 4, name: 'Modern Ev', category: 'decor', distance: 1.5, delivery: 40, rating: 4.7, items: 167, badge: 'Yeni', price: 'orta' },
    { id: 5, name: 'Trend Moda', category: 'textile', distance: 2.1, delivery: 45, rating: 4.5, items: 198, badge: 'İndirim', price: 'dusuk' },
    { id: 6, name: 'Güzellik Plus', category: 'cosmetics', distance: 0.9, delivery: 28, rating: 4.9, items: 156, badge: 'Popüler', price: 'orta' },
  ];

  const filteredAndSortedStores = stores
    .filter(store => {
      let match = true;
      if (selectedCategory !== 'all' && store.category !== selectedCategory) match = false;
      if (store.rating < filters.rating) match = false;
      if (store.delivery > filters.deliveryTime) match = false;
      if (store.distance > filters.distance) match = false;
      if (filters.priceRange !== 'all' && store.price !== filters.priceRange) match = false;
      return match;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        case 'delivery':
          return a.delivery - b.delivery;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="py-6 sm:py-8 pb-32">
      <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
          <div className={`rounded-2xl p-4 sm:p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
            {/* Categories */}
            <div className="mb-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Kategoriler</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${selectedCategory === cat.id ? (darkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200') : (darkMode ? 'hover:bg-neutral-700 border border-transparent' : 'hover:bg-neutral-100 border border-transparent')}`}>
                    <span className="text-lg">{cat.icon}</span>
                    <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Filtreler</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Minimum Puan</label>
                  <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})} className={`w-full p-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-900 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}>
                    <option value="0">Tümü (0+)</option>
                    <option value="3">3+ Yıldız</option>
                    <option value="4">4+ Yıldız</option>
                    <option value="4.5">4.5+ Yıldız</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Teslimat Süresi (dakika)</label>
                  <input type="range" min="15" max="60" value={filters.deliveryTime} onChange={(e) => setFilters({...filters, deliveryTime: parseInt(e.target.value)})} className="w-full" />
                  <p className="text-xs mt-1">{filters.deliveryTime} dakika</p>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Maksimum Mesafe (km)</label>
                  <input type="range" min="0.5" max="5" value={filters.distance} onChange={(e) => setFilters({...filters, distance: parseFloat(e.target.value)})} className="w-full" />
                  <p className="text-xs mt-1">{filters.distance} km'ye kadar</p>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Fiyat Aralığı</label>
                  <select value={filters.priceRange} onChange={(e) => setFilters({...filters, priceRange: e.target.value})} className={`w-full p-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-900 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}>
                    <option value="all">Tüm Fiyatlar</option>
                    <option value="dusuk">Düşük Fiyat</option>
                    <option value="orta">Orta Fiyat</option>
                    <option value="yuksek">Yüksek Fiyat</option>
                  </select>
                </div>

                <button onClick={() => setFilters({rating: 0, deliveryTime: 60, distance: 5, priceRange: 'all'})} className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-200 hover:bg-neutral-300'}`}>
                  Filtreleri Sıfırla
                </button>
              </div>
            </div>

            {/* Sorting */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sıralama</h3>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button key={option.id} onClick={() => setSortBy(option.id)} className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${sortBy === option.id ? (darkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-50 border border-green-200') : (darkMode ? 'hover:bg-neutral-700 border border-transparent' : 'hover:bg-neutral-100 border border-transparent')}`}>
                    <option.icon className="w-4 h-4" />
                    <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Sections */}
          <div className="space-y-8 mb-8">
            {/* İndirimli Ürünler */}
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>İndirimli Ürünler</h2>
              <div className="relative overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    { id: 1, name: 'Kışlık Mont', discount: 40, originalPrice: 299, currentPrice: 179, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop', store: 'Zara' },
                    { id: 2, name: 'Spor Ayakkabı', discount: 30, originalPrice: 450, currentPrice: 315, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', store: 'Nike' },
                    { id: 3, name: 'Cüzdan', discount: 25, originalPrice: 120, currentPrice: 90, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', store: 'Adidas' },
                    { id: 4, name: 'Güneş Gözlüğü', discount: 35, originalPrice: 180, currentPrice: 117, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop', store: 'Ray-Ban' },
                    { id: 5, name: 'Saat', discount: 20, originalPrice: 350, currentPrice: 280, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', store: 'Casio' },
                    { id: 6, name: 'Çanta', discount: 45, originalPrice: 200, currentPrice: 110, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', store: 'Gucci' }
                  ].map(product => (
                    <div key={product.id} className={`flex-shrink-0 w-64 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discount}%
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
            </div>

            {/* Sana Özel Markalar */}
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sana Özel Markalar</h2>
              <div className="relative overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    { id: 1, name: 'Nike', image: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png' },
                    { id: 2, name: 'Adidas', image: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png' },
                    { id: 3, name: 'Puma', image: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png' },
                    { id: 4, name: 'Zara', image: 'https://logos-world.net/wp-content/uploads/2020/04/Zara-Logo.png' },
                    { id: 5, name: 'H&M', image: 'https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png' },
                    { id: 6, name: 'Levi\'s', image: 'https://logos-world.net/wp-content/uploads/2020/04/Levis-Logo.png' }
                  ].map(brand => (
                    <div key={brand.id} className={`flex-shrink-0 w-32 h-32 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                        <img src={brand.image} alt={brand.name} className="w-20 h-20 object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popüler Ürünler */}
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Popüler Ürünler</h2>
              <div className="relative overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    { id: 1, name: 'iPhone 15', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', price: 25000, store: 'Apple Store' },
                    { id: 2, name: 'MacBook Air', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop', price: 35000, store: 'Apple Store' },
                    { id: 3, name: 'AirPods', image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop', price: 4500, store: 'Apple Store' },
                    { id: 4, name: 'iPad Pro', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop', price: 18000, store: 'Apple Store' },
                    { id: 5, name: 'Apple Watch', image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=300&fit=crop', price: 8000, store: 'Apple Store' }
                  ].map(product => (
                    <div key={product.id} className={`flex-shrink-0 w-64 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            🔥 Popüler
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
                          <span className="text-green-500 font-bold text-sm">₺{product.price.toLocaleString()}</span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popüler Mağazalar */}
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Popüler Mağazalar</h2>
              <div className="relative overflow-hidden">
                {/* Navigation Buttons */}
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
                    currentSlide === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-110'
                  } ${darkMode ? 'bg-gray-800 border border-neutral-700 text-white hover:bg-gray-700' : 'bg-white border border-neutral-200 text-neutral-950 hover:bg-neutral-50'}`}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button
                  onClick={() => setCurrentSlide(Math.min(11, currentSlide + 1))}
                  disabled={currentSlide === 11}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
                    currentSlide === 11
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-110'
                  } ${darkMode ? 'bg-gray-800 border border-neutral-700 text-white hover:bg-gray-700' : 'bg-white border border-neutral-200 text-neutral-950 hover:bg-neutral-50'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slider Content */}
                <div className="overflow-hidden">
                  {currentSlide === 11 ? (
                    // Tüm mağazaları grid şeklinde göster
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {[
                        { id: 1, name: 'Teknoloji Dünyası', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop', rating: 4.9, reviews: 1250 },
                        { id: 2, name: 'Moda Center', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop', rating: 4.8, reviews: 980 },
                        { id: 3, name: 'Elektronik Plus', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=600&fit=crop', rating: 4.7, reviews: 1540 },
                        { id: 4, name: 'Spor Giyim', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop', rating: 4.9, reviews: 890 },
                        { id: 5, name: 'Ev & Yaşam', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop', rating: 4.6, reviews: 720 },
                        { id: 6, name: 'Kitap Evi', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', rating: 4.8, reviews: 650 },
                        { id: 7, name: 'Güzellik Salonu', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop', rating: 4.7, reviews: 920 },
                        { id: 8, name: 'Pet Shop', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=600&fit=crop', rating: 4.5, reviews: 480 },
                        { id: 9, name: 'Otel Ekipmanları', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop', rating: 4.9, reviews: 340 },
                        { id: 10, name: 'Bahçe Malzemeleri', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop', rating: 4.6, reviews: 580 },
                        { id: 11, name: 'Kırtasiye', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', rating: 4.7, reviews: 420 }
                      ].map(store => (
                        <div key={store.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                          <div className={`h-48 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                            <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                <Star className="w-3 h-3 fill-current" />
                                {store.rating}
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.name}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(store.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                                <span className={`text-xs font-medium ml-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.rating}</span>
                              </div>
                              <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{store.reviews}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Tek tek mağaza slider'ı
                    <div
                      className="flex gap-4 transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 224}px)` }}
                    >
                      {[
                        { id: 1, name: 'Teknoloji Dünyası', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop', rating: 4.9, reviews: 1250 },
                        { id: 2, name: 'Moda Center', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop', rating: 4.8, reviews: 980 },
                        { id: 3, name: 'Elektronik Plus', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=600&fit=crop', rating: 4.7, reviews: 1540 },
                        { id: 4, name: 'Spor Giyim', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop', rating: 4.9, reviews: 890 },
                        { id: 5, name: 'Ev & Yaşam', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop', rating: 4.6, reviews: 720 },
                        { id: 6, name: 'Kitap Evi', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', rating: 4.8, reviews: 650 },
                        { id: 7, name: 'Güzellik Salonu', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop', rating: 4.7, reviews: 920 },
                        { id: 8, name: 'Pet Shop', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=600&fit=crop', rating: 4.5, reviews: 480 },
                        { id: 9, name: 'Otel Ekipmanları', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop', rating: 4.9, reviews: 340 },
                        { id: 10, name: 'Bahçe Malzemeleri', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop', rating: 4.6, reviews: 580 },
                        { id: 11, name: 'Kırtasiye', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', rating: 4.7, reviews: 420 }
                      ].map(store => (
                        <div key={store.id} className={`flex-shrink-0 w-52 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                          <div className={`h-64 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                            <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute top-3 right-3">
                              <div className="flex items-center gap-1 bg-yellow-500 text-black text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                                <Star className="w-4 h-4 fill-current" />
                                {store.rating}
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className={`font-bold text-lg mb-3 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.name}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(store.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                                <span className={`text-sm font-semibold ml-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.rating}</span>
                              </div>
                              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{store.reviews} değerlendirme</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stores Grid */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">
              {selectedCategory === 'all' ? 'Önerilen Mağazalar' : `${categories.find(c => c.id === selectedCategory)?.name} Mağazaları`}
              <span className={`text-sm ml-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>({filteredAndSortedStores.length})</span>
            </h2>
          </div>

          {filteredAndSortedStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedStores.map(store => (
                <div key={store.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
                  <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800 to-neutral-700' : 'bg-gradient-to-br from-neutral-200 to-neutral-300'}`}>
                    <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-white/5 to-white/10' : 'bg-gradient-to-br from-black/5 to-black/10'}`}></div>
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

                    <button className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base ${darkMode ? 'bg-white text-gray-900 hover:bg-neutral-100' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>
                      Mağazayı Gör
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`rounded-2xl p-8 sm:p-12 text-center ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className={`text-lg font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Aradığınız kriterlere uygun mağaza bulunamadı
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
                Filtreleri değiştirerek deneyin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;