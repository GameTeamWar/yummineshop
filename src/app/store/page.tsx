'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
}

interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  createdAt: Date;
}

interface BranchPermission {
  id: string;
  subBranchEmail: string;
  subBranchName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export default function StorePanel() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'branches'>('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    barcode: '',
  });

  // Şube yönetimi state'leri
  const [branchData, setBranchData] = useState<BranchData | null>(null);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranchCode, setNewBranchCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!user || role !== 1) {
      router.push('/');
      return;
    }

    fetchProducts();
    fetchOrders();
    fetchCategories();
    fetchBranchData();
  }, [user, role, router]);

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Category))
        .filter(cat => cat.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Kategoriler alınırken hata:', error);
    }
  };

  const fetchProducts = async () => {
    if (!user) return;
    const q = query(collection(db, 'stores'), where('ownerId', '==', user.uid));
    const storeSnapshot = await getDocs(q);
    if (!storeSnapshot.empty) {
      const storeId = storeSnapshot.docs[0].id;
      const productsSnapshot = await getDocs(collection(db, 'stores', storeId, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    const q = query(collection(db, 'stores'), where('ownerId', '==', user.uid));
    const storeSnapshot = await getDocs(q);
    if (!storeSnapshot.empty) {
      const storeId = storeSnapshot.docs[0].id;
      const ordersSnapshot = await getDocs(query(collection(db, 'orders'), where('storeId', '==', storeId)));
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
      setOrders(ordersData);
    }
  };

  const fetchBranchData = async () => {
    if (!user) return;
    try {
      // Kullanıcının mağaza bilgilerini al
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        if (userData.branchReferenceCode) {
          // Şube verilerini al
          const branchResponse = await fetch(`/api/branch-permissions?branchCode=${userData.branchReferenceCode}`);
          if (branchResponse.ok) {
            const branchData = await branchResponse.json();
            setBranchData(branchData.data);
          }
        }
      }
    } catch (error) {
      console.error('Şube verileri alınamadı:', error);
    }
  };

  const addProduct = async () => {
    if (!user) return;
    const q = query(collection(db, 'stores'), where('ownerId', '==', user.uid));
    const storeSnapshot = await getDocs(q);
    if (!storeSnapshot.empty) {
      const storeId = storeSnapshot.docs[0].id;
      await addDoc(collection(db, 'stores', storeId, 'products'), newProduct);
      setNewProduct({ name: '', description: '', price: 0, stock: 0, category: '', barcode: '' });
      setShowAddProduct(false);
      fetchProducts();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
    fetchOrders();
  };

  // Şube yönetimi fonksiyonları
  const requestBranchAccess = async () => {
    if (!newBranchCode.trim()) return;

    try {
      const response = await fetch('/api/branch-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_access',
          mainBranchCode: newBranchCode,
          subBranchEmail: user?.email,
          subBranchName: 'Alt Şube'
        })
      });

      if (response.ok) {
        alert('İzin talebi gönderildi!');
        setNewBranchCode('');
        setShowAddBranch(false);
      } else {
        alert('İzin talebi gönderilemedi!');
      }
    } catch (error) {
      console.error('İzin talebi hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const approveBranchRequest = async (requestId: string) => {
    if (!branchData) return;

    try {
      const response = await fetch('/api/branch-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_access',
          mainBranchCode: branchData.branchReferenceCode,
          requestId
        })
      });

      if (response.ok) {
        alert('İzin onaylandı!');
        fetchBranchData();
      } else {
        alert('İzin onaylanamadı!');
      }
    } catch (error) {
      console.error('İzin onaylama hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const rejectBranchRequest = async (requestId: string) => {
    if (!branchData) return;

    try {
      const response = await fetch('/api/branch-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_access',
          mainBranchCode: branchData.branchReferenceCode,
          requestId
        })
      });

      if (response.ok) {
        alert('İzin reddedildi!');
        fetchBranchData();
      } else {
        alert('İzin reddedilemedi!');
      }
    } catch (error) {
      console.error('İzin reddetme hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  // Şube referans kodunu kopyalama fonksiyonu
  const copyBranchCode = async () => {
    if (!branchData?.branchReferenceCode) return;

    try {
      await navigator.clipboard.writeText(branchData.branchReferenceCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // 2 saniye sonra geri bildirim kaybolsun
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      // Fallback olarak eski yöntem
      const textArea = document.createElement('textarea');
      textArea.value = branchData.branchReferenceCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!user || role !== 1) {
    return <div>Erişim reddedildi.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Mağaza Paneli</h1>
            <button
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-4 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Ürünler
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-4 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Siparişler
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`py-2 px-4 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'branches'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Şube Yönetimi
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Ürün Yönetimi</h2>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
                  >
                    Ürün Ekle
                  </button>
                </div>

                {showAddProduct && (
                  <div className="mb-6 bg-gray-50 p-4 rounded">
                    <h3 className="text-md font-medium mb-4">Yeni Ürün</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Ürün Adı"
                        className="border rounded px-3 py-2"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <input
                        type="text"
                        placeholder="Açıklama"
                        className="border rounded px-3 py-2"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <input
                        type="number"
                        placeholder="Fiyat"
                        className="border rounded px-3 py-2"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                      <input
                        type="number"
                        placeholder="Stok"
                        className="border rounded px-3 py-2"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      />
                      <select
                        className="border rounded px-3 py-2"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Kategori Seçin</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Barkod"
                        className="border rounded px-3 py-2"
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
                      />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={addProduct}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => setShowAddProduct(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <p className="text-lg font-semibold">₺{product.price}</p>
                      <p>Stok: {product.stock}</p>
                      <p>Kategori: {product.category}</p>
                      {product.barcode && <p>Barkod: {product.barcode}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Sipariş Yönetimi</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Sipariş #{order.id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">Toplam: ₺{order.total}</p>
                          <p className="text-sm">Durum: {order.status}</p>
                        </div>
                        <div className="space-x-2">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                              >
                                İptal
                              </button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                            >
                              Hazır
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'branches' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Şube Yönetimi</h2>
                  <button
                    onClick={() => setShowAddBranch(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 cursor-pointer"
                  >
                    Şube Ekle
                  </button>
                </div>

                {branchData && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Ana Şube Bilgileri</h3>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-blue-700">
                        <strong>Referans Kod:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">{branchData.branchReferenceCode}</code>
                      </p>
                      <button
                        onClick={copyBranchCode}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200 cursor-pointer"
                        title="Referans kodunu kopyala"
                      >
                        {copySuccess ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Kopyalandı!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Kopyala
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-blue-700">
                      <strong>Toplam Şube:</strong> {branchData.totalBranches}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Onaylanan Şubeler:</strong> {branchData.approvedBranches?.length || 0}
                    </p>
                  </div>
                )}

                {showAddBranch && (
                  <div className="mb-6 bg-gray-50 p-4 rounded">
                    <h3 className="text-md font-medium mb-4">Şube Bağlantısı</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ana Şube Referans Kodu
                        </label>
                        <input
                          type="text"
                          placeholder="BR-XXXXXXXXXXXX"
                          className="w-full border rounded px-3 py-2"
                          value={newBranchCode}
                          onChange={(e) => setNewBranchCode(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ana şubenin size verdiği referans kodunu girin
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={requestBranchAccess}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                        >
                          İzin Talebi Gönder
                        </button>
                        <button
                          onClick={() => setShowAddBranch(false)}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* İzin Talepleri */}
                {branchData?.permissionRequests && branchData.permissionRequests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">İzin Talepleri</h3>
                    <div className="space-y-4">
                      {branchData.permissionRequests.map((request) => (
                        <div key={request.id} className="border rounded p-4 bg-white">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{request.subBranchName}</p>
                              <p className="text-sm text-gray-500">{request.subBranchEmail}</p>
                              <p className="text-xs text-gray-400">
                                Talep Tarihi: {new Date(request.requestedAt).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => approveBranchRequest(request.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 cursor-pointer"
                                  >
                                    Onayla
                                  </button>
                                  <button
                                    onClick={() => rejectBranchRequest(request.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 cursor-pointer"
                                  >
                                    Reddet
                                  </button>
                                </>
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.status === 'approved' ? 'Onaylandı' :
                                 request.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Onaylanan Şubeler */}
                {branchData?.approvedBranches && branchData.approvedBranches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Onaylanan Şubeler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {branchData.approvedBranches.map((branch, index) => (
                        <div key={index} className="border rounded p-4 bg-green-50">
                          <p className="font-medium text-green-900">{branch.name}</p>
                          <p className="text-sm text-green-700">{branch.email}</p>
                          <p className="text-xs text-green-600">
                            Onay Tarihi: {new Date(branch.approvedAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!branchData?.permissionRequests || branchData.permissionRequests.length === 0) &&
                 (!branchData?.approvedBranches || branchData.approvedBranches.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz şube bağlantısı yok.</p>
                    <p className="text-sm">Şube eklemek için yukarıdaki "Şube Ekle" butonunu kullanın.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}