import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { storeId, productId } = await request.json();
    if (!storeId || !productId) {
      return NextResponse.json({ error: 'Missing storeId or productId' }, { status: 400 });
    }

    const cartRef = adminDb.collection('carts').doc(userId);
    const cartSnap = await cartRef.get();
    let stores: { [key: string]: { [key: string]: number } } = {};
    if (cartSnap.exists) {
      stores = cartSnap.data()?.stores || {};
    }
    const cart = stores[storeId] || {};
    if (cart[productId] > 1) {
      cart[productId]--;
    } else {
      delete cart[productId];
    }
    stores[storeId] = cart;

    await cartRef.set({ stores }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}