import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { StoreSettings } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const settingsRef = adminDb.collection('storeSettings');
    const snapshot = await settingsRef.where('partnerId', '==', partnerId).get();

    if (snapshot.empty) {
      // Default settings oluştur
      const defaultSettings: Omit<StoreSettings, 'id'> = {
        partnerId,
        storeName: 'Mağaza Adı',
        isOpen: true,
        workingHours: {
          monday: { open: '09:00', close: '22:00', isOpen: true },
          tuesday: { open: '09:00', close: '22:00', isOpen: true },
          wednesday: { open: '09:00', close: '22:00', isOpen: true },
          thursday: { open: '09:00', close: '22:00', isOpen: true },
          friday: { open: '09:00', close: '22:00', isOpen: true },
          saturday: { open: '09:00', close: '22:00', isOpen: true },
          sunday: { open: '09:00', close: '22:00', isOpen: true },
        },
        contactInfo: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await adminDb.collection('storeSettings').add(defaultSettings);

      return NextResponse.json({
        id: docRef.id,
        ...defaultSettings,
      });
    }

    const settings = snapshot.docs[0];
    const data = settings.data();

    return NextResponse.json({
      id: settings.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json({ error: 'Failed to fetch store settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<StoreSettings, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    if (!body.partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const settingsData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('storeSettings').add(settingsData);

    return NextResponse.json({
      id: docRef.id,
      ...settingsData,
    });
  } catch (error) {
    console.error('Error creating store settings:', error);
    return NextResponse.json({ error: 'Failed to create store settings' }, { status: 500 });
  }
}