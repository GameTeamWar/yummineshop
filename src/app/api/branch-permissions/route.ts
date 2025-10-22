import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { action, mainBranchCode, subBranchEmail, subBranchName } = await request.json();

    if (!action || !mainBranchCode) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    if (action === 'request_access') {
      // Alt şube erişim talebi gönder
      if (!subBranchEmail || !subBranchName) {
        return NextResponse.json({ error: 'Alt şube bilgileri eksik' }, { status: 400 });
      }

      // Ana şubeyi bul
      const mainBranchQuery = await getDoc(doc(db, 'branch_permissions', mainBranchCode));
      if (!mainBranchQuery.exists()) {
        return NextResponse.json({ error: 'Ana şube referans kodu bulunamadı' }, { status: 404 });
      }

      const mainBranchData = mainBranchQuery.data();

      // İzin talebi ekle
      const permissionRequest = {
        id: `req_${Date.now()}`,
        subBranchEmail,
        subBranchName,
        status: 'pending',
        requestedAt: new Date(),
        mainBranchCode
      };

      await updateDoc(doc(db, 'branch_permissions', mainBranchCode), {
        permissionRequests: arrayUnion(permissionRequest)
      });

      return NextResponse.json({
        success: true,
        message: 'İzin talebi gönderildi',
        requestId: permissionRequest.id
      });

    } else if (action === 'approve_access') {
      // Ana şube izin onaylar
      const { requestId } = await request.json();

      if (!requestId) {
        return NextResponse.json({ error: 'İstek ID eksik' }, { status: 400 });
      }

      const mainBranchRef = doc(db, 'branch_permissions', mainBranchCode);
      const mainBranchDoc = await getDoc(mainBranchRef);

      if (!mainBranchDoc.exists()) {
        return NextResponse.json({ error: 'Ana şube bulunamadı' }, { status: 404 });
      }

      const mainBranchData = mainBranchDoc.data();
      const requests = mainBranchData.permissionRequests || [];

      // İsteği bul ve onayla
      const updatedRequests = requests.map((req: any) =>
        req.id === requestId ? { ...req, status: 'approved', approvedAt: new Date() } : req
      );

      await updateDoc(mainBranchRef, {
        permissionRequests: updatedRequests,
        approvedBranches: arrayUnion({
          email: requests.find((r: any) => r.id === requestId)?.subBranchEmail,
          name: requests.find((r: any) => r.id === requestId)?.subBranchName,
          approvedAt: new Date()
        })
      });

      return NextResponse.json({
        success: true,
        message: 'İzin onaylandı'
      });

    } else if (action === 'reject_access') {
      // Ana şube izin reddeder
      const { requestId } = await request.json();

      const mainBranchRef = doc(db, 'branch_permissions', mainBranchCode);
      const mainBranchDoc = await getDoc(mainBranchRef);

      if (!mainBranchDoc.exists()) {
        return NextResponse.json({ error: 'Ana şube bulunamadı' }, { status: 404 });
      }

      const mainBranchData = mainBranchDoc.data();
      const requests = mainBranchData.permissionRequests || [];

      // İsteği bul ve reddet
      const updatedRequests = requests.map((req: any) =>
        req.id === requestId ? { ...req, status: 'rejected', rejectedAt: new Date() } : req
      );

      await updateDoc(mainBranchRef, {
        permissionRequests: updatedRequests
      });

      return NextResponse.json({
        success: true,
        message: 'İzin reddedildi'
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });

  } catch (error) {
    console.error('Şube izin işlemi hatası:', error);
    return NextResponse.json({
      error: 'İşlem gerçekleştirilemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchCode = searchParams.get('branchCode');

    if (!branchCode) {
      return NextResponse.json({ error: 'Şube kodu gerekli' }, { status: 400 });
    }

    const branchDoc = await getDoc(doc(db, 'branch_permissions', branchCode));

    if (!branchDoc.exists()) {
      return NextResponse.json({ error: 'Şube bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: branchDoc.data()
    });

  } catch (error) {
    console.error('Şube bilgileri getirme hatası:', error);
    return NextResponse.json({
      error: 'Bilgiler alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}