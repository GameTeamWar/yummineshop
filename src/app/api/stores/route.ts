import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Store } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = adminDb.collection('stores').where('status', '==', 'approved');

    // Kategori filtresi
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(limit).get();

    const stores: Store[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      stores.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Store);
    });

    // Arama filtresi (client-side)
    let filteredStores = stores;
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm) ||
        store.category?.toLowerCase().includes(searchTerm) ||
        store.storeType?.toLowerCase().includes(searchTerm)
      );
    }

    return NextResponse.json(filteredStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Store, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    if (!body.ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 });
    }

    const storeData = {
      ...body,
      status: 'pending', // Yeni mağazalar onay bekler
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('stores').add(storeData);

    return NextResponse.json({
      id: docRef.id,
      ...storeData,
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}