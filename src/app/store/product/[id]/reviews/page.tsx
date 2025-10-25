'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Calendar, User, MessageSquare, Image as ImageIcon, ThumbsUp, Flag, ChevronLeft } from 'lucide-react';
import Header from '@/components/store/navigations/Header';

// Mevcut ürünler (ShoppingSection'dan)
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

// Ürün mevcut mu kontrolü
const isProductAvailable = (productId: number) => {
  return discountedProducts.some(p => p.id === productId) || popularProducts.some(p => p.id === productId);
};

// Mock mağaza verisi
const storeData = {
  id: 7,
  name: 'İpekyol Mağazası',
  logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
  rating: 4.8,
  totalReviews: 1523,
  joinDate: '2022-03-15',
  description: 'En güncel moda ve stil ürünlerini burada bulabilirsiniz. Kaliteli ürünler ve hızlı teslimat garantisi.',
  stats: {
    totalProducts: 1250,
    totalOrders: 15420,
    responseTime: '2 saat',
    returnRate: '2.1%'
  }
};

// Mock yorum verisi
const mockReviews = [
  {
    id: 1,
    user: {
      name: 'Ayşe K.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
      joinDate: '2023-01-15',
      totalReviews: 23
    },
    product: {
      id: 101,
      name: 'Ayarlanabilir Bel Şişme Yelek',
      image: 'https://picsum.photos/200/200?random=101'
    },
    rating: 5,
    date: '2024-10-20',
    title: 'Harika bir ürün!',
    comment: 'Ürün çok kaliteli ve rahat. Kışın soğuk havalarda mükemmel bir seçim. Teslimat da çok hızlıydı, teşekkürler!',
    images: [
      'https://picsum.photos/300/300?random=201',
      'https://picsum.photos/300/300?random=202'
    ],
    helpful: 12,
    verified: true
  },
  {
    id: 2,
    user: {
      name: 'Mehmet D.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      joinDate: '2022-08-22',
      totalReviews: 67
    },
    product: {
      id: 102,
      name: 'Kumaş Mix Colorblock Sweatshirt',
      image: 'https://picsum.photos/200/200?random=102'
    },
    rating: 4,
    date: '2024-10-18',
    title: 'Güzel tasarım',
    comment: 'Tasarım çok hoşuma gitti. Kumaş kalitesi de iyi. Sadece biraz büyük geldi, bir beden küçük almalıymışım.',
    images: [
      'https://picsum.photos/300/300?random=203'
    ],
    helpful: 8,
    verified: true
  },
  {
    id: 3,
    user: {
      name: 'Zeynep A.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      joinDate: '2023-05-10',
      totalReviews: 15
    },
    product: {
      id: 103,
      name: 'Triko Mix Dik Yaka Sweatshirt',
      image: 'https://picsum.photos/200/200?random=103'
    },
    rating: 5,
    date: '2024-10-15',
    title: 'Kesintisiz alışveriş',
    comment: 'İpekyol\'da yıllardır alışveriş yapıyorum. Her zaman kaliteli ürünler ve güvenilir hizmet. Bu sweatshirt de beklentilerimi karşıladı.',
    images: [],
    helpful: 15,
    verified: true
  },
  {
    id: 4,
    user: {
      name: 'Ahmet Y.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      joinDate: '2021-11-30',
      totalReviews: 89
    },
    product: {
      id: 104,
      name: 'Payetli Çizgi Desen Gömlek',
      image: 'https://picsum.photos/200/200?random=104'
    },
    rating: 3,
    date: '2024-10-12',
    title: 'Ortalama',
    comment: 'Ürün fena değil ama payetler biraz dökülüyor. Özel günlerde giymek için uygun. Fiyatına göre idare eder.',
    images: [
      'https://picsum.photos/300/300?random=204',
      'https://picsum.photos/300/300?random=205',
      'https://picsum.photos/300/300?random=206'
    ],
    helpful: 5,
    verified: true
  },
  {
    id: 5,
    user: {
      name: 'Elif S.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
      joinDate: '2023-09-05',
      totalReviews: 8
    },
    product: {
      id: 105,
      name: 'Pamuklu Basic Tişört',
      image: 'https://picsum.photos/200/200?random=105'
    },
    rating: 5,
    date: '2024-10-10',
    title: 'Temel gardırop için mükemmel',
    comment: 'Basit ama kaliteli bir tişört. Yıkanmaya dayanıklı ve rahat. Her gardırobun vazgeçilmezi!',
    images: [],
    helpful: 22,
    verified: true
  },
  {
    id: 6,
    user: {
      name: 'Can B.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
      joinDate: '2022-12-18',
      totalReviews: 34
    },
    product: {
      id: 106,
      name: 'Skinny Fit Pantolon',
      image: 'https://picsum.photos/200/200?random=106'
    },
    rating: 4,
    date: '2024-10-08',
    title: 'Rahat ve şık',
    comment: 'Pantolon çok rahat. Kesimi hoşuma gitti. Sadece ütü gerektiriyor ama buna değer. Tekrar alırım.',
    images: [
      'https://picsum.photos/300/300?random=207'
    ],
    helpful: 9,
    verified: true
  }
];

export default function StoreReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');

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

  useEffect(() => {
    // Dark mode kontrolü
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  const sortedReviews = [...mockReviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return 0;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} ay önce`;
    return `${Math.ceil(diffDays / 365)} yıl önce`;
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Geri Butonu */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Geri
        </button>

        {/* Mağaza Profil Başlığı */}
        <div className={`rounded-2xl overflow-hidden shadow-lg mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Kapak Görseli */}
          <div className="relative h-48 bg-linear-to-r from-blue-500 to-purple-600">
            <img
              src={storeData.coverImage}
              alt={storeData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Mağaza Bilgileri */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={storeData.logo}
                alt={storeData.name}
                className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{storeData.name}</h1>
                <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {storeData.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{storeData.stats.totalProducts.toLocaleString()}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ürün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{storeData.stats.totalOrders.toLocaleString()}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sipariş</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{storeData.stats.responseTime}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Yanıt Süresi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{storeData.stats.returnRate}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>İade Oranı</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">{storeData.rating}</span>
                    <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({storeData.totalReviews.toLocaleString()} yorum)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Katılım: {new Date(storeData.joinDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yorumlar Başlığı ve Filtre */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Müşteri Yorumları</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="highest">En Yüksek Puan</option>
            <option value="lowest">En Düşük Puan</option>
            <option value="helpful">En Faydalı</option>
          </select>
        </div>

        {/* Yorumlar Listesi */}
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-2xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex gap-4">
                {/* Kullanıcı Avatarı */}
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />

                <div className="flex-1">
                  {/* Kullanıcı Bilgileri */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold">{review.user.name}</span>
                    {review.verified && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Doğrulanmış Alıcı
                      </span>
                    )}
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getTimeAgo(review.date)}
                    </span>
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${
                    isProductAvailable(review.product.id) 
                      ? 'bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors' 
                      : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                  }`} onClick={() => {
                    if (isProductAvailable(review.product.id)) {
                      router.push(`/product/${review.product.id}`);
                    }
                  }}>
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{review.product.name}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {!isProductAvailable(review.product.id) && (
                        <span className="text-xs text-red-500 mt-1 block">Ürün mevcut değil</span>
                      )}
                    </div>
                  </div>

                  {/* Yorum Başlığı */}
                  {review.title && (
                    <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                  )}

                  {/* Yorum Metni */}
                  <p className={`mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {review.comment}
                  </p>

                  {/* Yorum Görselleri */}
                  {review.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {review.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(image)}
                          className="relative aspect-square rounded-lg overflow-hidden group"
                        >
                          <img
                            src={image}
                            alt={`Yorum görseli ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Yorum Alt Bilgileri */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <button className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                        darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                        <ThumbsUp className="w-4 h-4" />
                        Faydalı ({review.helpful})
                      </button>
                      <button className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                        darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                        <Flag className="w-4 h-4" />
                        Şikayet Et
                      </button>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daha Fazla Yorum Butonu */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors">
            Daha Fazla Yorum Gör
          </button>
        </div>
      </div>

      {/* Görsel Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Yorum görseli"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}