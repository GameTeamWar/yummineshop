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

async function createTestUser() {
  try {
    // Test müşteri kullanıcısı oluştur
    const customerEmail = 'test.customer@yummine.com';
    const customerPassword = '123456';

    console.log('Test müşteri kullanıcısı oluşturuluyor...');

    const customerUser = await auth.createUser({
      email: customerEmail,
      password: customerPassword,
      displayName: 'Test Customer',
    });

    // Firestore'da müşteri bilgileri
    await db.collection('users').doc(customerUser.uid).set({
      email: customerEmail,
      role: 4, // Customer role
      firstName: 'Test',
      lastName: 'Customer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Test müşteri kullanıcısı oluşturuldu:', customerEmail);

    // Test partner kullanıcısı oluştur
    const partnerEmail = 'test.partner@yummine.com';
    const partnerPassword = '123456';

    console.log('Test partner kullanıcısı oluşturuluyor...');

    const partnerUser = await auth.createUser({
      email: partnerEmail,
      password: partnerPassword,
      displayName: 'Test Partner',
    });

    // Firestore'da partner bilgileri
    await db.collection('users').doc(partnerUser.uid).set({
      email: partnerEmail,
      role: 1, // Store partner role
      firstName: 'Test',
      lastName: 'Partner',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Test partner kullanıcısı oluşturuldu:', partnerEmail);

    console.log('\n🎯 Test kullanıcıları başarıyla oluşturuldu!');
    console.log('\nŞifre sıfırlama testi için kullanabileceğiniz email adresleri:');
    console.log('Müşteri:', customerEmail);
    console.log('Partner:', partnerEmail);
    console.log('Şifre: 123456');

  } catch (error) {
    console.error('❌ Test kullanıcısı oluşturma hatası:', error);
  }
}

createTestUser();