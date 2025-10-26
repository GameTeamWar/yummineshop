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

async function checkUsers() {
  try {
    console.log('🔍 Users koleksiyonunu kontrol ediyorum...\n');

    const usersSnapshot = await db.collection('users').get();
    console.log('📊 Users koleksiyonunda toplam', usersSnapshot.size, 'kayıt var:\n');

    if (usersSnapshot.size === 0) {
      console.log('⚠️  Users koleksiyonu boş!');
      console.log('💡 Firebase Auth\'ta kayıtlı kullanıcılar var ama Firestore\'da users koleksiyonunda yok.');
      console.log('🔧 Bu durumda şifre sıfırlama çalışmayacak.');
      return;
    }

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 Email: ${data.email || 'N/A'} | Role: ${data.role || 'N/A'} | UID: ${doc.id}`);

      // Adres bilgilerini kontrol et
      if (data.address) {
        console.log(`   📍 Adres: ${JSON.stringify(data.address, null, 2)}`);
      } else {
        console.log(`   📍 Adres: Yok`);
      }

      // Diğer önemli alanları kontrol et
      console.log(`   📞 Telefon: ${data.phoneNumber || data.phone || 'Yok'}`);
      console.log(`   👤 Display Name: ${data.displayName || 'Yok'}`);
      console.log(`   📝 Bio: ${data.bio || 'Yok'}`);
      console.log(`   📅 Oluşturulma: ${data.createdAt ? new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt).toLocaleString('tr-TR') : 'Yok'}`);
      console.log('   ---');
    });

    console.log('\n✅ Users koleksiyonu dolu, şifre sıfırlama çalışmalı.');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkUsers();