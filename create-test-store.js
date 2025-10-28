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

const auth = admin.auth();
const db = admin.firestore();

async function createTestStore() {
  try {
    console.log('Test mağazası oluşturuluyor...');

    // Test partner kullanıcısı oluştur
    const partnerEmail = 'test.store@yummine.com';
    const partnerPassword = '123456';

    const partnerUser = await auth.createUser({
      email: partnerEmail,
      password: partnerPassword,
      displayName: 'Test Store Owner',
    });

    // Firestore'da partner bilgileri
    await db.collection('users').doc(partnerUser.uid).set({
      email: partnerEmail,
      role: 1, // Store partner role
      firstName: 'Test',
      lastName: 'Store',
      phone: '+905332025363',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Test mağazası oluştur (İstanbul'da bir konum)
    const storeData = {
      name: 'Test Mağazası',
      ownerId: partnerUser.uid,
      ownerName: 'Test Store',
      status: 'pending',
      email: partnerEmail,
      phone: '+905332025363',
      address: 'İstanbul Kadıköy Moda Caddesi No: 123',
      category: 'retail',
      storeType: 'perakende',
      description: 'Test mağazası açıklaması',
      isActive: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),

      // Test için konum bilgileri (İstanbul Kadıköy koordinatları)
      location: {
        province: 'İstanbul',
        district: 'Kadıköy',
        neighborhood: 'Moda',
        street: 'Moda Caddesi',
        detailedAddress: 'No: 123',
        latitude: 40.9859,  // İstanbul Kadıköy yaklaşık koordinatları
        longitude: 29.0270,
      },

      // Diğer gerekli alanlar
      taxId: '1234567890',
      companyName: 'Test Şirketi Ltd. Şti.',
      corporateType: 'LIMITED',
      iban: 'TR123456789012345678901234',
      storeType: 'avm',
      branchCount: 1,
      isMainBranch: true,
      hasBranches: false,
      hasAuthorizedPersons: false,

      // Belgeler (test için boş)
      documents: {},

      // Yetkili kişiler (test için boş)
      authorizedPersons: [],
    };

    const storeRef = await db.collection('stores').add(storeData);

    console.log('✅ Test mağazası oluşturuldu!');
    console.log('Mağaza ID:', storeRef.id);
    console.log('Partner Email:', partnerEmail);
    console.log('Partner Şifre: 123456');
    console.log('Konum: İstanbul Kadıköy (40.9859, 29.0270)');

  } catch (error) {
    console.error('❌ Test mağazası oluşturma hatası:', error);
  }
}

createTestStore();