'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface Store {
  id: string;
  name: string;
  description: string;
  deliveryFee: number;
}

export default function StorePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      if (!id) return;

      try {
        const storeDoc = await getDoc(doc(db, 'stores', id as string));
        if (storeDoc.exists()) {
          setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
        }

        const productsQuery = await getDocs(collection(db, 'stores', id as string, 'products'));
        const productsData = productsQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        setProducts(productsData);
      } catch (error) {
        console.error('Veri alınırken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [id]);

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const placeOrder = async () => {
    if (!user || !store) return;

    const orderItems = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        name: product?.name,
        price: product?.price,
        quantity,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) + store.deliveryFee;

    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        storeId: store.id,
        items: orderItems,
        total,
        deliveryFee: store.deliveryFee,
        status: 'pending',
        createdAt: new Date(),
      });
      alert('Sipariş verildi!');
      setCart({});
    } catch (error) {
      console.error('Sipariş verilirken hata:', error);
      alert('Sipariş verilemedi.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center">Mağaza bulunamadı.</div>;
  }

  const cartTotal = Object.entries(cart).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product?.price || 0) * quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-indigo-600 hover:text-indigo-900">← Ana Sayfa</Link>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ürünler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{product.description}</p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">₺{product.price}</p>
                      <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                      <div className="mt-4 flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded cursor-pointer"
                          disabled={!cart[product.id]}
                        >
                          -
                        </button>
                        <span>{cart[product.id] || 0}</span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded cursor-pointer"
                          disabled={product.stock <= (cart[product.id] || 0)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sepet</h3>
              {Object.entries(cart).length === 0 ? (
                <p className="text-gray-500">Sepet boş</p>
              ) : (
                <>
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find(p => p.id === productId);
                    return (
                      <div key={productId} className="flex justify-between items-center mb-2">
                        <span className="text-sm">{product?.name} x{quantity}</span>
                        <span className="text-sm">₺{(product?.price || 0) * quantity}</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span>Teslimat Ücreti</span>
                      <span>₺{store.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                      <span>Toplam</span>
                      <span>₺{cartTotal + store.deliveryFee}</span>
                    </div>
                  </div>
                  <button
                    onClick={placeOrder}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 cursor-pointer"
                  >
                    Sipariş Ver
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}