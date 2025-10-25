'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Trash2, Star, Eye, MapPin, Clock, Minus, Plus, Package } from 'lucide-react';
import Header from '@/components/store/navigations/Header';
import CartPreloader from '@/components/store/loader/CartPreloader';

// Ürün verilerini ShoppingSection'dan alalım (şimdilik static)
const products = [
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

const stores = [
  { id: 7, name: 'İpekyol Mağazası', category: 'textile', distance: 1.0, delivery: 20, rating: 4.9, items: 89, reviews: 1523, badge: 'Premium', price: 'yuksek', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop' },
  { id: 8, name: 'Zara Mağazası', category: 'fashion', distance: 2.5, delivery: 25, rating: 4.7, items: 156, reviews: 2847, badge: 'Trend', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop', logo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop' },
  { id: 9, name: 'H&M Mağazası', category: 'fashion', distance: 1.8, delivery: 15, rating: 4.5, items: 203, reviews: 3456, badge: 'Uygun', price: 'dusuk', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop' },
  { id: 10, name: 'Mango Mağazası', category: 'fashion', distance: 3.2, delivery: 30, rating: 4.6, items: 134, reviews: 1987, badge: 'Şık', price: 'orta', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop', logo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop' }
];

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [favoriteStores, setFavoriteStores] = useState<any[]>([]);
  const [favoriteStoreList, setFavoriteStoreList] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');

  // Header states
  const [heroMode, setHeroMode] = useState('shopping');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sepet state'leri
  const [cart, setCart] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Toast mesajı için state'ler
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Favori ürünleri localStorage'dan yükle
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);

    // Favori ürünleri products array'inden bul
    const favoriteProductList = products.filter(product =>
      savedFavorites.includes(product.id)
    );
    setFavoriteProducts(favoriteProductList);

    // Favori mağazaları localStorage'dan yükle
    const savedFavoriteStores = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
    setFavoriteStores(savedFavoriteStores);

    // Favori mağazaları stores array'inden bul
    const favoriteStoreList = stores.filter(store =>
      savedFavoriteStores.includes(store.id)
    );
    setFavoriteStoreList(favoriteStoreList);

    // Dark mode kontrolü
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Favorilerden çıkarma fonksiyonu
  const removeFromFavorites = (productId: number) => {
    const newFavorites = favorites.filter(id => id !== productId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));

    // Favori ürünleri güncelle
    const newFavoriteProducts = favoriteProducts.filter(product => product.id !== productId);
    setFavoriteProducts(newFavoriteProducts);

    // Toast mesajı göster
    setToastMessage('Ürün favorilerden çıkarıldı!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Mağaza favorilerden çıkarma fonksiyonu
  const removeStoreFromFavorites = (storeId: number) => {
    const newFavoriteStores = favoriteStores.filter(id => id !== storeId);
    setFavoriteStores(newFavoriteStores);
    localStorage.setItem('favoriteStores', JSON.stringify(newFavoriteStores));

    // Favori mağazaları güncelle
    const newFavoriteStoreList = favoriteStoreList.filter(store => store.id !== storeId);
    setFavoriteStoreList(newFavoriteStoreList);

    // Toast mesajı göster
    setToastMessage('Mağaza favorilerden çıkarıldı!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Sepete ekleme fonksiyonu
  const addToCart = (product: any) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: product.images[0],
      store: 'İpekyol Mağazası',
      total: product.price
    };

    // Sepette aynı ürün var mı kontrol et
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      // Mevcut ürünü güncelle
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
      setCart(updatedCart);
    } else {
      // Yeni ürün ekle
      setCart([...cart, cartItem]);
    }

    // Toplam fiyatı güncelle
    const newTotal = cartTotal + product.price;
    setCartTotal(newTotal);

    // Sepet sidebar'ını aç
    setCartSidebarOpen(true);

    // Toast mesajı göster
    setToastMessage(`${product.name} sepete eklendi!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
        cart={cart}
        cartTotal={cartTotal}
        setCart={setCart}
        setCartTotal={setCartTotal}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Tab'lar */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Favorilerim</h1>
          
          {/* Tab'lar */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'products'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Ürünler ({favoriteProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'stores'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mağazalar ({favoriteStoreList.length})
            </button>
          </div>
        </div>

        {/* Tab İçeriği */}
        {activeTab === 'products' ? (
          // Ürün Favorileri
          favoriteProducts.length === 0 ? (
            <div className="text-center py-16">
              <Heart className={`w-24 h-24 mx-auto mb-6 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h2 className="text-2xl font-bold mb-4">Henüz favori ürününüz yok</h2>
              <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Beğendiğiniz ürünleri favorilerinize ekleyerek burada görüntüleyebilirsiniz.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  {/* Favorilerden Çıkar Butonu */}
                  <button
                    onClick={() => removeFromFavorites(product.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Ürün Görseli */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          %{Math.round((1 - product.price / product.originalPrice) * 100)} İndirim
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={() => router.push(`/product/${product.id}`)}>
                      {product.name}
                    </h3>

                    {/* Yıldız ve Yorum */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{product.rating}</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Fiyat */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-green-600">
                        ₺{product.price.toLocaleString('tr-TR')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className={`text-lg line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ₺{product.originalPrice.toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>

                    {/* Sepete Ekle Butonu */}
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Mağaza Favorileri
          favoriteStoreList.length === 0 ? (
            <div className="text-center py-16">
              <Heart className={`w-24 h-24 mx-auto mb-6 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h2 className="text-2xl font-bold mb-4">Henüz favori mağazanız yok</h2>
              <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Beğendiğiniz mağazaları favorilerinize ekleyerek burada görüntüleyebilirsiniz.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                Mağazaları Keşfet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteStoreList.map((store) => (
                <div
                  key={store.id}
                  className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  {/* Favorilerden Çıkar Butonu */}
                  <button
                    onClick={() => removeStoreFromFavorites(store.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Mağaza Görseli */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {store.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                          store.badge === 'Premium' ? 'bg-purple-500' :
                          store.badge === 'Trend' ? 'bg-blue-500' :
                          store.badge === 'Uygun' ? 'bg-green-500' :
                          'bg-orange-500'
                        }`}>
                          {store.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mağaza Bilgileri */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {store.logo && (
                        <img src={store.logo} alt={store.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-blue-500 transition-colors cursor-pointer"
                            onClick={() => router.push(`/store/${store.id}`)}>
                          {store.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(store.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold">{store.rating}</span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ({store.reviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mağaza Detayları */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Mesafe:</span>
                        <span className="font-semibold">{store.distance} km</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Teslimat:</span>
                        <span className="font-semibold">{store.delivery} dk</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Ürün:</span>
                        <span className="font-semibold">{store.items} adet</span>
                      </div>
                    </div>

                    {/* Mağazaya Git Butonu */}
                    <button
                      onClick={() => router.push(`/store/${store.id}`)}
                      className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      Mağazaya Git
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Toast Mesajı */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-xl border backdrop-blur-sm ${
            darkMode
              ? 'bg-gray-800/95 border-gray-700 text-white'
              : 'bg-white/95 border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}