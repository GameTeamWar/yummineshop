require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Firebase Admin initialize
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function createSampleCategories() {
  try {
    console.log('Örnek kategoriler oluşturuluyor...');

    const categories = [
      {
        name: 'Elektronik',
        description: 'Bilgisayar, telefon, tablet ve elektronik ürünler',
        icon: 'laptop',
        color: '#3B82F6',
        isActive: true,
        deliverable: true,
        sortOrder: 1,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Ayakkabı & Çanta',
        description: 'Kadın, erkek ve çocuk ayakkabıları, çantalar',
        icon: 'shopping-bag',
        color: '#10B981',
        isActive: true,
        deliverable: true,
        sortOrder: 2,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Bahçe & Yapı Market & Hırdavat & Otomotiv',
        description: 'Bahçe malzemeleri, yapı market ürünleri, hırdavat ve otomotiv ürünleri',
        icon: 'wrench',
        color: '#F59E0B',
        isActive: true,
        deliverable: false, // Ağır ürünler, kurye ile taşınamaz
        sortOrder: 3,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Kitap & Kırtasiye & Oyuncak & Anne ve Çocuk Ürünleri',
        description: 'Kitaplar, kırtasiye malzemeleri, oyuncaklar ve anne-çocuk ürünleri',
        icon: 'book',
        color: '#8B5CF6',
        isActive: true,
        deliverable: true,
        sortOrder: 4,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Tekstil',
        description: 'Kadın, erkek ve çocuk giyim ürünleri',
        icon: 'shirt',
        color: '#EF4444',
        isActive: true,
        deliverable: true,
        sortOrder: 5,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Kozmetik',
        description: 'Makyaj ürünleri, parfüm, cilt bakım ürünleri',
        icon: 'sparkles',
        color: '#EC4899',
        isActive: true,
        deliverable: true,
        sortOrder: 6,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Mobilya',
        description: 'Ev ve ofis mobilyaları',
        icon: 'home',
        color: '#6B7280',
        isActive: true,
        deliverable: false, // Büyük mobilya ürünleri kurye ile taşınamaz
        sortOrder: 7,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Süpermarket & Petshop & Sağlık',
        description: 'Gıda ürünleri, petshop ürünleri ve sağlık ürünleri',
        icon: 'shopping-cart',
        color: '#059669',
        isActive: true,
        deliverable: true,
        sortOrder: 8,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Ev Tekstil & Dekorasyon & Mutfak',
        description: 'Çarşaf, perde, ev dekorasyonu ve mutfak ürünleri',
        icon: 'chef-hat',
        color: '#DC2626',
        isActive: true,
        deliverable: true,
        sortOrder: 9,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        name: 'Aksesuar & Saat & Gözlük',
        description: 'Takı, saat, gözlük ve kişisel aksesuarlar',
        icon: 'watch',
        color: '#7C3AED',
        isActive: true,
        deliverable: true,
        sortOrder: 10,
        storeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    // Önce mevcut kategorileri temizle
    const existingCategories = await db.collection('siteCategories').get();
    const deletePromises = existingCategories.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    console.log('Mevcut kategoriler temizlendi');

    // Yeni kategorileri ekle
    const addPromises = categories.map(category =>
      db.collection('siteCategories').add(category)
    );

    await Promise.all(addPromises);

    console.log('✅ Örnek kategoriler başarıyla oluşturuldu!');
    console.log(`📊 ${categories.length} kategori eklendi`);

    // Kategorileri listele
    categories.forEach((cat, index) => {
      const deliverableText = cat.deliverable ? '✅ Kurye ile teslim edilebilir' : '❌ Kurye ile teslim edilemez';
      console.log(`${index + 1}. ${cat.name} - ${deliverableText}`);
    });

  } catch (error) {
    console.error('❌ Kategori oluşturma hatası:', error);
  }
}

createSampleCategories();