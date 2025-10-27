'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, FolderOpen, Package, Search, ChevronDown, ChevronRight, Hash, List, Grid3X3 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  filterType: 'checkbox' | 'radio' | 'dropdown';
  hasSearch: boolean;
  isActive: boolean;
  productCount?: number;
  hasSubcategories?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
  <div
    className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${onClick ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`h-8 w-8 ${color.replace('text-', 'text-')}`} />
    </div>
  </div>
);

export default function CategoriesPage() {
  const params = useParams();
  const partnerId = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // View mode'u localStorage'dan yükle
  useEffect(() => {
    const savedViewMode = localStorage.getItem('categories-view-mode');
    if (savedViewMode === 'list' || savedViewMode === 'card') {
      setViewMode(savedViewMode);
    }
  }, []);

  // View mode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('categories-view-mode', viewMode);
  }, [viewMode]);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [filterType, setFilterType] = useState<'checkbox' | 'radio' | 'dropdown'>('checkbox');
  const [hasSearch, setHasSearch] = useState(false);

  // Kategorileri Firebase'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories?partnerId=${partnerId}`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (partnerId) {
      fetchCategories();
    }
  }, [partnerId]);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          parentId: parentCategoryId || undefined,
          filterType,
          hasSearch
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        closeModal();
      } else {
        console.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: editingCategory.id,
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          parentId: parentCategoryId || undefined,
          filterType,
          hasSearch
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        const updatedCategories = categories.map(cat =>
          cat.id === editingCategory.id ? updatedCategory : cat
        );
        setCategories(updatedCategories);
        closeModal();
      } else {
        console.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories?id=${categoryId}&partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleToggleActive = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: categoryId,
          isActive: !category.isActive
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        const updatedCategories = categories.map(cat =>
          cat.id === categoryId ? updatedCategory : cat
        );
        setCategories(updatedCategories);
      } else {
        console.error('Failed to toggle category status');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
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
    const totalProducts = (category.productCount || 0) + subcategories.reduce((sum, sub) => sum + (sub.productCount || 0), 0);
    return {
      totalProducts,
      subcategoryCount: subcategories.length,
      activeSubcategories: subcategories.filter(sub => sub.isActive).length
    };
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const mainCategories = getMainCategories().length;
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

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
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                title="Liste Görünümü"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                title="Kart Görünümü"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
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
        <StatCard
          title="Toplam Kategori"
          value={totalCategories}
          icon={FolderOpen}
          color="text-blue-600"
        />
        <StatCard
          title="Ana Kategoriler"
          value={mainCategories}
          icon={FolderOpen}
          color="text-green-600"
        />
        <StatCard
          title="Aktif Kategoriler"
          value={activeCategories}
          icon={FolderOpen}
          color="text-purple-600"
        />
        <StatCard
          title="Toplam Ürün"
          value={totalProducts}
          icon={Package}
          color="text-orange-600"
          onClick={() => window.location.href = `/partner/${partnerId}/urun`}
        />
      </div>

      {/* Categories */}
      {viewMode === 'list' ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getFilteredCategories().map((category) => {
            const stats = getCategoryStats(category);
            const subcategories = getSubcategories(category.id);

            return (
              <div
                key={category.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => handleToggleActive(category.id)}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${category.isActive ? 'bg-blue-600' : 'bg-red-600'}`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(category.id);
                        }}
                        className={`w-3 h-3 rounded-full ${
                          category.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={category.isActive ? 'Aktif' : 'Pasif'}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(category);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-400 transition-colors rounded"
                        title="Düzenle"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="p-1.5 text-red-600 hover:text-red-400 transition-colors rounded"
                        title="Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{category.description}</p>
                    <div className="text-xs text-gray-500 font-mono">ID: {category.id}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-lg font-bold text-blue-400">{stats.totalProducts}</div>
                        <div className="text-xs text-gray-400">Ürün</div>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-lg font-bold text-green-400">{stats.subcategoryCount}</div>
                        <div className="text-xs text-gray-400">Alt Kat.</div>
                      </div>
                    </div>

                    {/* Filter Type */}
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        category.filterType === 'checkbox' ? 'bg-blue-100 text-blue-800' :
                        category.filterType === 'radio' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {category.filterType === 'checkbox' ? 'Çoklu' :
                         category.filterType === 'radio' ? 'Tekli' : 'Açılır'}
                      </span>
                    </div>

                    {/* Search Feature */}
                    {category.hasSearch && (
                      <div className="flex justify-center">
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">Arama</span>
                      </div>
                    )}

                    {/* Subcategories Preview */}
                    {subcategories.length > 0 && (
                      <div className="border-t border-gray-700 pt-3">
                        <div className="text-xs text-gray-400 mb-2">Alt Kategoriler ({subcategories.length})</div>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {subcategories.slice(0, 3).map((subcategory) => (
                            <div key={subcategory.id} className="flex items-center justify-between text-xs">
                              <span className={`truncate ${subcategory.isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                {subcategory.name}
                              </span>
                              <span className="text-gray-500">{subcategory.productCount}</span>
                            </div>
                          ))}
                          {subcategories.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{subcategories.length - 3} daha...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {getFilteredCategories().length === 0 && (
            <div className="col-span-full bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
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
      )}
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