const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyCVrI9ztYsj6SAfMWSi7M9OJCN78uCunAc",
  authDomain: "yumini-be273.firebaseapp.com",
  projectId: "yumini-be273",
  storageBucket: "yumini-be273.firebasestorage.app",
  messagingSenderId: "1052179014181",
  appId: "1:1052179014181:web:a878088b6fc8d9b2a195cc",
  measurementId: "G-SXDGRP6C0Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSampleSiteCategories() {
  console.log('📂 Örnek Site Kategorileri Oluşturuluyor...\n');

  const categories = [
    {
      name: 'Yiyecek & İçecek',
      description: 'Restoranlar, kafe ve yiyecek servisleri',
      icon: '🍽️',
      color: '#FF6B6B',
      isActive: true,
      sortOrder: 1,
      storeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Perakende & Alışveriş',
      description: 'Mağazalar, butikler ve perakende satış noktaları',
      icon: '🛍️',
      color: '#4ECDC4',
      isActive: true,
      sortOrder: 2,
      storeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Hizmetler',
      description: 'Berber, kuaför, tamirat ve diğer hizmetler',
      icon: '🛠️',
      color: '#45B7D1',
      isActive: true,
      sortOrder: 3,
      storeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Sağlık & Güzellik',
      description: 'Eczane, güzellik salonu ve sağlık hizmetleri',
      icon: '💊',
      color: '#96CEB4',
      isActive: true,
      sortOrder: 4,
      storeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Eğitim & Kurs',
      description: 'Özel ders, kurs ve eğitim hizmetleri',
      icon: '📚',
      color: '#FFEAA7',
      isActive: true,
      sortOrder: 5,
      storeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Diğer',
      description: 'Diğer kategorilere girmeyen işletmeler',
      icon: '📦',
      color: '#DDA0DD',
      isActive: true,
      sortOrder: 6,
      storeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  try {
    for (const category of categories) {
      const docRef = await addDoc(collection(db, 'siteCategories'), category);
      console.log(`✅ ${category.name} kategorisi oluşturuldu (ID: ${docRef.id})`);
    }

    console.log('\n🎉 Tüm site kategorileri başarıyla oluşturuldu!');
    console.log('📊 Toplam kategori sayısı:', categories.length);

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

createSampleSiteCategories();