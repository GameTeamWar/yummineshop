import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const discounted = searchParams.get('discounted');
    const popular = searchParams.get('popular');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = adminDb.collection('products').where('isActive', '==', true);

    // Partner ID filtresi (mağaza ürünleri için)
    if (partnerId) {
      query = query.where('partnerId', '==', partnerId);
    }

    // İndirimli ürünler filtresi
    if (discounted === 'true') {
      query = query.where('originalPrice', '>', 0);
    }

    // Popüler ürünler filtresi (şimdilik rating'e göre - gerçek uygulamada view count'a göre olabilir)
    if (popular === 'true') {
      query = query.where('rating', '>=', 4.0);
    }

    // Kategori filtresi
    if (category) {
      query = query.where('categoryName', '==', category);
    }

    const snapshot = await query.limit(limit).get();

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Product);
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    if (!body.partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const productData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('products').add(productData);

    return NextResponse.json({
      id: docRef.id,
      ...productData,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, id, ...updateData } = body;

    if (!partnerId || !id) {
      return NextResponse.json({ error: 'Partner ID and Product ID required' }, { status: 400 });
    }

    const productRef = adminDb.collection('products').doc(id);

    // Check if product exists and belongs to the partner
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productData = productDoc.data();
    if (productData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date(),
    };

    await productRef.update(updatedData);

    // Get updated product
    const updatedDoc = await productRef.get();
    const updatedProductData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedProductData,
      createdAt: updatedProductData?.createdAt.toDate(),
      updatedAt: updatedProductData?.updatedAt.toDate(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}