'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Tag, Filter, FolderOpen, Settings, Search, Upload, Image as ImageIcon, Star, TrendingUp, Clock, Zap, ScanLine } from 'lucide-react';

interface Product {
  id: string; // 8 haneli sayı
  name: string;
  price: number;
  originalPrice?: number; // İndirimli ürünler için
  category: string;
  categoryId: string; // Kategori ID'si
  options: string[]; // Opsiyon ID'leri
  tags: string[]; // Etiket ID'leri
  filters: string[]; // Filtre ID'leri
  image?: string;
  images: string[]; // Çoklu resim desteği
  description?: string;
  stock: number; // Stok miktarı
  sku?: string; // Stok kodu
  weight?: number; // Ağırlık (gram)
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  material?: string; // Malzeme
  brand?: string; // Marka
  isActive: boolean;
  isFeatured: boolean; // Öne çıkan ürün
  isNew: boolean; // Yeni ürün
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  totalProducts: number;
  totalValue: number;
  activeProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalOptions: number;
  totalTags: number;
  totalFilters: number;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalValue: 0,
    activeProducts: 0,
    featuredProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    totalOptions: 0,
    totalTags: 0,
    totalFilters: 0
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form states
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productSKU, setProductSKU] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [productMaterial, setProductMaterial] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Mock data - mağaza ürünleri için
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '10000001',
        name: 'Kadın Kot Pantolon',
        price: 299,
        originalPrice: 399,
        category: 'Kadın Giyim',
        categoryId: '20000001',
        options: ['30000001', '30000002', '30000003'], // Renk, beden, model
        tags: ['50000001', '50000002'], // En Çok Satan, Yeni Sezon
        filters: ['40000001', '40000002'], // Kadın, Kot
        images: [],
        description: 'Rahat kesim kot pantolon, yüksek bel, dar paça',
        stock: 25,
        sku: 'KP001',
        weight: 450,
        material: 'Pamuk',
        brand: 'Yummine',
        isActive: true,
        isFeatured: true,
        isNew: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '10000002',
        name: 'Erkek Spor Ayakkabı',
        price: 599,
        category: 'Erkek Giyim',
        categoryId: '20000002',
        options: ['30000004', '30000005'], // Renk, numara
        tags: ['50000003'], // İndirim
        filters: ['40000003', '40000004'], // Erkek, Spor
        images: [],
        description: 'Konforlu koşu ayakkabısı, nefes alan malzemeden',
        stock: 12,
        sku: 'EA002',
        weight: 320,
        material: 'Sentetik',
        brand: 'SportMax',
        isActive: true,
        isFeatured: false,
        isNew: true,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-18'
      },
      {
        id: '10000003',
        name: 'Kadın Çanta',
        price: 189,
        originalPrice: 249,
        category: 'Aksesuar',
        categoryId: '20000003',
        options: ['30000006'], // Renk
        tags: ['50000004'], // Sınırlı Stok
        filters: ['40000005', '40000006'], // Kadın, Çanta
        images: [],
        description: 'Şık dizayn omuz çantası, deri görünümlü',
        stock: 3,
        sku: 'CC003',
        weight: 280,
        material: 'PU Deri',
        brand: 'FashionBag',
        isActive: true,
        isFeatured: true,
        isNew: false,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-22'
      },
      {
        id: '10000004',
        name: 'Erkek Gömlek',
        price: 149,
        category: 'Erkek Giyim',
        categoryId: '20000002',
        options: ['30000007', '30000008'], // Renk, beden
        tags: ['50000005'], // Premium Kalite
        filters: ['40000003', '40000007'], // Erkek, Gömlek
        images: [],
        description: 'Klasik fit gömlek, uzun kollu, pamuklu',
        stock: 0,
        sku: 'EG004',
        weight: 220,
        material: 'Pamuk',
        brand: 'ClassicWear',
        isActive: false,
        isFeatured: false,
        isNew: false,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19'
      },
      {
        id: '10000005',
        name: 'Kadın Elbise',
        price: 349,
        category: 'Kadın Giyim',
        categoryId: '20000001',
        options: ['30000009', '30000010'], // Renk, beden
        tags: ['50000006'], // Trend Ürün
        filters: ['40000001', '40000008'], // Kadın, Elbise
        images: [],
        description: 'Şık midi elbise, çiçek desenli, yazlık',
        stock: 8,
        sku: 'KE005',
        weight: 180,
        material: 'Viskon',
        brand: 'SummerStyle',
        isActive: true,
        isFeatured: false,
        isNew: true,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      }
    ];

    setProducts(mockProducts);
    calculateStats(mockProducts);
  }, []);

  const generateProductId = (): string => {
    // 8 haneli benzersiz ID oluştur (1 ile başlayan)
    let id: string;
    do {
      id = '1' + Math.floor(1000000 + Math.random() * 9000000).toString();
    } while (products.some(product => product.id === id));
    return id;
  };

  const calculateStats = (productList: Product[]) => {
    const totalProducts = productList.length;
    const totalValue = productList.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const activeProducts = productList.filter(p => p.isActive).length;
    const featuredProducts = productList.filter(p => p.isFeatured).length;
    const lowStockProducts = productList.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockProducts = productList.filter(p => p.stock === 0).length;

    // Benzersiz kategoriler, opsiyonlar, etiketler ve filtreler
    const allCategories = new Set(productList.map(p => p.categoryId));
    const allOptions = new Set(productList.flatMap(p => p.options));
    const allTags = new Set(productList.flatMap(p => p.tags));
    const allFilters = new Set(productList.flatMap(p => p.filters));

    setStats({
      totalProducts,
      totalValue,
      activeProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCategories: allCategories.size,
      totalOptions: allOptions.size,
      totalTags: allTags.size,
      totalFilters: allFilters.size
    });
  };

  const handleAddProduct = () => {
    if (!productName.trim() || !productPrice || !productCategory) return;

    const newProduct: Product = {
      id: generateProductId(),
      name: productName.trim(),
      price: parseFloat(productPrice),
      originalPrice: productOriginalPrice ? parseFloat(productOriginalPrice) : undefined,
      category: productCategory,
      categoryId: productCategory, // Şimdilik aynı
      options: selectedOptions,
      tags: selectedTags,
      filters: selectedFilters,
      images: productImages,
      description: productDescription.trim(),
      stock: parseInt(productStock) || 0,
      sku: productSKU.trim(),
      weight: productWeight ? parseFloat(productWeight) : undefined,
      material: productMaterial.trim(),
      brand: productBrand.trim(),
      isActive: true,
      isFeatured,
      isNew,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    calculateStats(updatedProducts);
    closeModal();
  };

  const handleEditProduct = () => {
    if (!editingProduct || !productName.trim() || !productPrice || !productCategory) return;

    const updatedProducts = products.map(product =>
      product.id === editingProduct.id
        ? {
            ...product,
            name: productName.trim(),
            price: parseFloat(productPrice),
            originalPrice: productOriginalPrice ? parseFloat(productOriginalPrice) : undefined,
            category: productCategory,
            categoryId: productCategory,
            options: selectedOptions,
            tags: selectedTags,
            filters: selectedFilters,
            images: productImages,
            description: productDescription.trim(),
            stock: parseInt(productStock) || 0,
            sku: productSKU.trim(),
            weight: productWeight ? parseFloat(productWeight) : undefined,
            material: productMaterial.trim(),
            brand: productBrand.trim(),
            isFeatured,
            isNew,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : product
    );

    setProducts(updatedProducts);
    calculateStats(updatedProducts);
    closeModal();
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    calculateStats(updatedProducts);
  };

  const handleToggleActive = (productId: string) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(updatedProducts);
    calculateStats(updatedProducts);
  };

  const handleToggleFeatured = (productId: string) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setProducts(updatedProducts);
    calculateStats(updatedProducts);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductOriginalPrice(product.originalPrice?.toString() || '');
    setProductCategory(product.categoryId);
    setProductDescription(product.description || '');
    setProductStock(product.stock.toString());
    setProductSKU(product.sku || '');
    setProductWeight(product.weight?.toString() || '');
    setProductMaterial(product.material || '');
    setProductBrand(product.brand || '');
    setProductImages(product.images);
    setSelectedOptions(product.options);
    setSelectedTags(product.tags);
    setSelectedFilters(product.filters);
    setIsFeatured(product.isFeatured);
    setIsNew(product.isNew);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setIsBarcodeScannerOpen(false);
    setProductName('');
    setProductPrice('');
    setProductOriginalPrice('');
    setProductCategory('');
    setProductDescription('');
    setProductStock('');
    setProductSKU('');
    setProductWeight('');
    setProductMaterial('');
    setProductBrand('');
    setProductImages([]);
    setSelectedOptions([]);
    setSelectedTags([]);
    setSelectedFilters([]);
    setIsFeatured(false);
    setIsNew(false);
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    return filtered;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    subtitle?: string;
    onClick?: () => void;
  }) => (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color.replace('text-', 'text-').replace('-600', '-500')}`} />
      </div>
    </div>
  );

  const filteredProducts = getFilteredProducts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Ürün Yönetimi
            </h1>
            <p className="mt-2 text-gray-400">
              Mağaza ürünlerinizi ekleyin, düzenleyin ve yönetin
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ürün Ekle
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Mağaza Kategorileri</option>
          <option value="20000001">Kadın Giyim</option>
          <option value="20000002">Erkek Giyim</option>
          <option value="20000003">Aksesuar</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={Package}
          color="text-blue-600"
        />
        <StatCard
          title="Aktif Ürünler"
          value={stats.activeProducts}
          icon={Star}
          color="text-green-600"
        />
        <StatCard
          title="Öne Çıkan"
          value={stats.featuredProducts}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          title="Düşük Stok"
          value={stats.lowStockProducts}
          icon={Clock}
          color="text-orange-600"
          subtitle="5 ve altında"
        />
        <StatCard
          title="Stokta Yok"
          value={stats.outOfStockProducts}
          icon={Zap}
          color="text-red-600"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Değer"
          value={`₺${stats.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="text-emerald-600"
        />
        <StatCard
          title="Mağaza Kategorileri"
          value={stats.totalCategories}
          icon={FolderOpen}
          color="text-indigo-600"
          onClick={() => window.location.href = '/partner/123/categories'}
        />
        <StatCard
          title="Opsiyonlar"
          value={stats.totalOptions}
          icon={Settings}
          color="text-orange-600"
          onClick={() => window.location.href = '/partner/123/options'}
        />
        <StatCard
          title="Etiketler"
          value={stats.totalTags}
          icon={Tag}
          color="text-pink-600"
          onClick={() => window.location.href = '/partner/123/tags'}
        />
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Ürünler ({filteredProducts.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {searchTerm && `Arama: "${searchTerm}"`}
                {selectedCategory && `Kategori: ${selectedCategory}`}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Mağaza Kategorisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Özellikler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.images[0]}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-600 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white flex items-center">
                          {product.name}
                          {product.isNew && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Yeni
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          SKU: {product.sku} • ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      ₺{product.price}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          ₺{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= 5
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock === 0 ? 'Stok Yok' : product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {product.isFeatured && (
                        <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Öne Çıkan
                        </span>
                      )}
                      {product.tags.length > 0 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {product.tags.length} etiket
                        </span>
                      )}
                      {product.options.length > 0 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {product.options.length} opsiyon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(product.id)}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(product.id)}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.isFeatured
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isFeatured ? 'Öne Çıkan' : 'Normal'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-400 p-1 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-400 p-1 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">
              {searchTerm || selectedCategory ? 'Aramanızla eşleşen ürün bulunamadı' : 'Henüz ürün yok'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory ? 'Farklı kriterlerle tekrar deneyin' : 'İlk ürününüzü eklemek için yukarıdaki butona tıklayın.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              {/* Anlık Önizleme - Sol taraf */}
              <div className="bg-gray-750 border border-gray-600 rounded-lg p-6 max-w-md mr-6">
                <h4 className="text-sm font-medium text-gray-300 mb-4">Mağaza Görünümü</h4>
                <div className="bg-gray-800 border border-gray-600 rounded-2xl overflow-hidden">
                  {/* Ürün Görseli */}
                  <div className="h-40 relative overflow-hidden bg-linear-to-br from-gray-700 to-gray-600">
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[0]}
                        alt="Ürün görseli"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/70 text-white">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      4.5
                    </div>

                    {/* Store Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-900/80 text-white">
                      Yummine
                    </div>

                    {/* Featured Badge */}
                    {isFeatured && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-black">
                        Öne Çıkan
                      </div>
                    )}

                    {/* New Badge */}
                    {isNew && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                        Yeni
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 text-white">
                      {productName || 'Ürün Adı'}
                    </h3>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          ₺{productPrice || '0'}
                        </span>
                        {productOriginalPrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">
                            ₺{productOriginalPrice}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        12 yorum
                      </div>
                    </div>

                    {/* Özellikler */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Mağaza: {productCategory ? productCategory : 'Seçilmemiş'}</span>
                      {productStock && (
                        <>
                          <span>•</span>
                          <span>Stok: {productStock}</span>
                        </>
                      )}
                    </div>

                    {/* Ek Görseller Göstergesi */}
                    {productImages.length > 1 && (
                      <div className="mt-2 flex gap-1">
                        {productImages.slice(1, 4).map((_, index) => (
                          <div key={index} className="w-6 h-6 bg-gray-600 rounded overflow-hidden">
                            <img
                              src={productImages[index + 1]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {productImages.length > 4 && (
                          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">
                            +{productImages.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Başlık ve Açıklama - Sağ taraf */}
              <div className="flex-1 text-right">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <p className="text-gray-400 text-sm">Ürün bilgilerini doldurun ve mağaza kategorisine ekleyin</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Ana Bilgiler */}
              <div className="xl:col-span-2 space-y-4">
                {/* Basic Info */}
                <div className="bg-gray-750 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Temel Bilgiler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Ürün Adı *
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ürün adını girin"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Mağaza Kategorisi * (Max 3 kategori)
                      </label>
                      <select
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Mağaza kategorisi seçin</option>
                        <option value="20000001">Kadın Giyim</option>
                        <option value="20000002">Erkek Giyim</option>
                        <option value="20000003">Aksesuar</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-0.5">Ürün birden fazla mağaza kategorisinde bulunabilir</p>
                    </div>
                  </div>
                </div>

                {/* Fiyat ve Stok */}
                <div className="bg-gray-750 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Fiyat ve Stok</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Satış Fiyatı (₺) *
                      </label>
                      <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Orijinal Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        value={productOriginalPrice}
                        onChange={(e) => setProductOriginalPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="İndirim öncesi fiyat"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stok Miktarı *
                      </label>
                      <input
                        type="number"
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Detay Bilgiler */}
                <div className="bg-gray-750 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Detay Bilgiler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SKU Kodu
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={productSKU}
                          onChange={(e) => setProductSKU(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Stok kodu"
                        />
                        <button
                          type="button"
                          onClick={() => setIsBarcodeScannerOpen(true)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
                          title="Barkod/QR Kod Tara"
                        >
                          <ScanLine className="h-4 w-4" />
                          Tara
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ağırlık (gram)
                      </label>
                      <input
                        type="number"
                        value={productWeight}
                        onChange={(e) => setProductWeight(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Marka
                      </label>
                      <input
                        type="text"
                        value={productBrand}
                        onChange={(e) => setProductBrand(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Marka adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Malzeme
                      </label>
                      <input
                        type="text"
                        value={productMaterial}
                        onChange={(e) => setProductMaterial(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Malzeme bilgisi"
                      />
                    </div>
                  </div>
                </div>

                {/* Açıklama */}
                <div className="bg-gray-750 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Ürün Açıklaması</h4>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ürün açıklaması"
                  />
                </div>

                {/* Özellikler */}
                <div className="bg-gray-750 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Ürün Özellikleri</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-300">Öne çıkan ürün (ana sayfada gösterilir)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isNew}
                        onChange={(e) => setIsNew(e.target.checked)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-300">Yeni ürün (yenilik etiketi gösterilir)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Görseller */}
              <div className="space-y-4 -mt-82">
                <div className="bg-gray-750 rounded-lg p-6">
                 
                  <div className="space-y-4">
                    {/* Uploaded Images Preview */}
                    {productImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {productImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Ürün görseli ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-600"
                            />
                            <button
                              onClick={() => {
                                const newImages = productImages.filter((_, i) => i !== index);
                                setProductImages(newImages);
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Görseli kaldır"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                     <h4 className="text-lg font-medium text-white mb-3">Ürün Görselleri</h4>
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                              alert(`${file.name} dosyası çok büyük. Maksimum 5MB olabilir.`);
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) {
                                setProductImages(prev => [...prev, result]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                          // Reset input
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 hover:text-gray-300 transition-colors" />
                        <p className="mt-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                          Görsel seçmek için tıklayın
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, WEBP • Max 5MB
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {editingProduct && (
                  <div className="bg-gray-750 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Ürün Bilgileri</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Package className="h-3 w-3" />
                        <span>Ürün ID: {editingProduct.id}</span>
                      </div>
                      <div>Oluşturulma: {editingProduct.createdAt}</div>
                      <div>Güncellenme: {editingProduct.updatedAt}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={closeModal}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                disabled={!productName.trim() || !productPrice || !productCategory}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {editingProduct ? 'Ürünü Kaydet' : 'Ürünü Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isBarcodeScannerOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">SKU Kod Okuyucu</h3>
              <button
                onClick={() => setIsBarcodeScannerOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <ScanLine className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-300 mb-2">Kamera erişimi bekleniyor...</p>
                <p className="text-sm text-gray-500">
                  Barkod veya QR kodunuzu kameraya gösterin
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Veya manuel giriş yapın
                </label>
                <input
                  type="text"
                  placeholder="SKU kodunu girin"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        setProductSKU(value);
                        setIsBarcodeScannerOpen(false);
                      }
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsBarcodeScannerOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    // Simülasyon için rastgele SKU kodu oluştur
                    const randomSKU = 'SKU' + Math.random().toString(36).substr(2, 8).toUpperCase();
                    setProductSKU(randomSKU);
                    setIsBarcodeScannerOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Test Kodu Tara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}