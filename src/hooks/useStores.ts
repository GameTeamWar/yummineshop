import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Store {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
}

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'stores'));
        const storesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Store));
        setStores(storesData);
      } catch (error) {
        console.error('Mağaza verileri alınırken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading };
};