'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Package, Heart, ShoppingCart, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, ArrowLeft, Filter, Grid, ChevronLeft, ChevronDown, Check, Minus, Plus, Share2 } from 'lucide-react';
import Header from '@/components/store/navigations/Header';
import StoreInfoBar from '@/components/store/ui/infobar';
import StoreSidebar from '@/components/store/StoreSidebar';
import MobileNavigation from '@/components/store/navigations/MobileNavigation';

export default function StoreDetailPage({ storeData, productsData, cart = {}, addToCart, setCart, clearCart, removeFromCart, deleteItemFromCart }: { storeData?: any, productsData?: any[], cart?: { [key: string]: number }, addToCart?: (productId: string) => void, setCart?: (cart: { [key: string]: number }) => void, clearCart?: () => void, removeFromCart?: (productId: string) => void, deleteItemFromCart?: (productId: string) => void }) {
  const router = useRouter();
  const getColorFromClass = (colorClass: string) => {
    const colorMap: {[key: string]: string} = {
      'color-1': '#FFD700', // Altın
      'color-2': '#F5F5DC', // Bej
      'color-3': '#FFFFFF', // Beyaz
      'color-19': '#800000', // Bordo
      'color-20': '#F5F5F5', // Ekru
      'color-4': '#808080', // Gri
      'color-5': '#C0C0C0', // Gümüş
      'color-21': '#8B4513', // Haki
      'color-6': '#8B4513', // Kahverengi
      'color-7': '#FF0000', // Kırmızı
      'color-8': '#000080', // Lacivert
      'color-9': '#0000FF', // Mavi
      'color-11': '#800080', // Mor
      'color-12': '#FFC0CB', // Pembe
      'color-13': '#FFFF00', // Sarı
      'color-14': '#000000', // Siyah
      'color-16': '#FFA500', // Turuncu
      'color-17': '#008000', // Yeşil
      'color-686230': '#FF6347' // Çok Renkli - Coral
    };
    return colorMap[colorClass] || '#ccc';
  };

  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [storeCategory, setStoreCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [cartCount, setCartCount] = useState(0);
  const [productImage, setProductImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [store, setStore] = useState<any>(storeData || null);
  const [products, setProducts] = useState<any[]>(productsData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerCollapsed, setPartnerCollapsed] = useState<{[key: string]: boolean}>({});
  const [partnerSearchQueries, setPartnerSearchQueries] = useState<{[key: string]: string}>({});
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({});
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [currentImages, setCurrentImages] = useState<{[key: number]: number}>({});
  const [isMobile, setIsMobile] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeData) {
        setLoading(true);
        try {
          // Get store ID from URL or props
          const storeId = window.location.pathname.split('/')[2]; // Assuming URL like /store/123
          
          // Fetch store data
          const storeResponse = await fetch(`/api/stores/${storeId}`);
          if (storeResponse.ok) {
            const storeData = await storeResponse.json();
            setStore(storeData);
          }

          // Fetch products for this store
          const productsResponse = await fetch(`/api/products?storeId=${storeId}`);
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setProducts(productsData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Veri yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [storeData]);

  // Favori toggle fonksiyonu
  const toggleFavorite = (productId: number) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  const intervalsRef = useRef<Map<number, number>>(new Map());
  // Header states
  const [heroMode, setHeroMode] = useState('shopping');
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('Adres Ekleyin');
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddressName, setNewAddressName] = useState('');
  const [newAddressStreet, setNewAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressBuildingNumber, setAddressBuildingNumber] = useState('');
  const [addressApartment, setAddressApartment] = useState('');
  const [addressFloor, setAddressFloor] = useState('');
  const [addressHasElevator, setAddressHasElevator] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const categories = store?.partnerOptions?.find((option: any) => option.type === 'LeafCategory')?.items || [];

  const filteredProducts = products.filter(product => {
    // Eski kategori filtresi (şimdilik tutuyorum)
    if (storeCategory !== 'all' && product.category !== storeCategory) {
      return false;
    }

    // Dinamik kategori filtresi (LeafCategory)
    const selectedCategories = selectedFilters['LeafCategory'] || [];
    if (selectedCategories.length > 0) {
      const categoryMatch = selectedCategories.some(selectedCat =>
        product.category === selectedCat ||
        product.category?.toLowerCase().includes(selectedCat.toLowerCase()) ||
        selectedCat.toLowerCase().includes(product.category?.toLowerCase())
      );
      if (!categoryMatch) {
        return false;
      }
    }

    // Renk filtresi
    if (selectedColors.length > 0) {
      if (product.colors && product.colors.length > 0) {
        const hasMatchingColor = selectedColors.some(selectedColor =>
          product.colors.some((productColor: string) =>
            productColor.toLowerCase().includes(selectedColor.toLowerCase()) ||
            selectedColor.toLowerCase().includes(productColor.toLowerCase())
          )
        );
        if (!hasMatchingColor) {
          return false;
        }
      } else {
        return false;
      }
    }

    // Beden filtresi
    const selectedSizes = selectedFilters['Size'] || [];
    if (selectedSizes.length > 0) {
      if (product.sizes && product.sizes.length > 0) {
        const hasMatchingSize = selectedSizes.some(selectedSize =>
          product.sizes.some((productSize: string) =>
            productSize.toLowerCase().includes(selectedSize.toLowerCase()) ||
            selectedSize.toLowerCase().includes(productSize.toLowerCase())
          )
        );
        if (!hasMatchingSize) {
          return false;
        }
      } else {
        return false;
      }
    }

    // Materyal filtresi
    const selectedMaterials = selectedFilters['Material'] || [];
    if (selectedMaterials.length > 0) {
      // Ürün materyali varsa kontrol et (şimdilik basit kontrol)
      if (product.material) {
        const hasMatchingMaterial = selectedMaterials.some(selectedMaterial =>
          product.material.toLowerCase().includes(selectedMaterial.toLowerCase()) ||
          selectedMaterial.toLowerCase().includes(product.material.toLowerCase())
        );
        if (!hasMatchingMaterial) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'popular') return b.reviews - a.reviews;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => {

    const product = products.find(p => p.id.toString() === id);

    return {

      id,

      name: product?.name || '',

      price: product?.price || 0,

      originalPrice: product?.originalPrice,

      quantity: qty,

      image: product?.images?.[0] || product?.image || '',

      store: store?.name || '',

      total: (product?.price || 0) * qty

    };

  }).filter(item => item.name);

  const setCartItems = (newCartItems: any[]) => {
    if (setCart) {
      const newCart = newCartItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {} as { [key: string]: number });
      setCart(newCart);
    }
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const currentProduct = selectedProduct ? products.find(p => p.id === selectedProduct) : null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-neutral-950'}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        heroMode={heroMode}
        setHeroMode={setHeroMode}
        cartSidebarOpen={cartSidebarOpen}
        setCartSidebarOpen={setCartSidebarOpen}
        showAddAddressModal={showAddAddressModal}
        setShowAddAddressModal={setShowAddAddressModal}
        showHowItWorksModal={showHowItWorksModal}
        setShowHowItWorksModal={setShowHowItWorksModal}
        isMobile={isMobile}
        cart={cartItems}
        cartTotal={cartTotal}
        setCart={setCartItems}
        setCartTotal={(total) => {}} // Not needed since we handle it in setCartItems
        cartItemCount={cartItemCount}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        deleteItemFromCart={deleteItemFromCart}
      />
      {/* Header component will be added here */}

      <StoreInfoBar
        store={store}
        darkMode={darkMode}
        showBackButton={true}
        showSortSelector={true}
        sortBy={sortBy}
        onSortChange={setSortBy}
        currentProduct={currentProduct}
      />

      {currentProduct ? (
        <>
          {/* Product Detail */}
          <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Images */}
              <div className="space-y-4">
                <div className={`relative rounded-2xl overflow-hidden aspect-square ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-100 border border-neutral-200'}`}>
                  <img src={currentProduct.images[productImage]} alt={currentProduct.name} className="w-full h-full object-cover" />
                  <button onClick={() => setFavorited(!favorited)} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${favorited ? (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') : (darkMode ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-600')}`}>
                    <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
                {currentProduct.images.length > 1 && (
                  <div className="flex gap-2">
                    {currentProduct.images.map((image: string, i: number) => (
                      <button key={i} onClick={() => setProductImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${productImage === i ? (darkMode ? 'border-2 border-blue-500 bg-blue-500/20' : 'border-2 border-blue-600 bg-blue-50') : (darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-100 border border-neutral-200')}`}>
                        <img src={image} alt={`${currentProduct.name} ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                {currentProduct.badge && (
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    currentProduct.badgeColor === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                    currentProduct.badgeColor === 'red' ? 'bg-red-500/20 text-red-400' :
                    currentProduct.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {currentProduct.badge}
                  </div>
                )}

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-3">{currentProduct.name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{currentProduct.rating}</span>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>({currentProduct.reviews} değerlendirme)</span>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✓ {currentProduct.favorites}</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className={`p-4 rounded-xl space-y-3 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    🎁 {currentProduct.discount}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    ✓ {currentProduct.discount2}
                  </div>
                  <div className="flex items-end gap-3 pt-2">
                    <span className="text-3xl font-bold text-blue-500">₺{currentProduct.price.toLocaleString('tr-TR')}</span>
                    <span className={`text-lg line-through ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>₺{currentProduct.originalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                </div>

                {/* Description */}
                <p className={`leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{currentProduct.description}</p>

                {/* Size Selection */}
                {currentProduct.sizes && (
                  <div>
                    <p className="font-semibold mb-3">Beden Seç</p>
                    <div className="grid grid-cols-4 gap-2">
                      {currentProduct.sizes.map((size: string) => (
                        <button key={size} onClick={() => setSelectedSize(size)} className={`p-3 rounded-lg font-semibold transition-all text-sm ${selectedSize === size ? (darkMode ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white') : (darkMode ? 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600' : 'bg-neutral-100 border border-neutral-200 hover:border-neutral-300')}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {currentProduct.colors && (
                  <div>
                    <p className="font-semibold mb-3">Renk Seç</p>
                    <div className="grid grid-cols-3 gap-2">
                      {currentProduct.colors.map((color: string) => (
                        <button key={color} onClick={() => setSelectedColor(color)} className={`p-3 rounded-lg font-semibold transition-all text-sm ${selectedColor === color ? (darkMode ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white') : (darkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')}`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <p className="font-semibold mb-3">Miktar</p>
                  <div className={`flex items-center gap-4 p-3 rounded-lg border w-fit ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Features */}
                {currentProduct.features && (
                  <div className={`p-4 rounded-xl space-y-2 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                    <p className="font-semibold mb-3">Ürün Özellikleri</p>
                    {currentProduct.features.map((feature: { label: string; value: string }, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{feature.label}</span>
                        <span className="font-semibold">{feature.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shipping Info */}
                <div className={`p-4 rounded-xl space-y-3 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <span className="font-bold">Kargo Bedava</span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Adrese seç ne zaman teslim edileceğini öğren!</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm"><strong>Tahmini Teslimat:</strong> {currentProduct.shipping} içinde kargoda</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors border ${darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-700' : 'bg-white text-neutral-950 hover:bg-neutral-50 border-neutral-200'}`}>
                    Şimdi Al
                  </button>
                  <button onClick={() => { setCartCount(cartCount + quantity); setSelectedProduct(null); setQuantity(1); }} className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${darkMode ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                    <ShoppingCart className="w-5 h-5" />
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="py-6 sm:py-8 pb-32 ">
            <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Sidebar */}
              <StoreSidebar
                darkMode={darkMode}
                store={store}
                partnerCollapsed={partnerCollapsed}
                setPartnerCollapsed={setPartnerCollapsed}
                partnerSearchQueries={partnerSearchQueries}
                setPartnerSearchQueries={setPartnerSearchQueries}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                getColorFromClass={getColorFromClass}
              />

              {/* Main Content */}
              <div className="lg:col-span-3">             
               

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedProducts.map(product => {
                    const currentIndex = currentImages[product.id] || 0;
                    return (
                      <div key={product.id} onClick={() => router.push(`/store/product/${product.id}`)} className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-white border border-neutral-200'}`} onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const width = rect.width;
                        const index = Math.floor((x / width) * product.images.length);
                        setCurrentImages(prev => ({ ...prev, [product.id]: Math.min(index, product.images.length - 1) }));
                      }}>
                        {/* Image Carousel */}
                        <div className={`relative p-6 flex items-center justify-center aspect-square overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-neutral-100'}`}>
                          {product.images.map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt={product.name}
                              className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                          ))}
                          {/* Dots */}
                          <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 rounded-full px-2 py-1 ${darkMode ? 'bg-white/50' : 'bg-black/50'}`}>
                            {product.images.map((_: string, index: number) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImages(prev => ({ ...prev, [product.id]: index }));
                                }}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? (darkMode ? 'bg-black' : 'bg-white') : (darkMode ? 'bg-black/50' : 'bg-white/50')}`}
                              />
                            ))}
                          </div>
                          {product.badge && (
                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white ${product.badgeColor === 'purple' ? 'bg-purple-500' : product.badgeColor === 'red' ? 'bg-red-500' : product.badgeColor === 'blue' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                              {product.badge}
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(product.id);
                            }}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                              favorites.includes(product.id) 
                                ? (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') 
                                : (darkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-white text-neutral-600 hover:bg-neutral-100')
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-2">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-500 transition-colors">{product.name}</h3>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-semibold">{product.rating}</span>
                            </div>
                            <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>({product.reviews})</span>
                            <span className={`text-xs font-semibold ml-auto ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{product.favorites}</span>
                          </div>

                          {/* Price */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-500">₺{product.price.toLocaleString('tr-TR')}</span>
                              <span className={`text-xs line-through ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>₺{product.originalPrice.toLocaleString('tr-TR')}</span>
                            </div>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✓ {product.discount2}</p>
                            <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>📦 {product.shipping} içinde</p>
                          </div>

                          {/* Sepete Ekle Butonu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (addToCart) addToCart(product.id.toString());
                              setCartCount(cartCount + 1);
                            }}
                            className={`w-full mt-3 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ürün bulunamadı mesajı - tam ekran */}
      {sortedProducts.length === 0 && !currentProduct && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="text-center max-w-md mx-auto px-4">
            <Package className="w-24 h-24 mx-auto mb-6 opacity-50" />
            <p className="text-2xl font-bold mb-4">Ürün bulunamadı</p>
            <p className={`text-lg ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Kategorileri veya filtreleri değiştirerek deneyin</p>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      
      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab="home"
        setActiveTab={() => {}}
        darkMode={darkMode}
        user={null}
        categories={categories}
        onCategorySelect={(categoryId) => {
          setSelectedFilters(prev => {
            const current = prev['LeafCategory'] || [];
            if (current.includes(categoryId)) {
              return { ...prev, ['LeafCategory']: current.filter(id => id !== categoryId) };
            } else {
              return { ...prev, ['LeafCategory']: [...current, categoryId] };
            }
          });
        }}
        partnerOptions={store?.partnerOptions}
        partnerCollapsed={partnerCollapsed}
        setPartnerCollapsed={setPartnerCollapsed}
        partnerSearchQueries={partnerSearchQueries}
        setPartnerSearchQueries={setPartnerSearchQueries}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        getColorFromClass={getColorFromClass}
      />
    </div>
  );
}