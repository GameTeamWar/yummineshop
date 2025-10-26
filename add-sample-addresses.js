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

async function addSampleAddresses() {
  try {
    console.log('🏠 Kullanıcılara örnek adres bilgileri ekleniyor...\n');

    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.size === 0) {
      console.log('⚠️  Users koleksiyonu boş!');
      return;
    }

    // Örnek adres verileri
    const sampleAddresses = [
      {
        country: 'Türkiye',
        city: 'İstanbul',
        district: 'Kadıköy',
        neighborhood: 'Caferağa',
        street: 'Caferağa Sokak',
        buildingNo: '15',
        apartmentNo: '5',
        postalCode: '34710',
        latitude: 40.9859,
        longitude: 29.0270,
        fullAddress: 'Caferağa Sokak No: 15 Daire: 5, Caferağa, Kadıköy, İstanbul, Türkiye, PK: 34710'
      },
      {
        country: 'Türkiye',
        city: 'İstanbul',
        district: 'Beşiktaş',
        neighborhood: 'Levent',
        street: 'Büyükdere Caddesi',
        buildingNo: '123',
        apartmentNo: '12',
        postalCode: '34330',
        latitude: 41.0789,
        longitude: 29.0123,
        fullAddress: 'Büyükdere Caddesi No: 123 Daire: 12, Levent, Beşiktaş, İstanbul, Türkiye, PK: 34330'
      }
    ];

    let index = 0;
    const updatePromises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      const address = sampleAddresses[index % sampleAddresses.length];

      console.log(`📍 ${userData.email} kullanıcısına adres ekleniyor...`);
      console.log(`   Adres: ${address.fullAddress}`);

      await db.collection('users').doc(doc.id).update({
        address: address,
        displayName: userData.displayName || 'Test Kullanıcı',
        bio: userData.bio || 'Bu bir test kullanıcısıdır.',
        updatedAt: new Date()
      });

      index++;
    });

    await Promise.all(updatePromises);

    console.log('\n✅ Tüm kullanıcılara örnek adres bilgileri eklendi!');
    console.log('🔄 Şimdi check-users.js ile kontrol edebilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

addSampleAddresses();