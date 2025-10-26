import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Firebase Admin initialize
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

async function sendPasswordResetEmail({ to, newPassword }: { to: string; newPassword: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: to,
      additionalData: {
        generatedPassword: newPassword,
        isPasswordReset: true
      },
    }),
  });
  if (!res.ok) {
    throw new Error('E-posta gönderilemedi');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, userType } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email ve yeni şifre gerekli' },
        { status: 400 }
      );
    }

    // Firebase Auth'ta kullanıcıyı bul
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      // Güvenlik için genel bir mesaj ver (email enumeration'ı önle)
      return NextResponse.json(
        { error: 'E-posta adresinizi kontrol edip tekrar deneyin. Eğer kayıtlı değilseniz, önce kayıt olmanız gerekir.' },
        { status: 404 }
      );
    }

    // Kullanıcının rolünü kontrol et (Firestore'dan)
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      // Firestore'da yoksa otomatik olarak ekle
      console.log(`🔄 Firestore'da ${email} bulunamadı, otomatik ekleniyor...`);

      const defaultRole = userType === 'customer' ? 4 : 1; // Customer için 4, Partner için 1

      await db.collection('users').doc(userRecord.uid).set({
        email: email,
        role: defaultRole,
        firstName: userRecord.displayName?.split(' ')[0] || '',
        lastName: userRecord.displayName?.split(' ').slice(1).join(' ') || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        autoCreated: true
      });

      console.log(`✅ ${email} Firestore'a eklendi (Role: ${defaultRole})`);
    }

    const userData = userDoc.exists ? userDoc.data() : { role: userType === 'customer' ? 4 : 1 };
    const userRole = userData?.role;

    // userType kontrolü (customer/partner)
    if (userType === 'customer' && userRole !== 4) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi müşteri hesabı olarak kayıtlı değil. Partner girişi mi yapmak istiyorsunuz?' },
        { status: 400 }
      );
    }
    if (userType === 'partner' && (userRole !== 1 && userRole !== 3)) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi partner hesabı olarak kayıtlı değil. Müşteri girişi mi yapmak istiyorsunuz?' },
        { status: 400 }
      );
    }

    // Firebase Auth'ta şifreyi güncelle
    await auth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    // E-posta gönder
    await sendPasswordResetEmail({ to: email, newPassword });

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı ve e-posta gönderildi'
    });

  } catch (error: any) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Şifre sıfırlama işlemi başarısız' },
      { status: 500 }
    );
  }
}