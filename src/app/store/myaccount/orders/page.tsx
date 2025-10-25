'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Clock, CheckCircle, XCircle, Truck, Package, Star, MapPin, Search } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  storeName: string;
  storeId: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  estimatedDelivery?: Date;
}

const OrdersPage: React.FC = () => {
  const { user, darkMode } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData: Order[] = [];

      for (const docSnap of ordersSnapshot.docs) {
        const orderData = docSnap.data();
        const order: Order = {
          id: docSnap.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate() || new Date(),
          estimatedDelivery: orderData.estimatedDelivery?.toDate(),
        } as Order;

        ordersData.push(order);
      }

      setOrders(ordersData);
    } catch (error) {
      console.error('Siparişler alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />;
      case 'confirmed':
        return <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />;
      case 'preparing':
        return <Package className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />;
      case 'ready':
        return <Truck className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />;
      case 'delivered':
        return <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />;
      case 'cancelled':
        return <XCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />;
      default:
        return <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'ready':
        return 'Hazır';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    const isDark = darkMode;
    switch (status) {
      case 'pending':
        return isDark
          ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return isDark
          ? 'bg-blue-900/30 text-blue-300 border-blue-700/50'
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return isDark
          ? 'bg-orange-900/30 text-orange-300 border-orange-700/50'
          : 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return isDark
          ? 'bg-purple-900/30 text-purple-300 border-purple-700/50'
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return isDark
          ? 'bg-green-900/30 text-green-300 border-green-700/50'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return isDark
          ? 'bg-red-900/30 text-red-300 border-red-700/50'
          : 'bg-red-100 text-red-800 border-red-200';
      default:
        return isDark
          ? 'bg-gray-800/50 text-gray-300 border-gray-600/50'
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by status
    let statusMatch = true;
    if (filter === 'all') statusMatch = true;
    else if (filter === 'pending') statusMatch = ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    else if (filter === 'delivered') statusMatch = order.status === 'delivered';
    else if (filter === 'cancelled') statusMatch = order.status === 'cancelled';

    // Filter by search query
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const orderId = order.id.toLowerCase();
      const storeName = order.storeName.toLowerCase();
      const itemsText = order.items.map(item => item.name.toLowerCase()).join(' ');
      
      searchMatch = orderId.includes(query) || 
                   storeName.includes(query) || 
                   itemsText.includes(query);
    }

    return statusMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Siparişlerim</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sipariş geçmişinizi görüntüleyin ve takip edin</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className={`relative ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg`}>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Sipariş ID, mağaza adı veya ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
          />
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Tümü ({orders.filter(o => {
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const orderId = o.id.toLowerCase();
                const storeName = o.storeName.toLowerCase();
                const itemsText = o.items.map(item => item.name.toLowerCase()).join(' ');
                return orderId.includes(query) || storeName.includes(query) || itemsText.includes(query);
              }
              return true;
            }).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Aktif ({orders.filter(o => {
              const statusMatch = ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status);
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const orderId = o.id.toLowerCase();
                const storeName = o.storeName.toLowerCase();
                const itemsText = o.items.map(item => item.name.toLowerCase()).join(' ');
                const searchMatch = orderId.includes(query) || storeName.includes(query) || itemsText.includes(query);
                return statusMatch && searchMatch;
              }
              return statusMatch;
            }).length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'delivered'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Teslim Edildi ({orders.filter(o => {
              const statusMatch = o.status === 'delivered';
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const orderId = o.id.toLowerCase();
                const storeName = o.storeName.toLowerCase();
                const itemsText = o.items.map(item => item.name.toLowerCase()).join(' ');
                const searchMatch = orderId.includes(query) || storeName.includes(query) || itemsText.includes(query);
                return statusMatch && searchMatch;
              }
              return statusMatch;
            }).length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'cancelled'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            İptal Edildi ({orders.filter(o => {
              const statusMatch = o.status === 'cancelled';
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const orderId = o.id.toLowerCase();
                const storeName = o.storeName.toLowerCase();
                const itemsText = o.items.map(item => item.name.toLowerCase()).join(' ');
                const searchMatch = orderId.includes(query) || storeName.includes(query) || itemsText.includes(query);
                return statusMatch && searchMatch;
              }
              return statusMatch;
            }).length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {filter === 'all' ? 'Henüz siparişiniz yok' : 'Bu kategoride sipariş bulunamadı'}
          </h3>
          <p className={`text-gray-600 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filter === 'all'
              ? 'İlk siparişinizi vermek için mağazamızı keşfedin!'
              : 'Başka bir kategori deneyebilirsiniz.'
            }
          </p>
          <button
            onClick={() => router.push('/store')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Alışverişe Başla
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Order Header */}
              <div className={`p-6 border-b border-gray-100 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>
                    <span className={`text-gray-500 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₺{order.total.toLocaleString('tr-TR')}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {order.createdAt.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>{order.storeName}</span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {selectedOrder?.id === order.id ? 'Detayları Gizle' : 'Detayları Göster'}
                  </button>
                </div>
              </div>

              {/* Order Details */}
              {selectedOrder?.id === order.id && (
                <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  {/* Items */}
                  <div className="mb-6">
                    <h4 className={`font-medium text-gray-900 mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sipariş Detayları</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className={`flex items-center gap-4 bg-white p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Package className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h5>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adet: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              ₺{item.price.toLocaleString('tr-TR')} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teslimat Bilgileri</h4>
                      <div className={`bg-white p-4 rounded-lg space-y-2 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="flex items-start gap-2">
                          <MapPin className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teslimat Adresi</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{order.deliveryAddress || 'Adres bilgisi bulunamadı'}</p>
                          </div>
                        </div>
                        {order.estimatedDelivery && (
                          <div className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tahmini Teslimat</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {order.estimatedDelivery.toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ödeme Bilgileri</h4>
                      <div className={`bg-white p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ödeme Yöntemi</span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {order.paymentMethod || 'Nakit'}
                          </span>
                        </div>
                        <div className={`flex items-center justify-between mt-2 pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Toplam</span>
                          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₺{order.total.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'delivered' && (
                    <div className="mt-6 flex gap-3">
                      <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        <Star className="w-4 h-4" />
                        Mağazayı Değerlendir
                      </button>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Tekrar Sipariş Ver
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;