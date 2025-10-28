import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const categoryRulesSnapshot = await getDocs(collection(db, 'categoryRules'));
    const categoryRules = categoryRulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(categoryRules);
  } catch (error) {
    console.error('Kategori kuralları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori kuralları getirilemedi' },
      { status: 500 }
    );
  }
}