const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function inspectStores() {
  console.log('🔍 Firebase Mağaza Verilerini İnceleme...\n');

  try {
    // Mağaza koleksiyonunu çek
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    console.log(`📊 Toplam mağaza sayısı: ${storesSnapshot.size}\n`);

    if (storesSnapshot.size === 0) {
      console.log('⚠️  Mağaza koleksiyonunda hiç veri bulunamadı!\n');
      console.log('💡 Örnek mağaza verisi eklemek için öneriler:');
      console.log('   - create-test-users.js scriptini çalıştırın');
      console.log('   - Admin panelinden manuel mağaza ekleyin');
      console.log('   - Firebase Console\'dan test verisi ekleyin\n');
    }

    // Her mağazayı detaylı incele
    storesSnapshot.forEach((doc, index) => {
      const store = doc.data();
      console.log(`🏪 Mağaza ${index + 1}: ${store.name || 'İsimsiz'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Durum: ${store.status || 'pending'}`);
      console.log(`   E-posta: ${store.email || 'Yok'}`);
      console.log(`   Telefon: ${store.phone || 'Yok'}`);
      console.log(`   Vergi No: ${store.taxId || store.taxNumber || 'Yok'}`);
      console.log(`   Şirket Adı: ${store.companyName || 'Yok'}`);
      console.log(`   Adres: ${store.address || 'Yok'}`);
      
      // Konum bilgileri kontrolü
      if (store.location) {
        console.log(`   📍 Konum: Enlem ${store.location.latitude || 'Yok'}, Boylam ${store.location.longitude || 'Yok'}`);
        if (store.location.province || store.location.district) {
          console.log(`   🏛️  İl/İlçe: ${store.location.province || ''} ${store.location.district || ''}`.trim());
        }
      } else {
        console.log(`   📍 Konum: Yok`);
      }
      
      console.log(`   Site Kategorisi: ${store.siteCategory || 'Yok'}`);
      console.log(`   Mağaza Türü: ${store.storeType || 'Yok'}`);
      console.log(`   Aktif: ${store.isActive ? 'Evet' : 'Hayır'}`);

      // Düzeltme talepleri kontrolü
      if (store.correctionRequests && store.correctionRequests.length > 0) {
        console.log(`   📝 Düzeltme Talepleri: ${store.correctionRequests.length} adet`);
        store.correctionRequests.forEach((req, reqIndex) => {
          console.log(`     ${reqIndex + 1}. Alanlar: ${req.fields.join(', ')}`);
          console.log(`        Açıklama: ${req.description}`);
          console.log(`        Durum: ${req.status}`);
        });
      } else {
        console.log(`   📝 Düzeltme Talepleri: Yok`);
      }

      // Belgeler kontrolü
      if (store.documents) {
        console.log(`   📄 Belgeler: ${Object.keys(store.documents).length} adet`);
        Object.keys(store.documents).forEach(docType => {
          console.log(`     - ${docType}: ${store.documents[docType] ? 'Var' : 'Yok'}`);
        });
      } else {
        console.log(`   📄 Belgeler: Yok`);
      }

      console.log(''); // Boş satır
    });

    // Site kategorilerini kontrol et
    console.log('📂 Site Kategorilerini Kontrol Etme...\n');
    const categoriesSnapshot = await getDocs(collection(db, 'siteCategories'));

    if (categoriesSnapshot.size === 0) {
      console.log('⚠️  Site kategorileri koleksiyonunda hiç veri bulunamadı!\n');
      console.log('💡 Site kategorileri eklemek için:');
      console.log('   - Firebase Console\'dan manuel ekleyin');
      console.log('   - Admin panelinde kategori yönetim sistemi oluşturun\n');
    } else {
      console.log(`📊 Toplam kategori sayısı: ${categoriesSnapshot.size}\n`);

      categoriesSnapshot.forEach((doc, index) => {
        const category = doc.data();
        console.log(`📁 Kategori ${index + 1}: ${category.name || 'İsimsiz'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Mağaza Sayısı: ${category.storeCount || 0}`);
        console.log(`   Açıklama: ${category.description || 'Yok'}`);
        console.log('');
      });
    }

    // Özet rapor
    console.log('📋 RAPOR ÖZETİ');
    console.log('='.repeat(50));
    console.log(`Mağaza Sayısı: ${storesSnapshot.size}`);
    console.log(`Site Kategorisi Sayısı: ${categoriesSnapshot.size}`);

    const statusCounts = {};
    storesSnapshot.forEach(doc => {
      const status = doc.data().status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('Mağaza Durum Dağılımı:');
    Object.keys(statusCounts).forEach(status => {
      console.log(`  ${status}: ${statusCounts[status]}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('\n🔧 Sorun Giderme Önerileri:');
    console.log('   - Firebase güvenlik kurallarını kontrol edin');
    console.log('   - İnternet bağlantınızı kontrol edin');
    console.log('   - Firebase proje ID\'sini doğrulayın');
  }
}

inspectStores();