'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Star, Heart, MapPin, Truck, TrendingUp, Clock } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  items: any[];
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

const MyAccountPage: React.FC = () => {
  const { user, darkMode } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentOrders();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Order[];

      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0)
      };

      setStats(stats);
    } catch (error) {
      console.error('İstatistikler alınırken hata:', error);
    }
  };

  const fetchRecentOrders = async () => {
    if (!user) return;

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Order[];

      setRecentOrders(orders);
    } catch (error) {
      console.error('Son siparişler alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    const isDark = darkMode;
    switch (status) {
      case 'pending': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'confirmed': return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'preparing': return isDark ? 'text-orange-400' : 'text-orange-600';
      case 'ready': return isDark ? 'text-purple-400' : 'text-purple-600';
      case 'delivered': return isDark ? 'text-green-400' : 'text-green-600';
      case 'cancelled': return isDark ? 'text-red-400' : 'text-red-600';
      default: return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Hoş Geldiniz, {user?.displayName || user?.email?.split('@')[0]}!
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Hesabınızı yönetmek ve siparişlerinizi takip etmek için buradayız.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Package className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalOrders}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toplam Sipariş</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <Clock className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pendingOrders}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aktif Sipariş</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completedOrders}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tamamlanan</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Truck className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ₺{stats.totalSpent.toLocaleString('tr-TR')}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toplam Harcama</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className={`p-4 rounded-lg border transition-colors ${
            darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
          }`}>
            <Package className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="text-sm font-medium">Siparişlerim</span>
          </button>

          <button className={`p-4 rounded-lg border transition-colors ${
            darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
          }`}>
            <Heart className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            <span className="text-sm font-medium">Favorilerim</span>
          </button>

          <button className={`p-4 rounded-lg border transition-colors ${
            darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
          }`}>
            <MapPin className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className="text-sm font-medium">Adreslerim</span>
          </button>

          <button className={`p-4 rounded-lg border transition-colors ${
            darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
          }`}>
            <Star className={`w-6 h-6 mx-auto mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className="text-sm font-medium">Değerlendirmelerim</span>
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Son Siparişlerim</h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className={`flex items-center justify-between p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <Package className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Sipariş #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.createdAt.toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₺{order.total.toLocaleString('tr-TR')}
                  </p>
                  <p className={`text-sm ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccountPage;