'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export interface SuperpassData {
  code: string;
  expiresAt: Date;
  action: 'single' | 'bulk' | 'single-product' | 'bulk-product';
  categoryIds: string[];
}

interface SuperpassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (action: string, categoryIds: string[]) => void;
  superpassData: SuperpassData | null;
}

export default function SuperpassModal({ isOpen, onClose, onVerify, superpassData }: SuperpassModalProps) {
  const [enteredSuperpass, setEnteredSuperpass] = useState('');
  const [remainingTime, setRemainingTime] = useState(30);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !superpassData) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Time expired
          clearInterval(timer);
          toast.error('Superpass kodu süresi doldu');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, superpassData, onClose]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen && superpassData) {
      setRemainingTime(30);
    }
  }, [isOpen, superpassData]);

  const generateSuperpass = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createSuperpass = async (action: 'single' | 'bulk' | 'single-product' | 'bulk-product', categoryIds: string[]) => {
    const code = generateSuperpass();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 30); // 30 seconds expiry

    try {
      // Store superpass in Firebase
      await addDoc(collection(db, 'superpasses'), {
        code,
        expiresAt,
        action,
        categoryIds,
        createdAt: new Date(),
        used: false,
        adminEmail: 'yumminecom@gmail.com'
      });

      // Send email to admin
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'yumminecom@gmail.com',
          additionalData: {
            superpassCode: code,
            action: action === 'single' ? 'Tek Mağaza Kategorisi Silme' :
                   action === 'bulk' ? 'Toplu Mağaza Kategorisi Silme' :
                   action === 'single-product' ? 'Tek Ürün Kategorisi Silme' : 'Toplu Ürün Kategorisi Silme',
            categoryCount: categoryIds.length,
            expiresAt: expiresAt.toISOString(),
            isSuperpass: true
          }
        })
      });

      toast.success('Superpass oluşturuldu ve yöneticiye gönderildi');
    } catch (error) {
      console.error('Superpass oluşturma hatası:', error);
      toast.error('Superpass oluşturulamadı');
    }
  };

  const verifySuperpass = async () => {
    if (!superpassData || !enteredSuperpass) {
      toast.error('Superpass kodunu girin');
      return;
    }

    if (remainingTime <= 0) {
      toast.error('Superpass kodu süresi dolmuş');
      return;
    }

    try {
      // Check if superpass exists and is valid
      const superpassQuery = collection(db, 'superpasses');
      const q = query(superpassQuery, where('code', '==', enteredSuperpass), where('used', '==', false));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Geçersiz veya kullanılmış superpass kodu');
        return;
      }

      const superpassDoc = querySnapshot.docs[0];
      const superpass = superpassDoc.data();

      // Check expiry
      if (new Date() > superpass.expiresAt.toDate()) {
        toast.error('Superpass kodu süresi dolmuş');
        return;
      }

      // Mark as used
      await updateDoc(doc(db, 'superpasses', superpassDoc.id), {
        used: true,
        usedAt: new Date()
      });

      // Call the onVerify callback
      onVerify(superpassData.action, superpassData.categoryIds);

      // Reset state
      setEnteredSuperpass('');
      onClose();

    } catch (error) {
      console.error('Superpass doğrulama hatası:', error);
      toast.error('Superpass doğrulanırken hata oluştu');
    }
  };

  const handleClose = () => {
    setEnteredSuperpass('');
    setRemainingTime(30);
    onClose();
  };

  if (!isOpen || !superpassData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Superpass Doğrulama</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Güvenlik Doğrulaması Gerekli
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    {superpassData.action === 'single'
                      ? 'Kategori silme işlemi için'
                      : `${superpassData.categoryIds.length} kategori silme işlemi için`
                    } superpass kodu YETKİLİ MAİL adresine gönderildi.
                  </p>
                  <p className="mt-2">
                    Kalan süre: <span className={`font-bold ${remainingTime <= 10 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Superpass Kodu *
            </label>
            <input
              type="text"
              value={enteredSuperpass}
              onChange={(e) => setEnteredSuperpass(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono tracking-wider"
              placeholder="ABC12345"
              maxLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Email adresinizden gelen 8 haneli kodu girin
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            İptal
          </button>
          <button
            onClick={verifySuperpass}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {superpassData.action === 'single' ? 'Kategoriyi Sil' : 'Kategorileri Sil'}
          </button>
        </div>
      </div>
    </div>
  );
}