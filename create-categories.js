require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Firebase Admin SDK konfigürasyonu
const serviceAccount = {
  type: "service_account",
  project_id: "yumini-be273",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: "firebase-adminsdk-fbsvc@yumini-be273.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40yumini-be273.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://yumini-be273-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// Temel kategoriler
const categoriesData = [
  {
    id: 'giyim',
    name: 'Giyim',
    icon: 'shirt',
    color: '#FF6B6B',
    hasSubcategories: false,
    sortOrder: 1,
    subcategories: []
  },
  {
    id: 'elektronik',
    name: 'Elektronik',
    icon: 'laptop',
    color: '#4ECDC4',
    hasSubcategories: false,
    sortOrder: 2,
    subcategories: []
  },
  {
    id: 'ev-yasam',
    name: 'Ev & Yaşam',
    icon: 'home',
    color: '#45B7D1',
    hasSubcategories: false,
    sortOrder: 3,
    subcategories: []
  },
  {
    id: 'kozmetik',
    name: 'Kozmetik',
    icon: 'sparkles',
    color: '#F7DC6F',
    hasSubcategories: false,
    sortOrder: 4,
    subcategories: []
  },
  {
    id: 'spor',
    name: 'Spor',
    icon: 'dumbbell',
    color: '#BB8FCE',
    hasSubcategories: false,
    sortOrder: 5,
    subcategories: []
  },
  {
    id: 'kitap',
    name: 'Kitap',
    icon: 'book',
    color: '#85C1E9',
    hasSubcategories: false,
    sortOrder: 6,
    subcategories: []
  },
  {
    id: 'oyuncak',
    name: 'Oyuncak',
    icon: 'puzzle',
    color: '#F8C471',
    hasSubcategories: false,
    sortOrder: 7,
    subcategories: []
  },
  {
    id: 'yiyecek',
    name: 'Yiyecek',
    icon: 'utensils',
    color: '#82E0AA',
    hasSubcategories: false,
    sortOrder: 8,
    subcategories: []
  }
];

// Kategorileri Firebase'e ekle
async function createCategories() {
  try {
    console.log('Kategoriler oluşturuluyor...');

    const batch = db.batch();

    categoriesData.forEach(category => {
      const docRef = db.collection('categories').doc(category.id);
      batch.set(docRef, {
        ...category,
        productCount: 0,
        isActive: true,
        filterType: 'checkbox',
        hasSearch: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        partnerId: 'admin'
      });
    });

    await batch.commit();

    console.log(`${categoriesData.length} kategori başarıyla eklendi!`);
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
  }
}

createCategories();