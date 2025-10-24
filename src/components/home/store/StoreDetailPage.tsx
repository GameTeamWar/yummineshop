'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Package, Heart, ShoppingCart, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, ArrowLeft, Filter, Grid, ChevronLeft, ChevronDown, Check, Minus, Plus, Share2 } from 'lucide-react';
import Header from '../navigations/Header';
import StoreInfoBar from './infobar';

export default function StoreDetailPage({ storeData, productsData }: { storeData?: any, productsData?: any[] }) {
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
  const [partnerCollapsed, setPartnerCollapsed] = useState<{[key: string]: boolean}>({});
  const [partnerSearchQueries, setPartnerSearchQueries] = useState<{[key: string]: string}>({});
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({});
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [currentImages, setCurrentImages] = useState<{[key: number]: number}>({});
  const [isMobile, setIsMobile] = useState(false);
  const intervalsRef = useRef<Map<number, number>>(new Map());
  // Header states
  const [heroMode, setHeroMode] = useState('shopping');
  const [searchQuery, setSearchQuery] = useState('');
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

  const store = storeData || {
    id: 1,
    name: 'İpekyol Mağazası',
    rating: 4.8,
    reviews: 1523,
    distance: 0.8,
    delivery: 30,
    items: 12,
    badge: 'Popüler',
    description: 'En güncel moda ve stil ürünlerini burada bulabilirsiniz',
    partnerOptions: [
      {
        type: 'LeafCategory',
        title: 'Kategori',
        collapsed: true,
        searchable: true,
        searchPlaceholder: 'Kategori Ara',
        items: [
          { id: '1030', name: 'Ceket', value: '1030' },
          { id: '1179', name: 'Sweatshirt', value: '1179' },
          { id: '70', name: 'Pantolon', value: '70' },
          { id: '118', name: 'Mont', value: '118' },
          { id: '1092', name: 'Kazak', value: '1092' },
          { id: '1019', name: 'Bluz', value: '1019' },
          { id: '56', name: 'Elbise', value: '56' },
          { id: '1066', name: 'Hırka', value: '1066' },
          { id: '120', name: 'Jeans', value: '120' },
          { id: '75', name: 'Gömlek', value: '75' }
        ]
      },
      {
        type: 'WebBrand',
        title: 'Marka',
        collapsed: true,
        hasSections: true,
        sections: [
          {
            title: 'Popüler Markalar',
            items: [
              { id: '46', name: 'İpekyol', value: '46' }
            ]
          },
          {
            title: 'Tüm Markalar',
            items: [
              { id: '623', name: 'MISS IPEKYOL', value: '623' },
              { id: '168', name: 'Twist', value: '168' }
            ]
          }
        ]
      },
      {
        type: 'Size',
        title: 'Beden',
        collapsed: true,
        searchable: true,
        searchPlaceholder: 'Beden Ara',
        items: [
          { id: 'xs', name: 'XS', value: 'group-xs' },
          { id: 's', name: 'S', value: 'group-s' },
          { id: 'm', name: 'M', value: 'group-m' },
          { id: 'l', name: 'L', value: 'group-l' },
          { id: 'xl', name: 'XL', value: 'group-xl' },
          { id: '2', name: '2', value: '2' },
          { id: '34', name: '34', value: '34' },
          { id: '36', name: '36', value: '36' },
          { id: '38', name: '38', value: '38' },
          { id: '40', name: '40', value: '40' },
          { id: 'tek-ebat', name: 'Tek Ebat', value: 'tek-ebat' }
        ]
      },
      {
        type: 'WebColor',
        title: 'Renk',
        collapsed: true,
        isColorList: true,
        items: [
          { id: '1', name: 'Altın', value: '348', colorClass: 'color-1' },
          { id: '2', name: 'Bej', value: '348', colorClass: 'color-2' },
          { id: '3', name: 'Beyaz', value: '348', colorClass: 'color-3' },
          { id: '19', name: 'Bordo', value: '348', colorClass: 'color-19', selected: true },
          { id: '20', name: 'Ekru', value: '348', colorClass: 'color-20' },
          { id: '4', name: 'Gri', value: '348', colorClass: 'color-4' },
          { id: '5', name: 'Gümüş', value: '348', colorClass: 'color-5' },
          { id: '21', name: 'Haki', value: '348', colorClass: 'color-21' },
          { id: '6', name: 'Kahverengi', value: '348', colorClass: 'color-6' },
          { id: '7', name: 'Kırmızı', value: '348', colorClass: 'color-7' },
          { id: '8', name: 'Lacivert', value: '348', colorClass: 'color-8' },
          { id: '9', name: 'Mavi', value: '348', colorClass: 'color-9' },
          { id: '11', name: 'Mor', value: '348', colorClass: 'color-11' },
          { id: '12', name: 'Pembe', value: '348', colorClass: 'color-12' },
          { id: '13', name: 'Sarı', value: '348', colorClass: 'color-13' },
          { id: '14', name: 'Siyah', value: '348', colorClass: 'color-14' },
          { id: '16', name: 'Turuncu', value: '348', colorClass: 'color-16' },
          { id: '17', name: 'Yeşil', value: '348', colorClass: 'color-17' },
          { id: '686230', name: 'Çok Renkli', value: '348', colorClass: 'color-686230' }
        ]
      },
      {
        type: 'Price',
        title: 'Fiyat',
        collapsed: true,
        isPriceRange: true,
        priceRanges: [
          { id: '0-1000', label: '0 TL - 1000 TL', value: '0-1000' },
          { id: '1000-2000', label: '1000 TL - 2000 TL', value: '1000-2000' },
          { id: '2000-4000', label: '2000 TL - 4000 TL', value: '2000-4000' },
          { id: '4000-6000', label: '4000 TL - 6000 TL', value: '4000-6000' },
          { id: '6000-9000', label: '6000 TL - 9000 TL', value: '6000-9000' },
          { id: '9000-15000', label: '9000 TL - 15000 TL', value: '9000-15000' }
        ]
      },
      {
        type: 'Material',
        title: 'Materyal',
        collapsed: true,
        searchable: true,
        searchPlaceholder: 'Materyal Ara',
        items: [
          { id: '212262', name: '%100 Pamuk', value: '212262' },
          { id: '77', name: 'Akrilik', value: '77' },
          { id: '3979', name: 'Deri', value: '3979' },
          { id: '284086', name: 'Dokuma', value: '284086' },
          { id: '12277', name: 'Elastan', value: '12277' },
          { id: '86', name: 'Hasır', value: '86' },
          { id: '195', name: 'Kadife', value: '195' },
          { id: '710', name: 'Keten', value: '710' },
          { id: '91', name: 'Kumaş', value: '91' },
          { id: '9329', name: 'Liyosel', value: '9329' }
        ]
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'textile', name: 'Kıyafet' },
    { id: 'jacket', name: 'Ceket' },
    { id: 'shirt', name: 'Gömlek' },
    { id: 'pants', name: 'Pantolon' },
    { id: 'accessories', name: 'Aksesuar' }
  ];

  const products = (productsData && productsData.length > 0) ? productsData : [
    {
      id: 101,
      name: 'Ayarlanabilir Bel Şişme Yelek',
      category: 'jacket',
      price: 6499,
      originalPrice: 7999,
      rating: 5.0,
      reviews: 1,
      favorites: 'Çok başarılı',
      badge: 'AVANTAJLI ÜRÜN',
      badgeColor: 'purple',
      images: ['https://picsum.photos/400/400?random=101', 'https://picsum.photos/400/400?random=102', 'https://picsum.photos/400/400?random=103'],
      sizes: ['34', '36', '38', '40', '42', '44'],
      colors: ['Koyu Mor', 'Siyah', 'Lacivert'],
      discount: '7000 TL\'ye 1500 TL İndirim',
      discount2: 'Sepette 6.499 TL',
      shipping: '6 gün',
      description: 'Kaliteli kumaş ile yapılan şişme yelek, kış mevsiminde sizi sıcak tutacak. Modern tasarımı ile hem rahat hem de şık görüneceksiniz.',
      material: 'Polyester',
      features: [
        { label: 'Kalıp', value: 'Regular' },
        { label: 'Materyal', value: 'Polyester' },
        { label: 'Astar Durumu', value: 'Astarlı' },
        { label: 'Yakası Tipi', value: 'Kapşonlu' }
      ]
    },
    {
      id: 102,
      name: 'Kumaş Mix Colorblock Sweatshirt',
      category: 'shirt',
      price: 4599,
      originalPrice: 5499,
      rating: 5.0,
      reviews: 1,
      favorites: 'Çok başarılı',
      badge: 'YENİ ÜRÜN',
      badgeColor: 'red',
      images: ['https://picsum.photos/400/400?random=104', 'https://picsum.photos/400/400?random=105', 'https://picsum.photos/400/400?random=106'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Mor', 'Siyah', 'Gri'],
      discount: '7000 TL\'ye 1500 TL İndirim',
      discount2: 'Sepette 4.599 TL',
      shipping: '6 gün',
      material: 'Pamuk',
      description: 'Modern colorblock tasarımı ile göze çarpan sweatshirt. Rahat kumaşı ile tüm gün giyebileceğiniz bir parça.'
    },
    {
      id: 103,
      name: 'Triko Mix Dik Yaka Sweatshirt',
      category: 'shirt',
      price: 3999,
      originalPrice: 4999,
      rating: 4.7,
      reviews: 3,
      favorites: 'Başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=107', 'https://picsum.photos/400/400?random=108', 'https://picsum.photos/400/400?random=109'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Krem', 'Gri', 'Siyah'],
      discount: '5000 TL\'ye 800 TL İndirim',
      discount2: 'Sepette 3.999 TL',
      shipping: '5 gün',
      description: 'Rahat ve şık dik yaka sweatshirt. Günlük giyim için mükemmel seçim.'
    },
    {
      id: 104,
      name: 'Payetli Çizgi Desen Gömlek',
      category: 'shirt',
      price: 2599,
      originalPrice: 3299,
      rating: 3.6,
      reviews: 5,
      favorites: 'Orta',
      badge: 'ÇOK AL AZ ÖDE',
      badgeColor: 'orange',
      images: ['https://picsum.photos/400/400?random=110', 'https://picsum.photos/400/400?random=111', 'https://picsum.photos/400/400?random=112'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Siyah', 'Beyaz', 'Pembe'],
      discount: '3000 TL\'ye 500 TL İndirim',
      discount2: 'Sepette 2.599 TL',
      shipping: '4 gün',
      description: 'Payetli çizgi desen gömlek, özel günler için ideal.'
    },
    {
      id: 105,
      name: 'Pamuklu Basic Tişört',
      category: 'textile',
      price: 899,
      originalPrice: 1299,
      rating: 4.8,
      reviews: 42,
      favorites: 'Çok başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=113', 'https://picsum.photos/400/400?random=114', 'https://picsum.photos/400/400?random=115'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Beyaz', 'Siyah', 'Gri', 'Mavi', 'Kırmızı'],
      discount: '2000 TL\'ye 300 TL İndirim',
      discount2: 'Sepette 899 TL',
      shipping: '3 gün',
      description: 'Günlük giyim için temel pamuklu tişört. Rahatlığı ve kalitesi ile tercih edilen bir parça.'
    },
    {
      id: 106,
      name: 'Skinny Fit Pantolon',
      category: 'pants',
      price: 1999,
      originalPrice: 2999,
      rating: 4.6,
      reviews: 18,
      favorites: 'Başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=106', 'https://picsum.photos/400/400?random=107', 'https://picsum.photos/400/400?random=108'],
      sizes: ['28', '30', '32', '34', '36', '38'],
      colors: ['Koyu Mavi', 'Siyah', 'Gri'],
      discount: '4000 TL\'ye 800 TL İndirim',
      discount2: 'Sepette 1.999 TL',
      shipping: '5 gün',
      description: 'Modern skinny fit pantolon. Her mevsimde giyilebilecek kaliteli bir model.'
    },
    {
      id: 107,
      name: 'Kadın Kot Pantolon',
      category: 'pants',
      price: 2499,
      originalPrice: 3499,
      rating: 4.4,
      reviews: 28,
      favorites: 'Başarılı',
      badge: 'SEZON SONU',
      badgeColor: 'orange',
      images: ['https://picsum.photos/400/400?random=109', 'https://picsum.photos/400/400?random=110', 'https://picsum.photos/400/400?random=111'],
      sizes: ['26', '28', '30', '32', '34', '36'],
      colors: ['Lacivert', 'Siyah', 'Açık Mavi'],
      discount: '5000 TL\'ye 1000 TL İndirim',
      discount2: 'Sepette 2.499 TL',
      shipping: '4 gün',
      description: 'Rahat kesim kot pantolon. Günlük kullanım için ideal.'
    },
    {
      id: 108,
      name: 'Yünlü Kazak',
      category: 'textile',
      price: 3299,
      originalPrice: 4299,
      rating: 4.9,
      reviews: 15,
      favorites: 'Çok başarılı',
      badge: 'PREMIUM',
      badgeColor: 'purple',
      images: ['https://picsum.photos/400/400?random=112', 'https://picsum.photos/400/400?random=113', 'https://picsum.photos/400/400?random=114'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Bordo', 'Siyah', 'Gri', 'Krem'],
      discount: '6000 TL\'ye 1000 TL İndirim',
      discount2: 'Sepette 3.299 TL',
      shipping: '7 gün',
      material: 'Yün',
      description: 'Yüksek kaliteli yünlü kazak. Kış aylarında sıcak tutar.',
      features: [
        { label: 'Materyal', value: 'Yün' },
        { label: 'Kalıp', value: 'Regular' },
        { label: 'Yıkama', value: 'Kuru Temizleme' }
      ]
    },
    {
      id: 109,
      name: 'Deri Ceket',
      category: 'jacket',
      price: 8999,
      originalPrice: 11999,
      rating: 4.7,
      reviews: 8,
      favorites: 'Çok başarılı',
      badge: 'LÜKS',
      badgeColor: 'red',
      images: ['https://picsum.photos/400/400?random=115', 'https://picsum.photos/400/400?random=116', 'https://picsum.photos/400/400?random=117'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Siyah', 'Kahve', 'Lacivert'],
      discount: '10000 TL\'ye 3000 TL İndirim',
      discount2: 'Sepette 8.999 TL',
      shipping: '8 gün',
      description: 'Gerçek deri ceket. Şık ve dayanıklı.',
      features: [
        { label: 'Materyal', value: 'Gerçek Deri' },
        { label: 'Kalıp', value: 'Slim' },
        { label: 'Astar', value: 'Astarlı' }
      ]
    },
    {
      id: 110,
      name: 'Spor Ayakkabı',
      category: 'accessories',
      price: 1899,
      originalPrice: 2499,
      rating: 4.5,
      reviews: 67,
      favorites: 'Başarılı',
      badge: 'SPOR',
      badgeColor: 'green',
      images: ['https://picsum.photos/400/400?random=118', 'https://picsum.photos/400/400?random=119', 'https://picsum.photos/400/400?random=120'],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
      colors: ['Beyaz', 'Siyah', 'Mavi', 'Kırmızı'],
      discount: '3000 TL\'ye 600 TL İndirim',
      discount2: 'Sepette 1.899 TL',
      shipping: '3 gün',
      description: 'Rahat spor ayakkabı. Günlük kullanım için mükemmel.',
      features: [
        { label: 'Taban', value: 'Kaçık' },
        { label: 'Kullanım', value: 'Spor/Günlük' },
        { label: 'Materyal', value: 'Suni Deri' }
      ]
    },
    {
      id: 111,
      name: 'Çanta',
      category: 'accessories',
      price: 1599,
      originalPrice: 2199,
      rating: 4.3,
      reviews: 34,
      favorites: 'Başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=124', 'https://picsum.photos/400/400?random=125', 'https://picsum.photos/400/400?random=126'],
      sizes: ['Tek Beden'],
      colors: ['Siyah', 'Kahve', 'Kırmızı'],
      discount: '2500 TL\'ye 600 TL İndirim',
      discount2: 'Sepette 1.599 TL',
      shipping: '4 gün',
      description: 'Şık kadın çantası. Günlük kullanım için ideal.'
    },
    {
      id: 112,
      name: 'Güneş Gözlüğü',
      category: 'accessories',
      price: 799,
      originalPrice: 1199,
      rating: 4.6,
      reviews: 89,
      favorites: 'Çok başarılı',
      badge: 'GÜNEŞ',
      badgeColor: 'yellow',
      images: ['https://picsum.photos/400/400?random=127', 'https://picsum.photos/400/400?random=128', 'https://picsum.photos/400/400?random=129'],
      sizes: ['Tek Beden'],
      colors: ['Siyah', 'Kahve', 'Şeffaf'],
      discount: '1500 TL\'ye 400 TL İndirim',
      discount2: 'Sepette 799 TL',
      shipping: '2 gün',
      description: 'UV korumalı güneş gözlüğü. Gözlerinizi korur.'
    },
    {
      id: 113,
      name: 'Kadın Mont',
      category: 'jacket',
      price: 7499,
      originalPrice: 9999,
      rating: 4.8,
      reviews: 12,
      favorites: 'Çok başarılı',
      badge: 'KIŞ SPESYAL',
      badgeColor: 'blue',
      images: ['https://picsum.photos/400/400?random=130', 'https://picsum.photos/400/400?random=131', 'https://picsum.photos/400/400?random=132'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Kırmızı', 'Siyah', 'Lacivert', 'Gri'],
      discount: '8000 TL\'ye 2500 TL İndirim',
      discount2: 'Sepette 7.499 TL',
      shipping: '7 gün',
      description: 'Şık ve sıcak kadın montu. Kış aylarında vazgeçilmez.',
      features: [
        { label: 'Materyal', value: 'Polyester' },
        { label: 'Kalıp', value: 'Regular' },
        { label: 'Astar', value: 'Kuş Tüyü' }
      ]
    },
    {
      id: 114,
      name: 'V Yaka Kazak',
      category: 'textile',
      price: 2899,
      originalPrice: 3899,
      rating: 4.6,
      reviews: 23,
      favorites: 'Başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=133', 'https://picsum.photos/400/400?random=134', 'https://picsum.photos/400/400?random=135'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Beyaz', 'Siyah', 'Mavi', 'Pembe'],
      discount: '4000 TL\'ye 1000 TL İndirim',
      discount2: 'Sepette 2.899 TL',
      shipping: '5 gün',
      description: 'Şık V yaka kazak. Her kombin için uygun.'
    },
    {
      id: 115,
      name: 'Kot Şort',
      category: 'pants',
      price: 1299,
      originalPrice: 1799,
      rating: 4.4,
      reviews: 31,
      favorites: 'Başarılı',
      badge: 'YAZ SPESYAL',
      badgeColor: 'green',
      images: ['https://picsum.photos/400/400?random=136', 'https://picsum.photos/400/400?random=137', 'https://picsum.photos/400/400?random=138'],
      sizes: ['26', '28', '30', '32', '34'],
      colors: ['Lacivert', 'Siyah', 'Açık Mavi'],
      discount: '2000 TL\'ye 500 TL İndirim',
      discount2: 'Sepette 1.299 TL',
      shipping: '3 gün',
      description: 'Rahat kot şort. Yaz aylarında serin kalın.'
    },
    {
      id: 116,
      name: 'Bluz',
      category: 'shirt',
      price: 1899,
      originalPrice: 2499,
      rating: 4.5,
      reviews: 19,
      favorites: 'Başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=139', 'https://picsum.photos/400/400?random=140', 'https://picsum.photos/400/400?random=141'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Beyaz', 'Pembe', 'Mavi', 'Siyah'],
      discount: '2500 TL\'ye 600 TL İndirim',
      discount2: 'Sepette 1.899 TL',
      shipping: '4 gün',
      description: 'Şık kadın bluzu. Ofis ve günlük kullanım için ideal.'
    },
    {
      id: 117,
      name: 'Kemer',
      category: 'accessories',
      price: 599,
      originalPrice: 899,
      rating: 4.7,
      reviews: 45,
      favorites: 'Çok başarılı',
      badge: null,
      badgeColor: null,
      images: ['https://picsum.photos/400/400?random=142', 'https://picsum.photos/400/400?random=143', 'https://picsum.photos/400/400?random=144'],
      sizes: ['S', 'M', 'L'],
      colors: ['Siyah', 'Kahve', 'Lacivert'],
      discount: '1000 TL\'ye 300 TL İndirim',
      discount2: 'Sepette 599 TL',
      shipping: '2 gün',
      description: 'Kaliteli deri kemer. Pantolonunuzla mükemmel uyum.'
    },
    {
      id: 118,
      name: 'Şapka',
      category: 'accessories',
      price: 449,
      originalPrice: 699,
      rating: 4.3,
      reviews: 52,
      favorites: 'Başarılı',
      badge: 'YENİ SEZON',
      badgeColor: 'orange',
      images: ['https://picsum.photos/400/400?random=145', 'https://picsum.photos/400/400?random=146', 'https://picsum.photos/400/400?random=147'],
      sizes: ['S', 'M', 'L'],
      colors: ['Siyah', 'Beyaz', 'Gri', 'Lacivert'],
      discount: '800 TL\'ye 250 TL İndirim',
      discount2: 'Sepette 449 TL',
      shipping: '2 gün',
      description: 'Şık şapka. Güneşten korur ve tarzınızı tamamlar.'
    },
    {
      id: 119,
      name: 'Eşofman Takımı',
      category: 'textile',
      price: 3499,
      originalPrice: 4999,
      rating: 4.8,
      reviews: 27,
      favorites: 'Çok başarılı',
      badge: 'SPOR',
      badgeColor: 'green',
      images: ['https://picsum.photos/400/400?random=148', 'https://picsum.photos/400/400?random=149', 'https://picsum.photos/400/400?random=150'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Siyah', 'Gri', 'Mavi', 'Kırmızı'],
      discount: '5000 TL\'ye 1500 TL İndirim',
      discount2: 'Sepette 3.499 TL',
      shipping: '5 gün',
      description: 'Rahat eşofman takımı. Spor ve günlük kullanım için mükemmel.',
      features: [
        { label: 'Materyal', value: 'Pamuk Karışımlı' },
        { label: 'Kullanım', value: 'Spor/Günlük' },
        { label: 'Set İçeriği', value: 'Üst + Alt' }
      ]
    },
    {
      id: 120,
      name: 'Kadın Çizme',
      category: 'accessories',
      price: 2999,
      originalPrice: 3999,
      rating: 4.6,
      reviews: 38,
      favorites: 'Başarılı',
      badge: 'KIŞ',
      badgeColor: 'blue',
      images: ['https://picsum.photos/400/400?random=151', 'https://picsum.photos/400/400?random=152', 'https://picsum.photos/400/400?random=153'],
      sizes: ['36', '37', '38', '39', '40', '41'],
      colors: ['Siyah', 'Kahve', 'Lacivert'],
      discount: '4000 TL\'ye 1000 TL İndirim',
      discount2: 'Sepette 2.999 TL',
      shipping: '6 gün',
      description: 'Şık kadın çizmesi. Kış aylarında hem sıcak hem şık.',
    },
    {
      id: 121,
      name: 'Akıllı Saat',
      category: 'accessories',
      price: 2499,
      originalPrice: 3499,
      rating: 4.8,
      reviews: 156,
      favorites: 'Çok başarılı',
      badge: 'TEKNOLOJİ',
      badgeColor: 'blue',
      images: ['https://picsum.photos/400/400?random=121', 'https://picsum.photos/400/400?random=122', 'https://picsum.photos/400/400?random=123'],
      sizes: ['Tek Beden'],
      colors: ['Siyah', 'Gümüş', 'Altın'],
      discount: '4000 TL\'ye 1000 TL İndirim',
      discount2: 'Sepette 2.499 TL',
      shipping: '3 gün',
      description: 'Modern akıllı saat. Fitness takibi, bildirimler ve çok daha fazlası.',
      features: [
        { label: 'Ekran', value: 'AMOLED' },
        { label: 'Batarya', value: '7 Gün' },
        { label: 'Su Geçirmez', value: '50m' }
      ]
    }
  ];

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

  const currentProduct = selectedProduct ? products.find(p => p.id === selectedProduct) : null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-neutral-950'}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        heroMode={heroMode}
        setHeroMode={setHeroMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartSidebarOpen={cartSidebarOpen}
        setCartSidebarOpen={setCartSidebarOpen}
        showAddAddressModal={showAddAddressModal}
        setShowAddAddressModal={setShowAddAddressModal}
        showHowItWorksModal={showHowItWorksModal}
        setShowHowItWorksModal={setShowHowItWorksModal}
        isMobile={isMobile}
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
              <div className="relative lg:col-span-1 lg:sticky top-24 lg:self-start ">
                <div className={`rounded-2xl p-4 sm:p-6 pt-12 transition-colors duration-300 max-h-[calc(100vh-8rem)] overflow-y-auto mt-1 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>


                  {/* Partner Options */}
                  {store.partnerOptions?.map((option: any, index: number) => (
                    <div key={option.type} className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{option.title}</h3>
                        <button
                          onClick={() => setPartnerCollapsed(prev => ({ ...prev, [option.type]: !prev[option.type] }))}
                          className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}
                          aria-label="expand-collapse-button"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${partnerCollapsed[option.type] ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      <div className={`${partnerCollapsed[option.type] ? 'hidden' : ''}`}>
                        {/* Search Input */}
                        {option.searchable && (
                          <div className="mb-3">
                            <input
                              type="text"
                              placeholder={option.searchPlaceholder}
                              value={partnerSearchQueries[option.type] || ''}
                              onChange={(e) => setPartnerSearchQueries(prev => ({ ...prev, [option.type]: e.target.value }))}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                              autoComplete="off"
                            />
                          </div>
                        )}

                        {/* Price Range */}
                        {option.isPriceRange && (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="En Az"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                                autoComplete="off"
                              />
                              <input
                                type="number"
                                placeholder="En Çok"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                                autoComplete="off"
                              />
                            </div>
                            <div className="space-y-2">
                              {option.priceRanges?.map((range: any) => (
                                <label key={range.id} className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`price-${option.type}`}
                                    value={range.value}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{range.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Color List */}
                        {option.isColorList && (
                          <div className="grid grid-cols-4 gap-2">
                            {option.items?.filter((item: any) =>
                              !partnerSearchQueries[option.type] ||
                              item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                            ).map((item: any) => {
                              const isSelected = selectedColors.includes(item.value);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedColors(prev =>
                                      isSelected
                                        ? prev.filter(color => color !== item.value)
                                        : [...prev, item.value]
                                    );
                                  }}
                                  className="flex flex-col items-center gap-1 cursor-pointer group"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full border-2 transition-all relative ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
                                    style={{
                                      backgroundColor: item.colorClass ? getColorFromClass(item.colorClass) : '#ccc'
                                    }}
                                  >
                                    {isSelected && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white drop-shadow-lg" />
                                      </div>
                                    )}
                                  </div>
                                  <span className={`text-xs text-center ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>{item.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Sectioned Items */}
                        {option.hasSections && option.sections?.map((section: any, sectionIndex: number) => (
                          <div key={sectionIndex} className="mb-4">
                            <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{section.title}</p>
                            <div className="space-y-2">
                              {section.items?.filter((item: any) =>
                                !partnerSearchQueries[option.type] ||
                                item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                              ).map((item: any) => {
                                const isChecked = selectedFilters[option.type]?.includes(item.value) || false;
                                return (
                                  <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSelectedFilters(prev => {
                                          const current = prev[option.type] || [];
                                          if (isChecked) {
                                            return { ...prev, [option.type]: [...current, item.value] };
                                          } else {
                                            return { ...prev, [option.type]: current.filter(v => v !== item.value) };
                                          }
                                        });
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{item.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Regular Items */}
                        {!option.isColorList && !option.isPriceRange && !option.hasSections && (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {option.items?.filter((item: any) =>
                              !partnerSearchQueries[option.type] ||
                              item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                            ).map((item: any) => {
                              const isChecked = selectedFilters[option.type]?.includes(item.value) || false;
                              return (
                                <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setSelectedFilters(prev => {
                                        const current = prev[option.type] || [];
                                        if (isChecked) {
                                          return { ...prev, [option.type]: [...current, item.value] };
                                        } else {
                                          return { ...prev, [option.type]: current.filter(v => v !== item.value) };
                                        }
                                      });
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{item.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Sort Options */}
                  <div className="mb-6 ">
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sıralama</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`w-full p-2  left-10 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                    >
                      <option value="popular">Popülerlik</option>
                      <option value="price-low">Fiyat (Düşükten Yükseğe)</option>
                      <option value="price-high">Fiyat (Yüksekten Düşüğe)</option>
                      <option value="rating">Puana Göre</option>
                      <option value="newest">En Yeni</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">             
               

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedProducts.map(product => {
                    const currentIndex = currentImages[product.id] || 0;
                    return (
                      <div key={product.id} onClick={() => router.push(`/product/${product.id}`)} className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-white border border-neutral-200'}`} onMouseMove={(e) => {
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
                          <button className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${darkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>
                            <Heart className="w-4 h-4" />
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

                {sortedProducts.length === 0 && (
                  <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Ürün bulunamadı</p>
                    <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Kategorileri veya filtreleri değiştirerek deneyin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}