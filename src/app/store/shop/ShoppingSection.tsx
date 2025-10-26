'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CategoryBar from '@/components/store/categories/categorybar';
import Category from '@/components/store/categories/category';
import SearchSection from '@/components/store/search/SearchSection';

// ShoppingSection Props Interface
interface ShoppingSectionProps {
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobile: boolean;
}

// Product Image Slider Component
const ProductImageSlider = ({ images, alt, className }: { images: string[], alt: string, className?: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const index = Math.floor((x / width) * images.length);
    setCurrentImageIndex(Math.min(index, images.length - 1));
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img 
        src={images[currentImageIndex]} 
        alt={alt} 
        className="w-full h-full object-cover transition-all duration-300" 
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <div 
              key={index} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Shopping Page Component
const ShoppingPage = ({ darkMode, searchQuery, setSearchQuery, isMobile }: ShoppingSectionProps) => {
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
  const [sidebarTopOffset, setSidebarTopOffset] = useState(64); // Default 16 * 4 = 64px


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

  const stores = [
    { id: 1, name: 'Stil Fashion', category: 'textile', distance: 0.8, delivery: 30, rating: 4.8, items: 145, badge: 'Popüler', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop' },
    { id: 2, name: 'Beauty Haven', category: 'cosmetics', distance: 1.2, delivery: 35, rating: 4.6, items: 89, badge: 'Hızlı', price: 'yuksek', storeType: 'avm', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop' },
    { id: 3, name: 'Aksesuar Dünyası', category: 'accessories', distance: 0.5, delivery: 25, rating: 4.9, items: 234, badge: 'En yakın', price: 'dusuk', storeType: 'esnaf', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop' },
    { id: 4, name: 'Modern Ev', category: 'decor', distance: 1.5, delivery: 40, rating: 4.7, items: 167, badge: 'Yeni', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
    { id: 5, name: 'Trend Moda', category: 'textile', distance: 2.1, delivery: 45, rating: 4.5, items: 198, badge: 'İndirim', price: 'dusuk', storeType: 'avm', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop' },
    { id: 6, name: 'Güzellik Plus', category: 'cosmetics', distance: 0.9, delivery: 28, rating: 4.9, items: 156, badge: 'Popüler', price: 'orta', storeType: 'esnaf', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
    { id: 7, name: 'Apple Store', category: 'electronics', distance: 1.0, delivery: 20, rating: 4.9, items: 89, badge: 'Premium', price: 'yuksek', storeType: 'marka', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop' },
    { id: 8, name: 'Zara', category: 'textile', distance: 0.7, delivery: 25, rating: 4.6, items: 234, badge: 'Trend', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop' },
    { id: 9, name: 'Nike', category: 'accessories', distance: 1.3, delivery: 30, rating: 4.7, items: 156, badge: 'Spor', price: 'yuksek', storeType: 'marka', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop' },
    { id: 10, name: 'Adidas', category: 'accessories', distance: 0.9, delivery: 28, rating: 4.5, items: 198, badge: 'Konfor', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=300&fit=crop' },
    { id: 11, name: 'Ray-Ban', category: 'accessories', distance: 1.1, delivery: 35, rating: 4.8, items: 67, badge: 'Lüks', price: 'yuksek', storeType: 'marka', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop' },
    { id: 12, name: 'Casio', category: 'accessories', distance: 0.6, delivery: 22, rating: 4.4, items: 89, badge: 'Kalite', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
    { id: 13, name: 'Gucci', category: 'accessories', distance: 1.4, delivery: 40, rating: 4.9, items: 145, badge: 'Lüks', price: 'yuksek', storeType: 'marka', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop' },
  ];

  // Products data
  const discountedProducts = [
    { id: 101, name: 'Ayarlanabilir Bel Şişme Yelek', discount: 40, originalPrice: 7999, currentPrice: 4799, images: ['https://picsum.photos/400/400?random=101', 'https://picsum.photos/400/400?random=102', 'https://picsum.photos/400/400?random=103'], store: 'Zara', category: 'textile', rating: 5.0, reviewCount: 1 },
    { id: 102, name: 'Kumaş Mix Colorblock Sweatshirt', discount: 30, originalPrice: 5499, currentPrice: 3849, images: ['https://picsum.photos/400/400?random=104', 'https://picsum.photos/400/400?random=105', 'https://picsum.photos/400/400?random=106'], store: 'Nike', category: 'textile', rating: 5.0, reviewCount: 1 },
    { id: 103, name: 'Triko Mix Dik Yaka Sweatshirt', discount: 25, originalPrice: 4999, currentPrice: 3749, images: ['https://picsum.photos/400/400?random=107', 'https://picsum.photos/400/400?random=108', 'https://picsum.photos/400/400?random=109'], store: 'Adidas', category: 'textile', rating: 4.7, reviewCount: 3 },
    { id: 104, name: 'Payetli Çizgi Desen Gömlek', discount: 35, originalPrice: 3299, currentPrice: 2144, images: ['https://picsum.photos/400/400?random=110', 'https://picsum.photos/400/400?random=111', 'https://picsum.photos/400/400?random=112'], store: 'Ray-Ban', category: 'textile', rating: 3.6, reviewCount: 5 },
    { id: 105, name: 'Pamuklu Basic Tişört', discount: 20, originalPrice: 1299, currentPrice: 1039, images: ['https://picsum.photos/400/400?random=113', 'https://picsum.photos/400/400?random=114', 'https://picsum.photos/400/400?random=115'], store: 'Casio', category: 'textile', rating: 4.8, reviewCount: 42 },
    { id: 106, name: 'Skinny Fit Pantolon', discount: 45, originalPrice: 2999, currentPrice: 1649, images: ['https://picsum.photos/400/400?random=106', 'https://picsum.photos/400/400?random=107', 'https://picsum.photos/400/400?random=108'], store: 'Gucci', category: 'textile', rating: 4.6, reviewCount: 18 },
  ];

  const popularProducts = [
    { id: 107, name: 'Yünlü Kazak', images: ['https://picsum.photos/400/400?random=112', 'https://picsum.photos/400/400?random=113', 'https://picsum.photos/400/400?random=114'], price: 3299, store: 'Apple Store', category: 'electronics', rating: 4.9, reviewCount: 15 },
    { id: 108, name: 'Deri Ceket', images: ['https://picsum.photos/400/400?random=115', 'https://picsum.photos/400/400?random=116', 'https://picsum.photos/400/400?random=117'], price: 8999, store: 'Apple Store', category: 'electronics', rating: 4.7, reviewCount: 8 },
    { id: 109, name: 'Spor Ayakkabı', images: ['https://picsum.photos/400/400?random=118', 'https://picsum.photos/400/400?random=119', 'https://picsum.photos/400/400?random=120'], price: 1899, store: 'Apple Store', category: 'electronics', rating: 4.5, reviewCount: 67 },
    { id: 110, name: 'Çanta', images: ['https://picsum.photos/400/400?random=124', 'https://picsum.photos/400/400?random=125', 'https://picsum.photos/400/400?random=126'], price: 1599, store: 'Apple Store', category: 'electronics', rating: 4.3, reviewCount: 34 },
    { id: 121, name: 'Akıllı Saat', images: ['https://picsum.photos/400/400?random=121', 'https://picsum.photos/400/400?random=122', 'https://picsum.photos/400/400?random=123'], price: 2499, store: 'Apple Store', category: 'electronics', rating: 4.8, reviewCount: 156 },
  ];

  // Lazy loading için state'ler
  const [loadedStores, setLoadedStores] = useState<{[key: string]: any[]}>({
    textile: [],
    cosmetics: [],
    accessories: [],
    decor: [],
    electronics: []
  });
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({
    textile: false,
    cosmetics: false,
    accessories: false,
    decor: false,
    electronics: false
  });
  const [hasMore, setHasMore] = useState<{[key: string]: boolean}>({
    textile: true,
    cosmetics: true,
    accessories: true,
    decor: true,
    electronics: true
  });

  // Kategorilere göre mağazaları grupla
  const storesByCategory = stores.reduce((acc, store) => {
    if (!acc[store.category]) {
      acc[store.category] = [];
    }
    acc[store.category].push(store);
    return acc;
  }, {} as {[key: string]: any[]});

  // Lazy loading fonksiyonu
  const loadMoreStores = (category: string) => {
    if (loadingStates[category] || !hasMore[category]) return;

    setLoadingStates(prev => ({ ...prev, [category]: true }));

    // Simüle edilmiş API çağrısı (gerçekte burada API çağrısı yapılır)
    setTimeout(() => {
      const allStoresInCategory = storesByCategory[category] || [];
      const currentlyLoaded = loadedStores[category].length;
      const nextBatch = allStoresInCategory.slice(currentlyLoaded, currentlyLoaded + 6);

      setLoadedStores(prev => ({
        ...prev,
        [category]: [...prev[category], ...nextBatch]
      }));

      setHasMore(prev => ({
        ...prev,
        [category]: currentlyLoaded + nextBatch.length < allStoresInCategory.length
      }));

      setLoadingStates(prev => ({ ...prev, [category]: false }));
    }, 500);
  };

  // İlk yükleme
  useEffect(() => {
    Object.keys(storesByCategory).forEach(category => {
      if (storesByCategory[category].length > 0) {
        loadMoreStores(category);
      }
    });
  }, []);

  // Sidebar top offset'ini dinamik olarak hesapla
  useEffect(() => {
    const calculateSidebarTop = () => {
      // Header elementini bul (nav, header veya belirli bir class)
      const header = document.querySelector('nav') || document.querySelector('header') || document.querySelector('[data-header]');
      if (header) {
        const headerHeight = header.getBoundingClientRect().height;
        setSidebarTopOffset(headerHeight + 16); // Header yüksekliği + biraz padding
      } else {
        // Fallback: SearchSection yüksekliğini kullan
        const searchSection = document.querySelector('[data-search-section]');
        if (searchSection) {
          const searchHeight = searchSection.getBoundingClientRect().height;
          setSidebarTopOffset(searchHeight + 16);
        }
      }
    };

    // İlk hesapla
    calculateSidebarTop();

    // Resize olduğunda yeniden hesapla
    window.addEventListener('resize', calculateSidebarTop);
    return () => window.removeEventListener('resize', calculateSidebarTop);
  }, []);

  // Kategori görünürlük kontrolü için ref'ler
  const categoryRefs = useRef<{[key: string]: HTMLElement | null}>({});
  const observerRefs = useRef<{[key: string]: IntersectionObserver | null}>({});
  const [visibleCategory, setVisibleCategory] = useState('all');

  // Intersection Observer için kategori görünürlük kontrolü
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Yarım ekran görünürlük
      threshold: 0
    };

    let visibleCategories: string[] = [];

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      visibleCategories = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target.id.replace('category-', ''));

      if (visibleCategories.length > 0) {
        // İlk görünen kategoriyi seç
        setSelectedCategory(visibleCategories[0]);
      } else {
        // Hiç kategori görünmüyorsa "all" seç
        setSelectedCategory('all');
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Tüm kategori bölümlerini observe et
    Object.keys(storesByCategory).forEach(category => {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [storesByCategory]);

  // Scroll pozisyonu kontrolü - en üstte featured sections görünüyorsa "all" seç, en altta ise son kategori seç
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;

      // En üstte - featured sections görünüyorsa
      if (scrollY < 100) {
        setSelectedCategory('all');
        return;
      }

      // En altta - son kategoriye yakınsa
      if (scrollY + windowHeight >= documentHeight - 100) {
        const categories = Object.keys(storesByCategory);
        if (categories.length > 0) {
          setSelectedCategory(categories[categories.length - 1]); // Son kategori
        }
        return;
      }

      // Ortada - Intersection Observer hallediyor
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storesByCategory]);

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const category = entry.target.getAttribute('data-category');
          if (category) {
            loadMoreStores(category);
          }
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    // Her kategori için observer oluştur
    Object.keys(storesByCategory).forEach(category => {
      const element = document.getElementById(`load-more-${category}`);
      if (element && !observerRefs.current[category]) {
        observerRefs.current[category] = new IntersectionObserver(observerCallback, observerOptions);
        observerRefs.current[category].observe(element);
      }
    });

    return () => {
      Object.values(observerRefs.current).forEach(observer => observer?.disconnect());
    };
  }, [storesByCategory]);


  return (
    <div className="py-8 sm:py-1 pb-2 min-h-screen">

      <div data-search-section>
        <SearchSection
          darkMode={darkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMobile={isMobile}
          stores={stores}
          discountedProducts={discountedProducts}
          popularProducts={popularProducts}
          categories={[]}
        />
      </div>

      <div
  className={`grid ${
    isMobile ? "grid-cols-1" : "lg:grid-cols-4"
  } gap-6`}
>
  {/* Sidebar - Only on desktop */}
  {!isMobile && (
    <div
      className="lg:col-span-1 lg:sticky lg:h-fit lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:z-40"
      style={{ top: `${sidebarTopOffset}px`, direction: "rtl" }}
    >
      <div
        className={`rounded-2xl p-4 sm:p-6 transition-colors duration-300 overflow-y-auto mt-5 ml-0 mr-3 ${
          darkMode
            ? "bg-gray-800 border border-neutral-700"
            : "bg-neutral-50 border border-neutral-200"
        }`}
        style={{ direction: "ltr" }}
      >
        {/* Arama sonuçları başlığı - sidebar'da en üstte */}
        {searchQuery.trim() && (
          <div className="mb-4 pb-3 border-b border-neutral-300 dark:border-neutral-600">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
              Arama Sonuçları "{searchQuery}" ({(() => {
                const searchedProducts = [
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
                ];
                const filteredAndSortedStores = stores.filter(store => {
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim();
                    const storeName = store.name.toLowerCase();
                    const storeTypeName = store.storeType === 'esnaf' ? 'esnaf' :
                                         store.storeType === 'avm' ? 'avm' :
                                         store.storeType === 'marka' ? 'marka' : '';
                    if (!storeName.includes(query) && !storeTypeName.includes(query)) {
                      return false;
                    }
                  }
                  return true;
                });
                return searchedProducts.length + filteredAndSortedStores.length;
              })()})
            </h2>
          </div>
        )}

        {/* Categories */}
        <Category
          darkMode={darkMode}
          isMobile={false}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Filters */}
        <div className="mb-6">
          <h3
            className={`text-lg font-bold mb-4 ${
              darkMode ? "text-white" : "text-neutral-950"
            }`}
          >
            Filtreler
          </h3>

          {/* Rating Filter */}
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Minimum Puan
            </label>
            <select
              value={filters.rating}
              onChange={(e) =>
                setFilters({ ...filters, rating: Number(e.target.value) })
              }
              className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 border-neutral-600 text-white"
                  : "bg-white border-neutral-300 text-neutral-950"
              }`}
            >
              <option value={0}>Tümü</option>
              <option value={4}>4+ yıldız</option>
              <option value={4.5}>4.5+ yıldız</option>
              <option value={4.8}>4.8+ yıldız</option>
            </select>
          </div>

          {/* Delivery Time Filter */}
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Teslimat Süresi (dk)
            </label>
            <select
              value={filters.delivery}
              onChange={(e) =>
                setFilters({ ...filters, delivery: Number(e.target.value) })
              }
              className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 border-neutral-600 text-white"
                  : "bg-white border-neutral-300 text-neutral-950"
              }`}
            >
              <option value={0}>Tümü</option>
              <option value={30}>30 dk altında</option>
              <option value={45}>45 dk altında</option>
              <option value={60}>60 dk altında</option>
            </select>
          </div>

          {/* Distance Filter */}
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              Mesafe (km)
            </label>
            <select
              value={filters.distance}
              onChange={(e) =>
                setFilters({ ...filters, distance: Number(e.target.value) })
              }
              className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 border-neutral-600 text-white"
                  : "bg-white border-neutral-300 text-neutral-950"
              }`}
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
        )}

        {/* Main Content */}
        <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'}`}>
          {/* Mobile Category Bar */}
          {isMobile && (
            <Category
              darkMode={darkMode}
              isMobile={isMobile}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}

          {/* Search Results */}
          {searchQuery.trim() && (() => {
            // Search functionality for products
            const searchedProducts = [
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
            ];

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
              <div className="mb-8" data-search-results>

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
            );
          })()}

          {/* Featured Sections - Only show when not searching */}
          {!searchQuery.trim() && (
            <div className="space-y-8 mb-8">
              <div id="subcategory-popular" className="mb-6 lg:mt-8">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">🔥</span> Popüler Ürünler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularProducts.slice(0, 4).map((product, index) => (
                    <div key={`popular-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={() => router.push(`/store/product/${product.id}`)}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              🔥
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* İndirimli Ürünler */}
              <div id="subcategory-discounted" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">💰</span> İndirimli Ürünler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {discountedProducts.slice(0, 4).map((product, index) => (
                    <div key={`discounted-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`} onClick={() => router.push(`/store/product/${product.id}`)}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              -{product.discount}%
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                      <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {discountedProducts.filter(product => product.name.toLowerCase().includes('kış') || product.name.toLowerCase().includes('mont') || product.name.toLowerCase().includes('kazak')).slice(0, 4).map((product, index) => (
                    <div key={`winter-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              ❄️
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Yeni Ürünler */}
              <div id="subcategory-new" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">✨</span> Yeni Ürünler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {discountedProducts.slice(0, 4).map((product, index) => (
                    <div key={`new-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              ✨
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Ürünler */}
              <div id="subcategory-trending" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">📈</span> Trend Ürünler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularProducts.slice(0, 4).map((product, index) => (
                    <div key={`trending-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              📈
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Flaş İndirimler */}
              <div id="subcategory-flash" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">⚡</span> Flaş İndirimler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {discountedProducts.filter(product => product.discount >= 30).slice(0, 4).map((product, index) => (
                    <div key={`flash-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded animate-pulse">
                              ⚡
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Elektronik Ürünler */}
              <div id="subcategory-electronics" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">📱</span> Elektronik Ürünler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularProducts.slice(0, 4).map((product, index) => (
                    <div key={`electronics-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              📱
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Spor Ürünler */}
              <div id="subcategory-sports" className="mb-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  <span className="text-lg">⚽</span> Spor Ürünler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...discountedProducts.filter(product => product.name.toLowerCase().includes('spor') || product.name.toLowerCase().includes('ayakkabı') || product.name.toLowerCase().includes('top')).map(product => ({ ...product, source: 'discounted' })), ...popularProducts.filter(product => product.name.toLowerCase().includes('spor') || product.name.toLowerCase().includes('ayakkabı') || product.name.toLowerCase().includes('top')).map(product => ({ ...product, source: 'popular' }))].slice(0, 4).map((product, index) => (
                    <div key={`sports-${product.source}-${product.id}-${index}`} className={`relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div onClick={() => router.push(`/store/product/${product.id}`)} className="w-full">
                        <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                          <ProductImageSlider images={product.images} alt={product.name} className="w-full h-full" />
                          <div className="absolute top-1 left-1">
                            <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              ⚽
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className={`font-medium text-xs mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{product.name}</h3>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{product.store}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-medium">{product.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {'currentPrice' in product ? (
                              <div className="flex items-center gap-1">
                                <span className="text-red-500 font-bold text-xs line-through">₺{product.originalPrice.toLocaleString()}</span>
                                <span className="text-green-500 font-bold text-xs">₺{product.currentPrice}</span>
                              </div>
                            ) : (
                              <span className="text-green-500 font-bold text-xs">₺{product.price.toLocaleString()}</span>
                            )}
                            <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>({product.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Store Grid - Always show when not searching */}
          {!searchQuery.trim() && (
            <div id="stores-section" className="mt-8">
              {/* Kategori bazlı mağaza bölümleri */}
              {Object.keys(storesByCategory).map(category => {
                const categoryName = 
                  category === 'textile' ? 'Tekstil Mağazaları' :
                  category === 'cosmetics' ? 'Kozmetik Mağazaları' :
                  category === 'accessories' ? 'Aksesuar Mağazaları' :
                  category === 'decor' ? 'Dekorasyon Mağazaları' :
                  category === 'electronics' ? 'Elektronik Mağazaları' :
                  'Mağazalar';

                const categoryIcon = 
                  category === 'textile' ? '👕' :
                  category === 'cosmetics' ? '💄' :
                  category === 'accessories' ? '👜' :
                  category === 'decor' ? '🏠' :
                  category === 'electronics' ? '📱' :
                  '🏪';

                return (
                  <div key={category} id={`category-${category}`} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                        <span className="text-lg">{categoryIcon}</span>
                        {categoryName}
                        <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          ({loadedStores[category].length})
                        </span>
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {loadedStores[category].map((store, index) => (
                        <div key={`store-${category}-${store.id}-${index}`} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
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

                    {/* Load More Trigger */}
                    {hasMore[category] && (
                      <div 
                        id={`load-more-${category}`}
                        data-category={category}
                        className="flex justify-center py-8"
                      >
                        {loadingStates[category] ? (
                          <div className={`flex items-center gap-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span>Yükleniyor...</span>
                          </div>
                        ) : (
                          <div className={`text-sm ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Daha fazla mağaza görmek için aşağı kaydırın
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;

