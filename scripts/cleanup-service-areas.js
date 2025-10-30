require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

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

async function cleanupServiceAreas() {
  try {
    console.log('ServiceAreas koleksiyonunu temizleme işlemi başlatılıyor...');

    const serviceAreasRef = db.collection('serviceAreas');
    const snapshot = await serviceAreasRef.get();

    console.log(`${snapshot.size} adet doküman bulundu`);

    const deletePromises = snapshot.docs.map(async (document) => {
      console.log(`Doküman siliniyor: ${document.id}`);
      await document.ref.delete();
    });

    await Promise.all(deletePromises);
    console.log('Tüm serviceAreas dokümanları başarıyla silindi');

  } catch (error) {
    console.error('Hata oluştu:', error);
  } finally {
    process.exit(0);
  }
}

// Sadece bu dosya çalıştırıldığında çalışsın
if (require.main === module) {
  cleanupServiceAreas();
}

module.exports = { cleanupServiceAreas };