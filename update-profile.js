const admin = require('firebase-admin');

// Firebase Admin initialize with environment variables
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

async function updateUserProfile() {
  try {
    // yumminecom@gmail.com kullanıcısını bul
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', 'yumminecom@gmail.com').get();

    if (querySnapshot.empty) {
      console.log('Kullanıcı bulunamadı');
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    console.log('Kullanıcı bulundu:', userId);

    // Profil bilgilerini güncelle
    await db.collection('users').doc(userId).update({
      displayName: 'Yummine Admin',
      phoneNumber: '+90 555 123 4567',
      address: 'İstanbul, Türkiye',
      bio: 'Yummine platformunun yöneticisi. E-ticaret ve lojistik çözümleri konusunda uzmanım.',
      updatedAt: new Date()
    });

    console.log('✅ Kullanıcı profili güncellendi!');

    // Güncellenmiş veriyi göster
    const updatedDoc = await db.collection('users').doc(userId).get();
    console.log('Güncellenmiş profil:', updatedDoc.data());

  } catch (error) {
    console.error('❌ Profil güncelleme hatası:', error);
  }
}

updateUserProfile();