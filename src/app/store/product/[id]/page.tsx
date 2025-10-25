'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Clock, Star, Heart, ShoppingBag, ChevronLeft, Plus, Minus, Truck, Shield, Award, Package, MessageCircle, Send, ChevronRight, ChevronLeft as ChevronLeftIcon, Eye, ThumbsUp, User, Calendar } from 'lucide-react';
import CartPreloader from '@/components/store/loader/CartPreloader';
import Header from '@/components/store/navigations/Header';
import MobileNavigation from '@/components/store/navigations/MobileNavigation';
import StoreInfoBar from '@/components/store/ui/infobar';
import ProductZoom from '@/components/store/ui/ProductZoom';
import { useAuth } from '@/context/AuthContext';

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
  { id: 7, name: 'İpekyol Mağazası', category: 'textile', distance: 1.0, delivery: 20, rating: 4.9, items: 89, reviews: 1523, badge: 'Premium', price: 'yuksek', storeType: 'marka', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop' },
];

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  // Header states
  const [heroMode, setHeroMode] = useState('shopping');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile navigation state
  const [mobileNavActiveTab, setMobileNavActiveTab] = useState('home');

  // Yeni state'ler
  const [activeTab, setActiveTab] = useState('description');
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [currentSimilarIndex, setCurrentSimilarIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [questionTab, setQuestionTab] = useState('public'); // 'public' veya 'private'

  // Sepet state'leri
  const [cart, setCart] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Yorum için yeni state'ler
  const [newReview, setNewReview] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewVideo, setReviewVideo] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Toast mesajı için state'ler
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Favori state'i
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const productId = parseInt(id as string);

    // products array'inde ara
    const foundProduct = products.find(p => p.id === productId);

    if (foundProduct) {
      setProduct(foundProduct);
      // Mağazayı bul - varsayılan mağaza kullan
      const foundStore = stores.find(s => s.id === 7); // İpekyol Mağazası
      setStore(foundStore);

      // Benzer ürünleri bul (aynı kategorideki diğer ürünler)
      const similar = products.filter(p => p.category === foundProduct.category && p.id !== productId);
      setSimilarProducts(similar);

      // Favori kontrolü
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorited(favorites.includes(productId));

      // Eğer kullanıcı giriş yapmamışsa, mevcut sayfayı localStorage'a kaydet
      if (!user) {
        localStorage.setItem('redirectAfterAuth', window.location.pathname);
      }

      // Mock yorumlar
      setReviews([
        {
          id: 1,
          user: 'Ahmet K.',
          rating: 5,
          date: '2024-01-15',
          comment: 'Ürün çok kaliteli, tam beklediğim gibi geldi. Kesinlikle tavsiye ederim.',
          helpful: 12,
          verified: true,
          images: ['https://picsum.photos/300/300?random=201', 'https://picsum.photos/300/300?random=202'],
          video: null
        },
        {
          id: 2,
          user: 'Mehmet Y.',
          rating: 4,
          date: '2024-01-10',
          comment: 'Güzel ürün, sadece teslimat biraz gecikti ama genel olarak memnunum.',
          helpful: 8,
          verified: true,
          images: [],
          video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // örnek video
        },
        {
          id: 3,
          user: 'Ayşe D.',
          rating: 5,
          date: '2024-01-08',
          comment: 'Renk ve beden tam istediğim gibi. Çok memnun kaldım.',
          helpful: 15,
          verified: true,
          images: ['https://picsum.photos/300/300?random=203'],
          video: null
        }
      ]);

      // Mock sorular
      setQuestions([
        {
          id: 1,
          user: 'Fatma S.',
          question: 'Bu ürünün kumaşı ne kadar kalın?',
          answer: 'Ürün orta kalınlıkta bir kumaşa sahip, mevsim geçişlerinde rahatlıkla kullanılabilir.',
          date: '2024-01-12',
          answered: true,
          type: 'public' // herkes görebilir
        },
        {
          id: 2,
          user: 'Ali R.',
          question: 'Yıkama talimatları nelerdir?',
          answer: '30 dereceye kadar yıkama yapabilirsiniz, kurutma makinesinde kurutmayınız.',
          date: '2024-01-10',
          answered: true,
          type: 'public' // herkes görebilir
        },
        {
          id: 3,
          user: 'Misafir Kullanıcı',
          question: 'Bu ürünün beden ölçüleri nedir?',
          answer: 'Beden ölçüleri ürün sayfasında detaylı olarak belirtilmiştir.',
          date: '2024-01-08',
          answered: true,
          type: 'private' // sadece kullanıcı görebilir
        }
      ]);
    } else {
      // Ürün bulunamazsa ana sayfaya yönlendir
      router.push('/');
    }

    // Dark mode kontrolü
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, [id, router]);

  // Favori toggle fonksiyonu
  const toggleFavorite = () => {
    const productId = parseInt(id as string);
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorited) {
      // Favorilerden çıkar
      const newFavorites = favorites.filter((id: number) => id !== productId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorited(false);
    } else {
      // Favorilere ekle
      const newFavorites = [...favorites, productId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorited(true);
    }
  };

  // Benzer ürünler için 15 dakikalık rotasyon
  useEffect(() => {
    if (similarProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSimilarIndex((prev) => (prev + 1) % Math.ceil(similarProducts.length / 4));
      }, 15 * 60 * 1000); // 15 dakika

      return () => clearInterval(interval);
    }
  }, [similarProducts]);

  const handleAskQuestion = () => {
    if (newQuestion.trim()) {
      const question = {
        id: questions.length + 1,
        user: 'Misafir Kullanıcı',
        question: newQuestion,
        date: new Date().toISOString().split('T')[0],
        answered: false,
        type: questionTab // 'public' veya 'private'
      };
      setQuestions([question, ...questions]);
      setNewQuestion('');
    }
  };

  // Görsel yükleme fonksiyonu
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setReviewImages([...reviewImages, result.imageUrl]);
      } else {
        alert('Görsel yükleme hatası: ' + result.error);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Görsel yüklenirken hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  // Video yükleme fonksiyonu
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', `Ürün Yorumu - ${product.name}`);
      formData.append('description', 'Müşteri yorum videosu');

      const response = await fetch('/api/upload-youtube', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setReviewVideo(result.embedUrl);
      } else {
        alert('Video yükleme hatası: ' + result.error);
      }
    } catch (error) {
      console.error('Video upload error:', error);
      alert('Video yüklenirken hata oluştu');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Yorum gönderme fonksiyonu
  const handleSubmitReview = () => {
    if (newReview.trim()) {
      const review = {
        id: reviews.length + 1,
        user: 'Misafir Kullanıcı',
        rating: reviewRating,
        date: new Date().toISOString().split('T')[0],
        comment: newReview,
        helpful: 0,
        verified: false,
        images: reviewImages,
        video: reviewVideo
      };
      setReviews([review, ...reviews]);
      setNewReview('');
      setReviewRating(5);
      setReviewImages([]);
      setReviewVideo('');
    }
  };

  // Görsel silme fonksiyonu
  const removeImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  // YouTube yetkilendirme fonksiyonu
  const handleYouTubeAuth = async () => {
    try {
      const response = await fetch('/api/auth/youtube');
      const data = await response.json();

      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700');
      } else {
        alert('YouTube API yapılandırması eksik');
      }
    } catch (error) {
      console.error('YouTube auth error:', error);
      alert('YouTube yetkilendirmesi başlatılamadı');
    }
  };

  const getVisibleSimilarProducts = () => {
    const start = currentSimilarIndex * 4;
    return similarProducts.slice(start, start + 4);
  };

  // Sepete ekleme fonksiyonu
  const addToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      image: product.images[0],
      store: store.name,
      total: product.price * quantity
    };

    // Sepette aynı ürün var mı kontrol et
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      // Mevcut ürünü güncelle
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
      setCart(updatedCart);
    } else {
      // Yeni ürün ekle
      setCart([...cart, cartItem]);
    }

    // Toplam fiyatı güncelle
    const newTotal = cartTotal + (product.price * quantity);
    setCartTotal(newTotal);

    // Sepet sidebar'ını aç
    setCartSidebarOpen(true);

    // Toast mesajı göster
    setToastMessage(`${quantity} adet ${product.name} sepete eklendi!`);
    setShowToast(true);

    // 3 saniye sonra toast mesajını gizle
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
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

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation activeTab={mobileNavActiveTab} setActiveTab={setMobileNavActiveTab} darkMode={darkMode} user={user} logout={logout} heroMode={heroMode} setHeroMode={setHeroMode} />}

      {!product || !store ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <CartPreloader />
        </div>
      ) : (
        <>
          <StoreInfoBar
            store={store}
            darkMode={darkMode}
            showBackButton={true}
            showProductDetail={true}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Ana Ürün Bölümü */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Ürün Görselleri */}
              <ProductZoom images={product.images} productName={product.name} />

              {/* Ürün Bilgileri */}
              <div className="space-y-8">
            {/* Başlık ve Fiyat */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-bold leading-tight">{product.name}</h1>
                <button 
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isFavorited 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-6 h-6 transition-colors ${
                    isFavorited ? 'fill-white text-white' : 'text-gray-400'
                  }`} />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-lg">{product.rating}</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ({product.reviews} yorum)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>127 görüntülenme</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-green-600">
                    ₺{product.price?.toLocaleString('tr-TR')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className={`text-xl line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ₺{product.originalPrice.toLocaleString('tr-TR')}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      %{Math.round((1 - product.price / product.originalPrice) * 100)} İndirim
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      ₺{product.originalPrice - product.price} tasarruf
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mağaza Bilgileri 
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
              <div className="flex items-center gap-4 mb-4">
                <img src={store.image} alt={store.name} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{store.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{store.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{store.distance} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{store.delivery} dk</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push(`/store/${store.id}`)}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Mağazayı İncele
              </button>
            </div>*/}

            {/* Adet Seçimi ve Sepete Ekle */}
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
                <h3 className="font-bold text-lg mb-4">Adet Seçimi</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-bold min-w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Toplam</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₺{(product.price * quantity).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={addToCart}
                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-xl">
                <ShoppingBag className="w-7 h-7" />
                Sepete Ekle
              </button>
            </div>

            {/* Teslimat ve Güvenlik */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
                <h3 className="font-bold mb-4 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-blue-500" />
                  Teslimat
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Teslimat Süresi:</span>
                    <span className="font-semibold">{store.delivery} dakika</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teslimat Ücreti:</span>
                    <span className="font-semibold">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo Firması:</span>
                    <span className="font-semibold">Yummine Kargo</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
                <h3 className="font-bold mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-500" />
                  Güvenlik
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span>Kalite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-500" />
                    <span>Güvenli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span>Orijinal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span>Güvence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detaylı Bilgiler Tabs */}
        <div className={`rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-xl overflow-hidden mb-16`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {[
                { id: 'description', label: 'Ürün Açıklaması', icon: Package },
                { id: 'reviews', label: `Yorumlar (${reviews.length})`, icon: Star },
                { id: 'questions', label: `Soru & Cevap (${questions.length})`, icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-6 px-8 font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                      : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Ürün Açıklaması</h3>
                  <p className="text-lg leading-relaxed mb-6">{product.description}</p>

                  {product.material && (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold mb-3">Materyal Bilgileri</h4>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{product.material}</p>
                    </div>
                  )}

                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="text-xl font-semibold mb-4">Özellikler</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.features.map((feature: any, index: number) => (
                          <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                              {feature.label}
                            </div>
                            <div className="font-medium">{feature.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Müşteri Yorumları</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold">{product.rating}</span>
                      <span className="text-gray-600">({reviews.length} yorum)</span>
                    </div>
                  </div>
                </div>

                {/* Yorum Ekleme Formu */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-4">Yorumunuzu Paylaşın</h4>

                  {/* Yıldız Derecelendirmesi */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Derecelendirme</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="text-2xl transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yorum Metni */}
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                    className={`w-full px-4 py-3 rounded-xl border transition-colors mb-4 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-white border-gray-300 focus:border-blue-500'
                    }`}
                    rows={4}
                  />

                  {/* Görsel ve Video Yükleme */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {/* Görsel Yükleme */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Fotoğraf Ekle</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                          darkMode
                            ? 'border-gray-600 hover:bg-gray-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        } ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        {uploadingImage ? '' : 'Fotoğraf Seç'}
                      </label>
                    </div>

                    {/* Video Yükleme - Geçici olarak devre dışı */}
                    {/*
                    <div>
                      <label className="block text-sm font-medium mb-2">Video Ekle</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          disabled={uploadingVideo}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                            darkMode
                              ? 'border-gray-600 hover:bg-gray-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          } ${uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploadingVideo ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          {uploadingVideo ? '' : 'Video Seç'}
                        </label>
                        <button
                          onClick={handleYouTubeAuth}
                          className="text-xs text-blue-500 hover:text-blue-600 underline"
                          type="button"
                        >
                          YouTube Bağlantısı Gerekli
                        </button>
                      </div>
                    </div>
                    */}

                  </div>

                  {/* Yüklenen Görseller Önizlemesi */}
                  {reviewImages.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Yüklenen Fotoğraflar</label>
                      <div className="flex gap-2 flex-wrap">
                        {reviewImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Yorum görseli ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yüklenen Video Önizlemesi - Geçici olarak devre dışı */}
                  {/*
                  {reviewVideo && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Yüklenen Video</label>
                      <div className="relative inline-block">
                        <iframe
                          src={reviewVideo}
                          className="w-48 h-27 rounded-lg border"
                          allowFullScreen
                        />
                        <button
                          onClick={() => setReviewVideo('')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  */}

                  {/* Gönder Butonu */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={!newReview.trim()}
                    className={`px-6 py-3 rounded-xl transition-colors ${
                      newReview.trim()
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Yorumu Gönder
                  </button>
                </div>

                <div className="space-y-6">
                  {reviews.slice(0, showAllReviews ? reviews.length : 3).map((review: any) => (
                    <div key={review.id} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{review.user}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {review.date}
                              {review.verified && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  Doğrulanmış
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mb-4 leading-relaxed">{review.comment}</p>

                      {/* Görseller */}
                      {review.images && review.images.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {review.images.map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Yorum görseli ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(image, '_blank')}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Video - Geçici olarak devre dışı */}
                      {/*
                      {review.video && (
                        <div className="mb-4">
                          <iframe
                            src={review.video}
                            className="w-full max-w-md h-64 rounded-lg border"
                            allowFullScreen
                          />
                        </div>
                      )}
                      */}

                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          Faydalı ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {reviews.length > 3 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                    >
                      {showAllReviews ? 'Daha Az Göster' : `Tüm Yorumları Göster (${reviews.length})`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Soru & Cevap</h3>

                {/* Alt Sekmeler */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setQuestionTab('public')}
                    className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                      questionTab === 'public'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Herkes ({questions.filter(q => q.type === 'public').length})
                  </button>
                  <button
                    onClick={() => setQuestionTab('private')}
                    className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                      questionTab === 'private'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sadece Ben ({questions.filter(q => q.type === 'private').length})
                  </button>
                </div>

                {/* Soru Sorma Bölümü */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-4">Sorunuzu Sorun</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Ürün hakkında sormak istediğiniz bir şey var mı?"
                      className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    />
                    <button
                      onClick={handleAskQuestion}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Sor
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="questionType"
                        value="public"
                        checked={questionTab === 'public'}
                        onChange={() => setQuestionTab('public')}
                        className="text-blue-500"
                      />
                      <span>Herkes görebilir</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="questionType"
                        value="private"
                        checked={questionTab === 'private'}
                        onChange={() => setQuestionTab('private')}
                        className="text-blue-500"
                      />
                      <span>Sadece ben görebilirim</span>
                    </label>
                  </div>
                </div>

                {/* Sorular Listesi */}
                <div className="space-y-6">
                  {questions
                    .filter(q => q.type === questionTab)
                    .slice(0, showAllQuestions ? questions.length : 5)
                    .map((question: any) => (
                    <div key={question.id} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold">{question.user}</span>
                          <span className="text-sm text-gray-600">{question.date}</span>
                          {question.type === 'private' && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                              Özel
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{question.question}</p>
                      </div>

                      {question.answered && (
                        <div className={`ml-11 p-4 rounded-xl ${darkMode ? 'bg-gray-600' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">S</span>
                            </div>
                            <span className="font-semibold text-blue-600">Satıcı Cevabı</span>
                          </div>
                          <p>{question.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {questions.filter(q => q.type === questionTab).length > 5 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllQuestions(!showAllQuestions)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                    >
                      {showAllQuestions ? 'Daha Az Göster' : `Tüm Soruları Göster (${questions.filter(q => q.type === questionTab).length})`}
                    </button>
                  </div>
                )}

                {questions.filter(q => q.type === questionTab).length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {questionTab === 'public' ? 'Henüz genel soru sorulmamış.' : 'Henüz özel soru sormadınız.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Benzer Ürünler */}
        {similarProducts.length > 0 && (
          <div className={`rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-xl p-8`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold">Benzer Ürünler</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentSimilarIndex(Math.max(0, currentSimilarIndex - 1))}
                  disabled={currentSimilarIndex === 0}
                  className={`p-3 rounded-full transition-colors ${
                    currentSimilarIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentSimilarIndex(currentSimilarIndex + 1)}
                  disabled={(currentSimilarIndex + 1) * 4 >= similarProducts.length}
                  className={`p-3 rounded-full transition-colors ${
                    (currentSimilarIndex + 1) * 4 >= similarProducts.length
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getVisibleSimilarProducts().map((similarProduct: any) => (
                <div
                  key={similarProduct.id}
                  onClick={() => router.push(`/product/${similarProduct.id}`)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={similarProduct.images[0]}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {similarProduct.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                          similarProduct.badgeColor === 'purple' ? 'bg-purple-500' :
                          similarProduct.badgeColor === 'red' ? 'bg-red-500' :
                          similarProduct.badgeColor === 'orange' ? 'bg-orange-500' :
                          similarProduct.badgeColor === 'green' ? 'bg-green-500' :
                          similarProduct.badgeColor === 'blue' ? 'bg-blue-500' :
                          similarProduct.badgeColor === 'yellow' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {similarProduct.badge}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                      {similarProduct.name}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(similarProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({similarProduct.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">
                        ₺{similarProduct.price.toLocaleString('tr-TR')}
                      </span>
                      {similarProduct.originalPrice && similarProduct.originalPrice > similarProduct.price && (
                        <span className="text-xs line-through text-gray-500">
                          ₺{similarProduct.originalPrice.toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )}

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