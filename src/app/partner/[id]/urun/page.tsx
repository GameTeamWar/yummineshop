'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Package, DollarSign, Tag, Filter, FolderOpen, Settings, Search, Upload, Image as ImageIcon, Star, TrendingUp, Clock, Zap, ScanLine } from 'lucide-react';
import { Product, Category, Option, Tag as TagType } from '@/types';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

// Kategori verilerini içe aktar

// Yardımcı fonksiyonlar
const getSubCategoriesForMainCategory = (mainCategoryId: string, storeCategories: any[]) => {
  const mainCategory = storeCategories.find(cat => cat.id === mainCategoryId);
  if (!mainCategory || !mainCategory.childCategories) return [];
  
  return storeCategories.filter(cat => mainCategory.childCategories!.includes(cat.id));
};

const getProductCategoriesForSubCategory = (subCategoryId: string, storeCategories: any[]) => {
  const subCategory = storeCategories.find(cat => cat.id === subCategoryId);
  if (!subCategory || !subCategory.productCategories) return [];
  
  return subCategory.productCategories;
};

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
  const params = useParams();
  const partnerId = params.id as string;
  const { getAuthHeaders, user, getProfile } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeMainCategory, setStoreMainCategory] = useState<string>(''); // Mağaza ana kategorisi
  const [options, setOptions] = useState<Option[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [showStockZeroDialog, setShowStockZeroDialog] = useState(false);
  const [pendingProductData, setPendingProductData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form states
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState(''); // Alt kategori (kadın giyim, erkek giyim vb.)
  const [selectedProductCategory, setSelectedProductCategory] = useState(''); // Ürün kategorisi (üst giyim, alt giyim vb.)
  const [productDescription, setProductDescription] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productSKU, setProductSKU] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [productMaterial, setProductMaterial] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [storeNotFound, setStoreNotFound] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // storeMainCategory değiştiğinde log ekle
  useEffect(() => {
    console.log('storeMainCategory changed:', storeMainCategory);
    console.log('categories:', categories);
  }, [storeMainCategory, categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is accessing their own store
        if (!user) {
          console.error('User not logged in');
          toast.error('Lütfen önce giriş yapın');
          return;
        }

        if (user.uid !== partnerId) {
          console.error('User is not authorized to access this store:', { userId: user.uid, partnerId });
          toast.error('Bu mağazaya erişim yetkiniz yok');
          return;
        }

        const profile = getProfile();
        console.log('User profile:', profile);
        console.log('User storeId:', profile?.storeId);

        // Ürünleri çek
        const productsRes = await fetch(`/api/products?partnerId=${partnerId}`);
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Mağaza bilgilerini çek (ana kategoriler için)
        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          console.error('No authorization token found');
          setCategories([]);
          setStoreMainCategory('');
          return;
        }

        try {
          const storeRes = await fetch(`/api/stores/${partnerId}`, {
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            }
          });

          if (!storeRes.ok) {
            if (storeRes.status === 404) {
              console.error('Store not found for user:', partnerId);
              setCategories([]);
              setStoreMainCategory('');
              setStoreNotFound(true);
              toast.error('Mağaza bulunamadı. Mağaza kaydınız henüz onaylanmamış olabilir.');
              return;
            }
            console.error('Store API error:', storeRes.status, storeRes.statusText);
            setCategories([]);
            setStoreMainCategory('');
            return;
          }

          const storeData = await storeRes.json();
          console.log('Store data:', storeData);
          console.log('Store categories:', storeData.categories);
          console.log('Store categories type:', typeof storeData.categories);
          console.log('Store categories length:', storeData.categories?.length);

          // Mağaza kategorilerini kullan
          if (storeData.categories && Array.isArray(storeData.categories) && storeData.categories.length > 0) {
            console.log('Setting categories:', storeData.categories);
            setCategories(storeData.categories);
            // Mağaza ana kategorisini belirle (ilk seçilen kategori)
            const firstCategory = storeData.categories[0];
            console.log('First category:', firstCategory);
            if (firstCategory && firstCategory.id) {
              setStoreMainCategory(firstCategory.id);
              console.log('Setting store main category to:', firstCategory.id);
            } else {
              console.error('First category has no id:', firstCategory);
              setStoreMainCategory('');
            }
          } else {
            console.log('No categories found, setting empty');
            // Eğer mağaza kategorisi yoksa boş array kullan
            setCategories([]);
            setStoreMainCategory('');
          }
        } catch (error) {
          console.error('Error fetching store data:', error);
          setCategories([]);
          setStoreMainCategory('');
        }

        // Opsiyonları çek
        const optionsRes = await fetch(`/api/options?partnerId=${partnerId}`);
        const optionsData = await optionsRes.json();
        setOptions(optionsData);

        // Etiketleri çek
        const tagsRes = await fetch(`/api/tags?partnerId=${partnerId}`);
        const tagsData = await tagsRes.json();
        setTags(tagsData);

        calculateStats(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId && user) {
      fetchData();
    }
  }, [partnerId, user?.uid, getProfile]);

  const calculateStats = (productList: Product[]) => {
    const totalProducts = productList.length;
    const totalValue = productList.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const activeProducts = productList.filter(p => p.isActive).length;
    const featuredProducts = productList.filter(p => p.isFeatured).length;
    const lowStockProducts = productList.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockProducts = productList.filter(p => p.stock === 0).length;

    // Benzersiz kategoriler, opsiyonlar, etiketler
    const allCategories = new Set(productList.map(p => p.categoryId));
    const allOptions = new Set(productList.flatMap(p => p.options));
    const allTags = new Set(productList.flatMap(p => p.tags));

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
      totalFilters: 0 // Artık filters yok
    });
  };

  const handleAddProduct = async () => {
    console.log('handleAddProduct called with:', {
      productName,
      productPrice,
      storeMainCategory,
      selectedSubCategory,
      selectedProductCategory,
      productStock,
      partnerId
    });

    // Daha detaylı validation
    if (!productName.trim()) {
      toast.error('Ürün adı zorunludur!');
      return;
    }

    if (!productPrice || isNaN(parseFloat(productPrice)) || parseFloat(productPrice) <= 0) {
      toast.error('Geçerli bir fiyat giriniz!');
      return;
    }

    if (!selectedProductCategory) {
      toast.error('Ürün kategorisi seçiniz!');
      return;
    }

    if (!productStock || isNaN(parseInt(productStock)) || parseInt(productStock) < 0) {
      toast.error('Geçerli bir stok miktarı giriniz!');
      return;
    }

    try {
      const category = categories.find(c => c.id === storeMainCategory);
      if (!category) {
        console.error('Category not found:', storeMainCategory);
        toast.error('Mağaza ana kategorisi bulunamadı!');
        return;
      }

      const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: productName.trim(),
        price: parseFloat(productPrice),
        categoryId: selectedProductCategory, // Ürün kategorisini kullan
        categoryName: category.name,
        options: selectedOptions,
        tags: selectedTags,
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
        partnerId
      };

      console.log('Sending product data:', newProduct);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const createdProduct = await response.json();
        console.log('Created product:', createdProduct);
        const updatedProducts = [...products, createdProduct];
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        closeModal();
        toast.success('Ürün başarıyla eklendi!');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        toast.error(`Ürün eklenirken hata oluştu: ${errorData.error || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(`Ürün eklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !productName.trim() || !productPrice || !selectedProductCategory) return;

    const currentPrice = parseFloat(productPrice);
    const previousPrice = editingProduct.price;
    const newStock = parseInt(productStock) || 0;
    
    // Otomatik originalPrice mantığı: fiyat düştüyse önceki fiyatı göster, arttıysa kaldır
    const originalPrice = currentPrice < previousPrice ? previousPrice : undefined;

    // Stok kontrolü: eğer stok 0'a düşüyorsa ve ürün aktifse, kullanıcıya sor
    if (newStock === 0 && editingProduct.stock > 0 && editingProduct.isActive) {
      const productData = {
        partnerId,
        id: editingProduct.id,
        name: productName.trim(),
        price: currentPrice,
        originalPrice,
        category: selectedProductCategory, // Ürün kategorisini kullan
        categoryId: selectedProductCategory, // Ürün kategorisini kullan
        options: selectedOptions,
        tags: selectedTags,
        images: productImages,
        description: productDescription.trim(),
        stock: newStock,
        sku: productSKU.trim(),
        weight: productWeight ? parseFloat(productWeight) : undefined,
        material: productMaterial.trim(),
        brand: productBrand.trim(),
        isFeatured,
        isNew,
        isActive: false // Stok 0 olduğunda ürünü kapat
      };
      
      setPendingProductData(productData);
      setShowStockZeroDialog(true);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: editingProduct.id,
          name: productName.trim(),
          price: currentPrice,
          originalPrice,
          category: selectedProductCategory, // Ürün kategorisini kullan
          categoryId: selectedProductCategory, // Ürün kategorisini kullan
          options: selectedOptions,
          tags: selectedTags,
          images: productImages,
          description: productDescription.trim(),
          stock: newStock,
          sku: productSKU.trim(),
          weight: productWeight ? parseFloat(productWeight) : undefined,
          material: productMaterial.trim(),
          brand: productBrand.trim(),
          isFeatured,
          isNew
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedProducts = products.map(product =>
          product.id === editingProduct.id ? updatedProduct : product
        );
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        closeModal();
        toast.success('Ürün başarıyla güncellendi!');
      } else {
        console.error('Failed to update product');
        toast.error('Ürün güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Ürün güncellenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const handleConfirmStockZero = async (shouldDeactivate: boolean) => {
    if (!pendingProductData) return;

    try {
      const productData = {
        ...pendingProductData,
        isActive: shouldDeactivate ? false : true
      };

      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedProducts = products.map(product =>
          product.id === editingProduct?.id ? updatedProduct : product
        );
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        closeModal();
        toast.success(`Ürün başarıyla ${shouldDeactivate ? 'kapatıldı' : 'güncellendi'}!`);
      } else {
        console.error('Failed to update product');
        toast.error('Ürün güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Ürün güncellenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products?id=${productId}&partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        toast.success('Ürün başarıyla silindi!');
      } else {
        console.error('Failed to delete product');
        toast.error('Ürün silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Ürün silinirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const handleToggleActive = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: productId,
          isActive: !product.isActive
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedProducts = products.map(p =>
          p.id === productId ? updatedProduct : p
        );
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        toast.success(`Ürün ${!product.isActive ? 'aktif' : 'pasif'} duruma getirildi!`);
      } else {
        console.error('Failed to toggle product status');
        toast.error('Ürün durumu değiştirilirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error(`Ürün durumu değiştirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: productId,
          isFeatured: !product.isFeatured
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedProducts = products.map(p =>
          p.id === productId ? updatedProduct : p
        );
        setProducts(updatedProducts);
        calculateStats(updatedProducts);
        toast.success(`Ürün ${!product.isFeatured ? 'öne çıkan' : 'normal'} duruma getirildi!`);
      } else {
        console.error('Failed to toggle product featured status');
        toast.error('Ürün öne çıkan durumu değiştirilirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error toggling product featured status:', error);
      toast.error(`Ürün öne çıkan durumu değiştirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    
    // 3-tier kategori sistemini ayarla
    // Önce ürün kategorisini mağaza kategorilerinden bul
    let foundSubCategory = '';
    let foundProductCategory = '';

    // Mağaza ana kategorisinin alt kategorilerini dolaş
    if (storeMainCategory) {
      const mainCategory = categories.find(cat => cat.id === storeMainCategory);
      if (mainCategory && mainCategory.childCategories) {
        for (const subCatId of mainCategory.childCategories) {
          const subCat = categories.find(cat => cat.id === subCatId);
          if (subCat && subCat.productCategories && subCat.productCategories.includes(product.categoryId)) {
            foundSubCategory = subCat.id;
            foundProductCategory = product.categoryId;
            break;
          }
        }
      }
    }

    setSelectedSubCategory(foundSubCategory);
    setSelectedProductCategory(foundProductCategory);
    
    setProductDescription(product.description || '');
    setProductStock(product.stock.toString());
    setProductSKU(product.sku || '');
    setProductWeight(product.weight?.toString() || '');
    setProductMaterial(product.material || '');
    setProductBrand(product.brand || '');
    setProductImages(product.images);
    setSelectedOptions(product.options);
    setSelectedTags(product.tags);
    setIsFeatured(product.isFeatured);
    setIsNew(product.isNew);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setIsBarcodeScannerOpen(false);
    setShowStockZeroDialog(false);
    setPendingProductData(null);
    setProductName('');
    setProductPrice('');
    setProductCategory('');
    setSelectedSubCategory(''); // Alt kategori sıfırla
    setSelectedProductCategory(''); // Ürün kategori sıfırla
    setProductDescription('');
    setProductStock('');
    setProductSKU('');
    setProductWeight('');
    setProductMaterial('');
    setProductBrand('');
    setProductImages([]);
    setSelectedOptions([]);
    setSelectedTags([]);
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
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
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
                      <div className="shrink-0 h-10 w-10">
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
                      {product.categoryName}
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
                        Ürün Kategorisi *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Ana Kategori - Mağaza kayıt olurken seçilen kategori (değiştirilemez) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Ana Kategori
                          </label>
                          <div className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm">
                            {storeNotFound ? 'Mağaza onay bekliyor' : storeMainCategory ? categories.find(cat => cat.id === storeMainCategory)?.name || storeMainCategory : 'Kategori yükleniyor...'}
                          </div>
                        </div>

                        {/* Alt Kategori */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Alt Kategori
                          </label>
                          <select
                            value={selectedSubCategory}
                            onChange={(e) => {
                              setSelectedSubCategory(e.target.value);
                              setSelectedProductCategory(''); // Ürün kategorisini sıfırla
                            }}
                            disabled={!storeMainCategory}
                            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Seçin</option>
                            {storeMainCategory && getSubCategoriesForMainCategory(storeMainCategory, categories).map((subCat: any) => (
                              <option key={subCat.id} value={subCat.id}>
                                {subCat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Ürün Kategorisi */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Ürün Kategorisi
                          </label>
                          <select
                            value={selectedProductCategory}
                            onChange={(e) => setSelectedProductCategory(e.target.value)}
                            disabled={!selectedSubCategory}
                            className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Seçin</option>
                            {selectedSubCategory && getProductCategoriesForSubCategory(selectedSubCategory, categories).map((prodCat: any) => (
                              <option key={prodCat} value={prodCat}>
                                {prodCat.split('-').map((word: string) => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Mağaza kategoriniz: {storeNotFound ? 'Onay bekliyor' : storeMainCategory ? categories.find(cat => cat.id === storeMainCategory)?.name || storeMainCategory : 'Yükleniyor...'}</p>
                    </div>
                  </div>
                </div>

                {/* Fiyat ve Stok */}
                <div className="bg-gray-750 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-3">Fiyat ve Stok</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              toast.error(`${file.name} dosyası çok büyük. Maksimum 5MB olabilir.`);
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
                      <div>Oluşturulma: {new Date(editingProduct.createdAt).toISOString().split('T')[0]}</div>
                      <div>Güncellenme: {new Date(editingProduct.updatedAt).toISOString().split('T')[0]}</div>
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
                disabled={
                  !productName.trim() ||
                  !productPrice ||
                  isNaN(parseFloat(productPrice)) ||
                  parseFloat(productPrice) <= 0 ||
                  !selectedProductCategory ||
                  !productStock ||
                  isNaN(parseInt(productStock)) ||
                  parseInt(productStock) < 0
                }
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

      {/* Stock Zero Confirmation Dialog */}
      {showStockZeroDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Stok Tükenme Uyarısı</h3>
              <button
                onClick={() => setShowStockZeroDialog(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
                <Package className="h-8 w-8 text-orange-500 shrink-0" />
                <div>
                  <p className="text-white font-medium">"{productName}" ürününde stok kalmadı</p>
                  <p className="text-gray-300 text-sm mt-1">
                    Bu ürünü mağazanızda görünür tutmak istiyor musunuz?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Stokta ürün kalmadığında genellikle ürün mağazadan kaldırılır, ancak bazı satıcılar "stokta yok" yazısıyla ürünü görünür tutmayı tercih eder.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirmStockZero(true)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Ürünü Kapat (Önerilen)
                </button>
                <button
                  onClick={() => handleConfirmStockZero(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Açık Tut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}