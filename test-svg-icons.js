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

// Test SVG URL category
const testCategory = {
  name: 'Test SVG Icon',
  icon: 'https://freesvgicons.com/wp-content/uploads/2023/03/shopping-bag-svg-icon-1.png',
  color: '#ff6b6b',
  courierCompatible: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

async function testSVGIcon() {
  try {
    const docRef = await db.collection('categories').add(testCategory);
    console.log('✅ SVG URL icon category added successfully:', docRef.id);
    console.log('Test category data:', testCategory);
  } catch (error) {
    console.error('❌ Error adding SVG URL category:', error);
  }
}

testSVGIcon();