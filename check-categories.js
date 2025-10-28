require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = {
  type: "service_account",
  project_id: "yumini-be273",
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: "firebase-adminsdk-fbsvc@yumini-be273.iam.gserviceaccount.com",
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

async function checkCategories() {
  try {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();

    console.log('Mevcut kategoriler:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`${doc.id}: ${data.name} - Icon: ${data.icon || 'YOK'}`);
    });
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

checkCategories();