'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Percent, DollarSign, ShoppingCart, Package, Calendar, Users, Search, Filter } from 'lucide-react';

interface Discount {
  id: string; // 8 haneli sayı
  name: string;
  description?: string;
  type: 'product' | 'category' | 'cart' | 'price'; // İndirim türü
  discountType: 'percentage' | 'fixed'; // Yüzde mi sabit mi
  value: number; // İndirim değeri
  conditions: {
    minAmount?: number; // Minimum sepet tutarı
    categoryIds?: string[]; // Belirli kategoriler
    productIds?: string[]; // Belirli ürünler
  };
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit?: number; // Kullanım limiti
  usedCount: number; // Kullanılan sayı
  createdAt: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Form states
  const [discountName, setDiscountName] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [discountType, setDiscountType] = useState<'product' | 'category' | 'cart' | 'price'>('cart');
  const [discountValueType, setDiscountValueType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  // Mock data - mağaza indirimleri için
  useEffect(() => {
    const mockDiscounts: Discount[] = [
      {
        id: '30000001',
        name: 'Yaz İndirimi',
        description: 'Tüm ürünlerde %20 indirim',
        type: 'cart',
        discountType: 'percentage',
        value: 20,
        conditions: {},
        isActive: true,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        usageLimit: 1000,
        usedCount: 245,
        createdAt: '2024-05-15'
      },
      {
        id: '30000002',
        name: 'Kadın Giyim %15',
        description: 'Kadın giyim kategorisinde %15 indirim',
        type: 'category',
        discountType: 'percentage',
        value: 15,
        conditions: {
          categoryIds: ['10000001']
        },
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 500,
        usedCount: 89,
        createdAt: '2024-01-10'
      },
      {
        id: '30000003',
        name: '200₺ Üzeri 25₺',
        description: '200₺ ve üzeri alışverişlerde 25₺ indirim',
        type: 'price',
        discountType: 'fixed',
        value: 25,
        conditions: {
          minAmount: 200
        },
        isActive: true,
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        usageLimit: 2000,
        usedCount: 567,
        createdAt: '2024-02-20'
      },
      {
        id: '30000004',
        name: 'Ayakkabı Kampanyası',
        description: 'Tüm ayakkabılarda %10 indirim',
        type: 'category',
        discountType: 'percentage',
        value: 10,
        conditions: {
          categoryIds: ['10000004']
        },
        isActive: true,
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        usageLimit: 300,
        usedCount: 156,
        createdAt: '2024-03-25'
      },
      {
        id: '30000005',
        name: 'Yeni Ürün İndirimi',
        description: 'Yeni sezon ürünleri %25 indirim',
        type: 'product',
        discountType: 'percentage',
        value: 25,
        conditions: {
          productIds: ['40000001', '40000002', '40000003']
        },
        isActive: false,
        startDate: '2024-09-01',
        endDate: '2024-11-30',
        usageLimit: 100,
        usedCount: 0,
        createdAt: '2024-08-15'
      },
      {
        id: '30000006',
        name: '500₺ Üzeri %5',
        description: '500₺ ve üzeri alışverişlerde %5 indirim',
        type: 'price',
        discountType: 'percentage',
        value: 5,
        conditions: {
          minAmount: 500
        },
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 5000,
        usedCount: 1234,
        createdAt: '2024-01-01'
      }
    ];

    setDiscounts(mockDiscounts);
  }, []);

  const generateDiscountId = (): string => {
    // 8 haneli benzersiz ID oluştur (3 ile başlayan)
    let id: string;
    do {
      id = '3' + Math.floor(1000000 + Math.random() * 9000000).toString();
    } while (discounts.some(disc => disc.id === id));
    return id;
  };

  const handleAddDiscount = () => {
    if (!discountName.trim() || !discountValue || !startDate || !endDate) return;

    const newDiscount: Discount = {
      id: generateDiscountId(),
      name: discountName.trim(),
      description: discountDescription.trim(),
      type: discountType,
      discountType: discountValueType,
      value: parseFloat(discountValue),
      conditions: {
        minAmount: minAmount ? parseFloat(minAmount) : undefined
      },
      isActive: true,
      startDate,
      endDate,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      usedCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDiscounts([...discounts, newDiscount]);
    closeModal();
  };

  const handleEditDiscount = () => {
    if (!editingDiscount || !discountName.trim() || !discountValue || !startDate || !endDate) return;

    const updatedDiscounts = discounts.map(disc =>
      disc.id === editingDiscount.id
        ? {
            ...disc,
            name: discountName.trim(),
            description: discountDescription.trim(),
            type: discountType,
            discountType: discountValueType,
            value: parseFloat(discountValue),
            conditions: {
              ...disc.conditions,
              minAmount: minAmount ? parseFloat(minAmount) : undefined
            },
            startDate,
            endDate,
            usageLimit: usageLimit ? parseInt(usageLimit) : undefined
          }
        : disc
    );

    setDiscounts(updatedDiscounts);
    closeModal();
  };

  const handleDeleteDiscount = (discountId: string) => {
    const updatedDiscounts = discounts.filter(disc => disc.id !== discountId);
    setDiscounts(updatedDiscounts);
  };

  const handleToggleActive = (discountId: string) => {
    const updatedDiscounts = discounts.map(disc =>
      disc.id === discountId ? { ...disc, isActive: !disc.isActive } : disc
    );
    setDiscounts(updatedDiscounts);
  };

  const openEditModal = (discount: Discount) => {
    setEditingDiscount(discount);
    setDiscountName(discount.name);
    setDiscountDescription(discount.description || '');
    setDiscountType(discount.type);
    setDiscountValueType(discount.discountType);
    setDiscountValue(discount.value.toString());
    setMinAmount(discount.conditions.minAmount?.toString() || '');
    setStartDate(discount.startDate);
    setEndDate(discount.endDate);
    setUsageLimit(discount.usageLimit?.toString() || '');
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingDiscount(null);
    setDiscountName('');
    setDiscountDescription('');
    setDiscountType('cart');
    setDiscountValueType('percentage');
    setDiscountValue('');
    setMinAmount('');
    setStartDate('');
    setEndDate('');
    setUsageLimit('');
  };

  const getFilteredDiscounts = () => {
    let filtered = discounts;

    if (searchTerm) {
      filtered = filtered.filter(disc =>
        disc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(disc => disc.type === selectedType);
    }

    return filtered;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'category':
        return <Filter className="h-4 w-4" />;
      case 'cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'price':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Percent className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Ürün İndirimi';
      case 'category':
        return 'Kategori İndirimi';
      case 'cart':
        return 'Sepet İndirimi';
      case 'price':
        return 'Fiyat İndirimi';
      default:
        return 'Diğer';
    }
  };

  const getDiscountValueDisplay = (discount: Discount) => {
    if (discount.discountType === 'percentage') {
      return `%${discount.value}`;
    } else {
      return `₺${discount.value}`;
    }
  };

  const getUsageStatus = (discount: Discount) => {
    if (!discount.usageLimit) return 'Sınırsız';
    const remaining = discount.usageLimit - discount.usedCount;
    return `${remaining} kullanım kaldı`;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isActive = (discount: Discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return discount.isActive && now >= start && now <= end;
  };

  const totalDiscounts = discounts.length;
  const activeDiscounts = discounts.filter(disc => isActive(disc)).length;
  const totalUsage = discounts.reduce((sum, disc) => sum + disc.usedCount, 0);
  const expiredDiscounts = discounts.filter(disc => isExpired(disc.endDate)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              İndirim Yönetimi
            </h1>
            <p className="mt-2 text-gray-400">
              Kampanyalarınızı ve indirimlerinizi yönetin
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            İndirim Ekle
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="İndirim ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Tipler</option>
          <option value="product">Ürün İndirimi</option>
          <option value="category">Kategori İndirimi</option>
          <option value="cart">Sepet İndirimi</option>
          <option value="price">Fiyat İndirimi</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam İndirim</p>
              <p className="text-2xl font-bold text-blue-600">{totalDiscounts}</p>
            </div>
            <Percent className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Aktif İndirimler</p>
              <p className="text-2xl font-bold text-green-600">{activeDiscounts}</p>
            </div>
            <Percent className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Kullanım</p>
              <p className="text-2xl font-bold text-purple-600">{totalUsage}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Süresi Dolan</p>
              <p className="text-2xl font-bold text-orange-600">{expiredDiscounts}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Discounts */}
      <div className="space-y-4">
        {getFilteredDiscounts().map((discount) => {
          const active = isActive(discount);
          const expired = isExpired(discount.endDate);

          return (
            <div key={discount.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    discount.type === 'product' ? 'bg-blue-600' :
                    discount.type === 'category' ? 'bg-green-600' :
                    discount.type === 'cart' ? 'bg-purple-600' :
                    'bg-orange-600'
                  }`}>
                    {getTypeIcon(discount.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${active ? 'text-white' : 'text-gray-400'}`}>
                        {discount.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        active ? 'bg-green-100 text-green-800' :
                        expired ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {active ? 'Aktif' : expired ? 'Süresi Doldu' : 'Pasif'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        discount.discountType === 'percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {getDiscountValueDisplay(discount)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{discount.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Filter className="h-4 w-4" />
                        <span>{getTypeLabel(discount.type)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(discount.startDate).toLocaleDateString('tr-TR')} - {new Date(discount.endDate).toLocaleDateString('tr-TR')}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{getUsageStatus(discount)}</span>
                      </span>
                      {discount.conditions.minAmount && (
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Min. ₺{discount.conditions.minAmount}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleActive(discount.id)}
                    className={`w-3 h-3 rounded-full ${
                      active ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={active ? 'Aktif' : 'Pasif'}
                  />
                  <button
                    onClick={() => openEditModal(discount)}
                    className="p-2 text-blue-600 hover:text-blue-400 transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDiscount(discount.id)}
                    className="p-2 text-red-600 hover:text-red-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>ID: {discount.id}</span>
                  <span>Oluşturulma: {new Date(discount.createdAt).toLocaleDateString('tr-TR')}</span>
                  <span>Kullanım: {discount.usedCount} kez</span>
                </div>
              </div>
            </div>
          );
        })}

        {getFilteredDiscounts().length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <Percent className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">
              {searchTerm || selectedType !== 'all' ? 'Aramanızla eşleşen indirim bulunamadı' : 'Henüz indirim yok'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all' ? 'Farklı bir arama terimi deneyin' : 'İlk indiriminizi eklemek için yukarıdaki butona tıklayın.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Discount Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingDiscount ? 'İndirimi Düzenle' : 'Yeni İndirim Ekle'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  İndirim Adı *
                </label>
                <input
                  type="text"
                  value={discountName}
                  onChange={(e) => setDiscountName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İndirim adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={discountDescription}
                  onChange={(e) => setDiscountDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İndirim açıklaması (opsiyonel)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Türü
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'product' | 'category' | 'cart' | 'price')}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cart">Sepet İndirimi</option>
                    <option value="category">Kategori İndirimi</option>
                    <option value="product">Ürün İndirimi</option>
                    <option value="price">Fiyat İndirimi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Şekli
                  </label>
                  <select
                    value={discountValueType}
                    onChange={(e) => setDiscountValueType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Değeri *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="0"
                    step={discountValueType === 'percentage' ? '1' : '0.01'}
                    max={discountValueType === 'percentage' ? '100' : undefined}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={discountValueType === 'percentage' ? '20' : '25.00'}
                  />
                </div>
                {(discountType === 'price' || discountType === 'cart') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min. Sepet Tutarı (₺)
                    </label>
                    <input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="200.00"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanım Limiti
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sınırsız için boş bırakın"
                />
              </div>

              {editingDiscount && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Percent className="h-4 w-4" />
                    <span>İndirim ID: {editingDiscount.id}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={editingDiscount ? handleEditDiscount : handleAddDiscount}
                disabled={!discountName.trim() || !discountValue || !startDate || !endDate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingDiscount ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}