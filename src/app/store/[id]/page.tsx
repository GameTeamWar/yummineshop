'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import StoreDetailPage from '@/components/home/store/StoreDetailPage';

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
    return <div className="min-h-screen flex items-center justify-center"></div>;
  }

  // Always show StoreDetailPage with mock data if store not found
  return <StoreDetailPage storeData={store} productsData={products} />;
}