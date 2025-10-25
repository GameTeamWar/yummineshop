'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Package, Trash2, ShoppingCart, Star } from 'lucide-react';

interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  storeId: string;
  storeName: string;
  category: string;
  createdAt: Date;
}

const FavoritesPage: React.FC = () => {
  const { user, darkMode } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid)
      );

      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesData = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FavoriteItem[];

      setFavorites(favoritesData);
    } catch (error) {
      console.error('Favoriler alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (favoriteId: string) => {
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Favorilerden çıkarılırken hata:', error);
    }
  };

  const addToCart = (favorite: FavoriteItem) => {
    // Sepete ekleme işlemi burada yapılacak
    console.log('Sepete eklendi:', favorite.productName);
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
      {/* Page Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Favorilerim</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Beğendiğiniz ürünleri görüntüleyin ve yönetin
        </p>
      </div>

      {/* Stats */}
      {favorites.length > 0 && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {favorites.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Favori Ürün
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Set(favorites.map(f => f.storeId)).size}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Farklı Mağaza
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ₺{favorites.reduce((sum, fav) => sum + fav.productPrice, 0).toLocaleString('tr-TR')}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Toplam Değer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Henüz favoriniz yok
          </h3>
          <p className={`text-gray-600 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Beğendiğiniz ürünleri favorilerinize ekleyin!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Product Image */}
              <div className="relative mb-4">
                <div className={`w-full h-48 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {favorite.productImage ? (
                    <img
                      src={favorite.productImage}
                      alt={favorite.productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </div>
                <button
                  onClick={() => removeFromFavorites(favorite.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {favorite.category}
                </div>

                <h3 className={`font-semibold text-lg leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {favorite.productName}
                </h3>

                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {favorite.storeName}
                </p>

                <div className="flex items-center justify-between">
                  <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₺{favorite.productPrice.toLocaleString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      4.5
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => addToCart(favorite)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm font-medium">Sepete Ekle</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;