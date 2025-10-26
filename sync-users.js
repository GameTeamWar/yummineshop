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

async function syncUsersToFirestore() {
  try {
    console.log('🔄 Firebase Auth\'tan Firestore\'a kullanıcı senkronizasyonu başlatılıyor...\n');

    // Firebase Auth'tan tüm kullanıcıları çek
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;

    console.log(`📊 Firebase Auth'ta toplam ${authUsers.length} kullanıcı bulundu:\n`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const user of authUsers) {
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        // Firestore'da yoksa ekle - varsayılan role ile
        const defaultRole = 4; // Customer olarak varsayalım, sonra değiştirilebilir

        await userRef.set({
          email: user.email,
          role: defaultRole,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          syncedFromAuth: true
        });

        console.log(`✅ Eklendi: ${user.email} (Role: ${defaultRole})`);
        syncedCount++;
      } else {
        console.log(`⏭️  Zaten var: ${user.email}`);
        skippedCount++;
      }
    }

    console.log(`\n🎉 Senkronizasyon tamamlandı!`);
    console.log(`📈 Eklenen kullanıcı: ${syncedCount}`);
    console.log(`📈 Zaten var olan: ${skippedCount}`);

    // Firestore'daki güncel durumu göster
    console.log('\n📋 Firestore\'daki güncel users koleksiyonu:');
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 ${data.email} | Role: ${data.role} | UID: ${doc.id}`);
    });

  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error.message);
  }
}

syncUsersToFirestore();