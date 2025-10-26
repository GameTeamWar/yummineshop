'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderOpen, Package, Search, ChevronDown, ChevronRight, Hash } from 'lucide-react';

interface Category {
  id: string; // 8 haneli sayı
  name: string;
  description?: string;
  parentId?: string; // Alt kategori için
  hasSubcategories: boolean;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  filterType: 'checkbox' | 'radio' | 'dropdown'; // Filtreleme türü
  hasSearch: boolean; // Arama özelliği var mı
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [filterType, setFilterType] = useState<'checkbox' | 'radio' | 'dropdown'>('checkbox');
  const [hasSearch, setHasSearch] = useState(false);

  // Mock data - mağaza kategorileri için
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: '10000001',
        name: 'Kadın Giyim',
        description: 'Kadınlar için giyim ürünleri',
        hasSubcategories: true,
        productCount: 45,
        isActive: true,
        createdAt: '2024-01-15',
        filterType: 'checkbox',
        hasSearch: true,
        sortOrder: 1
      },
      {
        id: '10000002',
        name: 'Erkek Giyim',
        description: 'Erkekler için giyim ürünleri',
        hasSubcategories: true,
        productCount: 38,
        isActive: true,
        createdAt: '2024-01-16',
        filterType: 'checkbox',
        hasSearch: true,
        sortOrder: 2
      },
      {
        id: '10000003',
        name: 'Çocuk Giyim',
        description: 'Çocuklar için giyim ürünleri',
        hasSubcategories: false,
        productCount: 22,
        isActive: true,
        createdAt: '2024-01-17',
        filterType: 'radio',
        hasSearch: false,
        sortOrder: 3
      },
      {
        id: '10000004',
        name: 'Ayakkabı',
        description: 'Kadın, erkek ve çocuk ayakkabıları',
        hasSubcategories: true,
        productCount: 67,
        isActive: true,
        createdAt: '2024-01-18',
        filterType: 'dropdown',
        hasSearch: true,
        sortOrder: 4
      },
      {
        id: '10000005',
        name: 'Aksesuar',
        description: 'Çanta, şapka, kemer gibi aksesuarlar',
        hasSubcategories: false,
        productCount: 31,
        isActive: true,
        createdAt: '2024-01-19',
        filterType: 'checkbox',
        hasSearch: true,
        sortOrder: 5
      },
      // Alt kategoriler
      {
        id: '10000006',
        name: 'Elbise',
        description: 'Kadın elbiseleri',
        parentId: '10000001',
        hasSubcategories: false,
        productCount: 18,
        isActive: true,
        createdAt: '2024-01-20',
        filterType: 'checkbox',
        hasSearch: false,
        sortOrder: 1
      },
      {
        id: '10000007',
        name: 'Bluz',
        description: 'Kadın bluzları',
        parentId: '10000001',
        hasSubcategories: false,
        productCount: 12,
        isActive: true,
        createdAt: '2024-01-21',
        filterType: 'radio',
        hasSearch: false,
        sortOrder: 2
      },
      {
        id: '10000008',
        name: 'Gömlek',
        description: 'Erkek gömlekleri',
        parentId: '10000002',
        hasSubcategories: false,
        productCount: 15,
        isActive: true,
        createdAt: '2024-01-22',
        filterType: 'checkbox',
        hasSearch: false,
        sortOrder: 1
      },
      {
        id: '10000009',
        name: 'Pantolon',
        description: 'Erkek pantolonları',
        parentId: '10000002',
        hasSubcategories: false,
        productCount: 23,
        isActive: true,
        createdAt: '2024-01-23',
        filterType: 'dropdown',
        hasSearch: false,
        sortOrder: 2
      },
      {
        id: '10000010',
        name: 'Spor Ayakkabı',
        description: 'Spor ve koşu ayakkabıları',
        parentId: '10000004',
        hasSubcategories: false,
        productCount: 28,
        isActive: true,
        createdAt: '2024-01-24',
        filterType: 'checkbox',
        hasSearch: true,
        sortOrder: 1
      },
      {
        id: '10000011',
        name: 'Klasik Ayakkabı',
        description: 'Klasik ve resmi ayakkabılar',
        parentId: '10000004',
        hasSubcategories: false,
        productCount: 39,
        isActive: false,
        createdAt: '2024-01-25',
        filterType: 'radio',
        hasSearch: false,
        sortOrder: 2
      }
    ];

    setCategories(mockCategories);
  }, []);

  const generateCategoryId = (): string => {
    // 8 haneli benzersiz ID oluştur
    let id: string;
    do {
      id = Math.floor(10000000 + Math.random() * 90000000).toString();
    } while (categories.some(cat => cat.id === id));
    return id;
  };

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;

    const newCategory: Category = {
      id: generateCategoryId(),
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      parentId: parentCategoryId || undefined,
      hasSubcategories: false,
      productCount: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      filterType,
      hasSearch,
      sortOrder: categories.length + 1
    };

    setCategories([...categories, newCategory]);
    closeModal();
  };

  const handleEditCategory = () => {
    if (!editingCategory || !categoryName.trim()) return;

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: categoryName.trim(),
            description: categoryDescription.trim(),
            parentId: parentCategoryId || undefined,
            filterType,
            hasSearch
          }
        : cat
    );

    setCategories(updatedCategories);
    closeModal();
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Alt kategorileri de sil
    const categoriesToDelete = [categoryId];
    const findSubcategories = (parentId: string) => {
      categories
        .filter(cat => cat.parentId === parentId)
        .forEach(subCat => {
          categoriesToDelete.push(subCat.id);
          findSubcategories(subCat.id);
        });
    };
    findSubcategories(categoryId);

    const updatedCategories = categories.filter(cat => !categoriesToDelete.includes(cat.id));
    setCategories(updatedCategories);
  };

  const handleToggleActive = (categoryId: string) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    );
    setCategories(updatedCategories);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setParentCategoryId(category.parentId || '');
    setFilterType(category.filterType);
    setHasSearch(category.hasSearch);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setParentCategoryId('');
    setFilterType('checkbox');
    setHasSearch(false);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getMainCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return getMainCategories();
    return getMainCategories().filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getCategoryStats = (category: Category) => {
    const subcategories = getSubcategories(category.id);
    const totalProducts = category.productCount + subcategories.reduce((sum, sub) => sum + sub.productCount, 0);
    return {
      totalProducts,
      subcategoryCount: subcategories.length,
      activeSubcategories: subcategories.filter(sub => sub.isActive).length
    };
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const mainCategories = getMainCategories().length;
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Kategori Yönetimi
            </h1>
            <p className="mt-2 text-gray-400">
              Mağaza kategorilerinizi ve alt kategorilerinizi yönetin
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Kategori Ekle
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Kategori</p>
              <p className="text-2xl font-bold text-blue-600">{totalCategories}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Ana Kategoriler</p>
              <p className="text-2xl font-bold text-green-600">{mainCategories}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Aktif Kategoriler</p>
              <p className="text-2xl font-bold text-purple-600">{activeCategories}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Ürün</p>
              <p className="text-2xl font-bold text-orange-600">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {getFilteredCategories().map((category) => {
          const stats = getCategoryStats(category);
          const subcategories = getSubcategories(category.id);

          return (
            <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {/* Main Category Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {category.hasSubcategories && (
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    <div className={`p-2 rounded-lg ${category.isActive ? 'bg-blue-600' : 'bg-red-600'}`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <span className="text-xs text-gray-400 font-mono">ID: {category.id}</span>
                      </div>
                      <p className="text-sm text-gray-400">{category.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{stats.totalProducts} ürün</span>
                        {category.hasSubcategories && (
                          <span>{stats.subcategoryCount} alt kategori</span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          category.filterType === 'checkbox' ? 'bg-blue-100 text-blue-800' :
                          category.filterType === 'radio' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {category.filterType === 'checkbox' ? 'Çoklu' :
                           category.filterType === 'radio' ? 'Tekli' : 'Açılır'}
                        </span>
                        {category.hasSearch && (
                          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Arama</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleActive(category.id)}
                      className={`w-3 h-3 rounded-full ${
                        category.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      title={category.isActive ? 'Aktif' : 'Pasif'}
                    />
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-blue-600 hover:text-blue-400 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:text-red-400 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category.id) && subcategories.length > 0 && (
                <div className="p-6 bg-gray-750">
                  <h4 className="text-sm font-medium text-gray-300 mb-4">Alt Kategoriler</h4>
                  <div className="space-y-3">
                    {subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded ${subcategory.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                            <FolderOpen className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${subcategory.isActive ? 'text-white' : 'text-gray-400'}`}>
                                {subcategory.name}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">ID: {subcategory.id}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{subcategory.productCount} ürün</span>
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                subcategory.filterType === 'checkbox' ? 'bg-blue-100 text-blue-800' :
                                subcategory.filterType === 'radio' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {subcategory.filterType === 'checkbox' ? 'Çoklu' :
                                 subcategory.filterType === 'radio' ? 'Tekli' : 'Açılır'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(subcategory.id)}
                            className={`w-2 h-2 rounded-full ${
                              subcategory.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <button
                            onClick={() => openEditModal(subcategory)}
                            className="p-1 text-blue-600 hover:text-blue-400 transition-colors"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(subcategory.id)}
                            className="p-1 text-red-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {getFilteredCategories().length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">
              {searchTerm ? 'Aramanızla eşleşen kategori bulunamadı' : 'Henüz kategori yok'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Farklı bir arama terimi deneyin' : 'İlk kategorinizi eklemek için yukarıdaki butona tıklayın.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h3>
              {/* Anlık Önizleme */}
              <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 max-w-sm">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Önizleme</h4>
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`p-2 rounded-lg ${true ? 'bg-blue-600' : 'bg-red-600'}`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-white">
                        {categoryName || 'Kategori Adı'}
                      </h5>
                      <p className="text-xs text-gray-400">
                        {categoryDescription || 'Kategori açıklaması'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>0 ürün</span>
                        <span className={`px-2 py-1 rounded ${
                          filterType === 'checkbox' ? 'bg-blue-100 text-blue-800' :
                          filterType === 'radio' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {filterType === 'checkbox' ? 'Çoklu' :
                           filterType === 'radio' ? 'Tekli' : 'Açılır'}
                        </span>
                        {hasSearch && (
                          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Arama</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kategori adını girin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Üst Kategori
                    </label>
                    <select
                      value={parentCategoryId}
                      onChange={(e) => setParentCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Ana Kategori</option>
                      {getMainCategories().map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kategori açıklaması (opsiyonel)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Filtre Türü
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as 'checkbox' | 'radio' | 'dropdown')}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="checkbox">Çoklu Seçim (Checkbox)</option>
                      <option value="radio">Tekli Seçim (Radio)</option>
                      <option value="dropdown">Açılır Menü (Dropdown)</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasSearch"
                      checked={hasSearch}
                      onChange={(e) => setHasSearch(e.target.checked)}
                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasSearch" className="ml-2 text-sm text-gray-300">
                      Arama Özelliği
                    </label>
                  </div>
                </div>

                {editingCategory && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Hash className="h-4 w-4" />
                      <span>Kategori ID: {editingCategory.id}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={editingCategory ? handleEditCategory : handleAddCategory}
                disabled={!categoryName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingCategory ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}