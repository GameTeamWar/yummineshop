const admin = require('firebase-admin');
const serviceAccount = require('./client_secret_1052179014181-aip5fkhj1nbb4ruqkc7jbiusdog7iplo.apps.googleusercontent.com.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://yummineshop-1052179014181-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function checkUserData() {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log('No users found in Firestore');
      return;
    }

    snapshot.forEach(doc => {
      console.log('User ID:', doc.id);
      console.log('User Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUserData();