'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Settings, Hash, Search, Package, Eye, EyeOff } from 'lucide-react';

interface Filter {
  id: string; // 8 haneli sayı
  name: string;
  categoryId: string;
  categoryName: string;
  type: 'checkbox' | 'radio' | 'dropdown' | 'range' | 'multiselect';
  options: string[]; // Filtre seçenekleri
  isActive: boolean;
  isVisible: boolean; // Müşteriye görünür mü
  sortOrder: number;
  productCount: number;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form states
  const [filterName, setFilterName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [filterType, setFilterType] = useState<'checkbox' | 'radio' | 'dropdown' | 'range' | 'multiselect'>('checkbox');
  const [filterOptions, setFilterOptions] = useState<string[]>(['']);
  const [isVisible, setIsVisible] = useState(true);

  // Mock data - mağaza filtreleri için
  useEffect(() => {
    const mockCategories: Category[] = [
      { id: '10000001', name: 'Kadın Giyim' },
      { id: '10000002', name: 'Erkek Giyim' },
      { id: '10000003', name: 'Çocuk Giyim' },
      { id: '10000004', name: 'Ayakkabı' },
      { id: '10000005', name: 'Aksesuar' }
    ];

    const mockFilters: Filter[] = [
      {
        id: '40000001',
        name: 'Beden',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'radio',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        isActive: true,
        isVisible: true,
        sortOrder: 1,
        productCount: 45,
        createdAt: '2024-01-15'
      },
      {
        id: '40000002',
        name: 'Renk',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'checkbox',
        options: ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil'],
        isActive: true,
        isVisible: true,
        sortOrder: 2,
        productCount: 38,
        createdAt: '2024-01-15'
      },
      {
        id: '40000003',
        name: 'Marka',
        categoryId: '10000002',
        categoryName: 'Erkek Giyim',
        type: 'dropdown',
        options: ['Nike', 'Adidas', 'Puma', 'Lacoste', 'Zara'],
        isActive: true,
        isVisible: true,
        sortOrder: 1,
        productCount: 52,
        createdAt: '2024-01-16'
      },
      {
        id: '40000004',
        name: 'Fiyat Aralığı',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'range',
        options: ['0-100', '100-200', '200-500', '500+'],
        isActive: true,
        isVisible: true,
        sortOrder: 3,
        productCount: 67,
        createdAt: '2024-01-17'
      },
      {
        id: '40000005',
        name: 'Malzeme',
        categoryId: '10000005',
        categoryName: 'Aksesuar',
        type: 'multiselect',
        options: ['Deri', 'Kumaş', 'Metal', 'Plastik', 'Taş'],
        isActive: true,
        isVisible: true,
        sortOrder: 2,
        productCount: 23,
        createdAt: '2024-01-18'
      },
      {
        id: '40000006',
        name: 'Numara',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'dropdown',
        options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
        isActive: true,
        isVisible: true,
        sortOrder: 1,
        productCount: 89,
        createdAt: '2024-01-19'
      },
      {
        id: '40000007',
        name: 'Stil',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'checkbox',
        options: ['Klasik', 'Spor', 'Şık', 'Rahat', 'Trend'],
        isActive: false,
        isVisible: true,
        sortOrder: 4,
        productCount: 0,
        createdAt: '2024-01-20'
      }
    ];

    setCategories(mockCategories);
    setFilters(mockFilters);
  }, []);

  const generateFilterId = (): string => {
    // 8 haneli benzersiz ID oluştur (4 ile başlayan)
    let id: string;
    do {
      id = '4' + Math.floor(1000000 + Math.random() * 9000000).toString();
    } while (filters.some(filter => filter.id === id));
    return id;
  };

  const handleAddFilter = () => {
    if (!filterName.trim() || !categoryId) return;

    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (!selectedCategory) return;

    const newFilter: Filter = {
      id: generateFilterId(),
      name: filterName.trim(),
      categoryId,
      categoryName: selectedCategory.name,
      type: filterType,
      options: filterOptions.filter(opt => opt.trim() !== ''),
      isActive: true,
      isVisible,
      sortOrder: filters.filter(f => f.categoryId === categoryId).length + 1,
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setFilters([...filters, newFilter]);
    closeModal();
  };

  const handleEditFilter = () => {
    if (!editingFilter || !filterName.trim() || !categoryId) return;

    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (!selectedCategory) return;

    const updatedFilters = filters.map(filter =>
      filter.id === editingFilter.id
        ? {
            ...filter,
            name: filterName.trim(),
            categoryId,
            categoryName: selectedCategory.name,
            type: filterType,
            options: filterOptions.filter(opt => opt.trim() !== ''),
            isVisible
          }
        : filter
    );

    setFilters(updatedFilters);
    closeModal();
  };

  const handleDeleteFilter = (filterId: string) => {
    const updatedFilters = filters.filter(filter => filter.id !== filterId);
    setFilters(updatedFilters);
  };

  const handleToggleActive = (filterId: string) => {
    const updatedFilters = filters.map(filter =>
      filter.id === filterId ? { ...filter, isActive: !filter.isActive } : filter
    );
    setFilters(updatedFilters);
  };

  const handleToggleVisible = (filterId: string) => {
    const updatedFilters = filters.map(filter =>
      filter.id === filterId ? { ...filter, isVisible: !filter.isVisible } : filter
    );
    setFilters(updatedFilters);
  };

  const openEditModal = (filter: Filter) => {
    setEditingFilter(filter);
    setFilterName(filter.name);
    setCategoryId(filter.categoryId);
    setFilterType(filter.type);
    setFilterOptions(filter.options.length > 0 ? filter.options : ['']);
    setIsVisible(filter.isVisible);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingFilter(null);
    setFilterName('');
    setCategoryId('');
    setFilterType('checkbox');
    setFilterOptions(['']);
    setIsVisible(true);
  };

  const addFilterOption = () => {
    setFilterOptions([...filterOptions, '']);
  };

  const updateFilterOption = (index: number, value: string) => {
    const updated = [...filterOptions];
    updated[index] = value;
    setFilterOptions(updated);
  };

  const removeFilterOption = (index: number) => {
    if (filterOptions.length > 1) {
      setFilterOptions(filterOptions.filter((_, i) => i !== index));
    }
  };

  const getFilteredFilters = () => {
    let filtered = filters;

    if (searchTerm) {
      filtered = filtered.filter(filter =>
        filter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filter.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(filter => filter.categoryId === selectedCategory);
    }

    return filtered;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'checkbox': return 'Çoklu Seçim';
      case 'radio': return 'Tek Seçim';
      case 'dropdown': return 'Açılır Liste';
      case 'range': return 'Aralık';
      case 'multiselect': return 'Çoklu Seçim+';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checkbox': return 'bg-blue-100 text-blue-800';
      case 'radio': return 'bg-green-100 text-green-800';
      case 'dropdown': return 'bg-purple-100 text-purple-800';
      case 'range': return 'bg-orange-100 text-orange-800';
      case 'multiselect': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalFilters = filters.length;
  const activeFilters = filters.filter(f => f.isActive).length;
  const visibleFilters = filters.filter(f => f.isVisible).length;
  const totalProducts = filters.reduce((sum, filter) => sum + filter.productCount, 0);
  const categoriesWithFilters = new Set(filters.map(f => f.categoryId)).size;

  const filteredFilters = getFilteredFilters();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Ürün Filtreleri
            </h1>
            <p className="mt-2 text-gray-400">
              Müşterilerinizin ürünleri kolayca bulmasını sağlayın
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Filtre Ekle
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filtre ara..."
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
          <option value="">Tüm Kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Filtre</p>
              <p className="text-2xl font-bold text-blue-600">{totalFilters}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Aktif Filtreler</p>
              <p className="text-2xl font-bold text-green-600">{activeFilters}</p>
            </div>
            <Filter className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Görünür Filtreler</p>
              <p className="text-2xl font-bold text-purple-600">{visibleFilters}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Kategori Sayısı</p>
              <p className="text-2xl font-bold text-orange-600">{categoriesWithFilters}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Ürün</p>
              <p className="text-2xl font-bold text-cyan-600">{totalProducts}</p>
            </div>
            <Hash className="h-8 w-8 text-cyan-500" />
          </div>
        </div>
      </div>

      {/* Filters Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Filtreler ({filteredFilters.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {searchTerm && `Arama: "${searchTerm}"`}
                {selectedCategory && `Kategori: ${categories.find(c => c.id === selectedCategory)?.name}`}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Filtre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Seçenekler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ürün Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Görünürlük
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
              {filteredFilters.map((filter) => (
                <tr key={filter.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded bg-gray-600 flex items-center justify-center">
                          <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{filter.name}</div>
                        <div className="text-sm text-gray-400">ID: {filter.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {filter.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(filter.type)}`}>
                      {getTypeLabel(filter.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {filter.options.slice(0, 3).map((option, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {option}
                        </span>
                      ))}
                      {filter.options.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          +{filter.options.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {filter.productCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVisible(filter.id)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        filter.isVisible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {filter.isVisible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                      {filter.isVisible ? 'Görünür' : 'Gizli'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(filter.id)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        filter.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {filter.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(filter)}
                        className="text-blue-600 hover:text-blue-400 p-1 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
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

        {filteredFilters.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">
              {searchTerm || selectedCategory ? 'Aramanızla eşleşen filtre bulunamadı' : 'Henüz filtre yok'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory ? 'Farklı kriterlerle tekrar deneyin' : 'İlk filtrenizi eklemek için yukarıdaki butona tıklayın.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Filter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-6">
              {editingFilter ? 'Filtre Düzenle' : 'Yeni Filtre Ekle'}
            </h3>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filtre Adı *
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Filtre adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filtre Türü
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="checkbox">Çoklu Seçim (Checkbox)</option>
                  <option value="radio">Tek Seçim (Radio)</option>
                  <option value="dropdown">Açılır Liste (Dropdown)</option>
                  <option value="range">Aralık (Range)</option>
                  <option value="multiselect">Çoklu Seçim+ (Multiselect)</option>
                </select>
              </div>

              {/* Filter Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filtre Seçenekleri
                </label>
                <div className="space-y-2">
                  {filterOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateFilterOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Seçenek ${index + 1}`}
                      />
                      {filterOptions.length > 1 && (
                        <button
                          onClick={() => removeFilterOption(index)}
                          className="p-2 text-red-600 hover:text-red-400 transition-colors"
                          title="Seçeneği kaldır"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addFilterOption}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-400 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Seçenek Ekle
                  </button>
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Müşteriye görünür</span>
                </label>
              </div>

              {editingFilter && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Filtre ID: {editingFilter.id}</span>
                    <span>•</span>
                    <span>Oluşturulma: {editingFilter.createdAt}</span>
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
                onClick={editingFilter ? handleEditFilter : handleAddFilter}
                disabled={!filterName.trim() || !categoryId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingFilter ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}