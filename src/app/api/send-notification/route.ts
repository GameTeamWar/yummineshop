import { NextRequest, NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { initializeApp, getApps, cert } from "firebase-admin/app";

export async function POST(request: NextRequest) {
  try {
    const { to, notification, data } = await request.json();

    if (!to) {
      return NextResponse.json({ error: "FCM token gerekli" }, { status: 400 });
    }

    // Firebase Admin SDK başlatma
    if (getApps().length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID!,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
        private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL!,
        client_id: process.env.FIREBASE_CLIENT_ID!,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!
      };

      initializeApp({
        credential: cert(serviceAccount as any)
      });
    }

    const messaging = getMessaging();

    // FCM mesajı oluştur
    const message = {
      token: to,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          clickAction: notification.click_action
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    // Bildirimi gönder
    const response = await messaging.send(message);

    console.log('Bildirim başarıyla gönderildi:', {
      messageId: response,
      to: to,
      title: notification.title,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Bildirim başarıyla gönderildi",
      messageId: response
    });

  } catch (error: any) {
    console.error("Bildirim gönderme hatası:", error);

    // FCM token geçersizse
    if (error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token') {
      return NextResponse.json({
        error: "FCM token geçersiz veya kayıtlı değil",
        code: error.code
      }, { status: 400 });
    }

    return NextResponse.json({
      error: "Bildirim gönderilemedi",
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}