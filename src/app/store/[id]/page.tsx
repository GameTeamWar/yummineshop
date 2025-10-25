'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import StoreDetailPage from '../StoreDetailPage';

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

  // Real-time cart updates from Firestore
  useEffect(() => {
    if (user && id) {
      const unsubscribe = onSnapshot(doc(db, 'carts', user.uid), (docSnap) => {
        const data = docSnap.data();
        const cart = data?.stores?.[id as string] || {};
        setCart(cart);
      });
      return unsubscribe;
    }
  }, [user, id]);

  const addToCart = async (productId: string) => {
    if (!user) return;

    // Optimistic update
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId: id, productId }),
      });
      if (!response.ok) {
        // Revert on failure
        setCart(prev => {
          const newCart = { ...prev };
          if (newCart[productId] > 1) {
            newCart[productId]--;
          } else {
            delete newCart[productId];
          }
          return newCart;
        });
        console.error('Failed to add to cart:', await response.text());
      }
    } catch (error) {
      // Revert on error
      setCart(prev => {
        const newCart = { ...prev };
        if (newCart[productId] > 1) {
          newCart[productId]--;
        } else {
          delete newCart[productId];
        }
        return newCart;
      });
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    // Optimistic update
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId: id, productId }),
      });
      if (!response.ok) {
        // Revert on failure
        setCart(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1,
        }));
        console.error('Failed to remove from cart:', await response.text());
      }
    } catch (error) {
      // Revert on error
      setCart(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));
      console.error('Error removing from cart:', error);
    }
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
      // Clear cart in Firestore
      const token = await user.getIdToken();
      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId: store.id }),
      });
    } catch (error) {
      console.error('Sipariş verilirken hata:', error);
      alert('Sipariş verilemedi.');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch('/api/cart/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ storeId: id }),
    });
  };

  const deleteItemFromCart = async (productId: string) => {
    if (!user) return;

    // Optimistic update
    const previousQuantity = cart[productId];
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/cart/delete-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId: id, productId }),
      });
      if (!response.ok) {
        // Revert on failure
        setCart(prev => ({
          ...prev,
          [productId]: previousQuantity,
        }));
        console.error('Failed to delete item from cart:', await response.text());
      }
    } catch (error) {
      // Revert on error
      setCart(prev => ({
        ...prev,
        [productId]: previousQuantity,
      }));
      console.error('Error deleting item from cart:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"></div>;
  }

  return <StoreDetailPage storeData={store} productsData={products} cart={cart} addToCart={addToCart} setCart={setCart} clearCart={clearCart} removeFromCart={removeFromCart} deleteItemFromCart={deleteItemFromCart} />;
}