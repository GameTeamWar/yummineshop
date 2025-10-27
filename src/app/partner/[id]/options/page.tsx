'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Settings, Palette, Hash, Search, Filter, List, Grid3X3 } from 'lucide-react';

interface Option {
  id: string; // 8 haneli sayı
  name: string;
  categoryId: string;
  categoryName: string;
  type: 'color' | 'size' | 'material' | 'brand' | 'other';
  value: string; // Renk için hex kod (#FF0000), diğerleri için string
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

interface Category {
  id: string;
  name: string;
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

export default function OptionsPage() {
  const params = useParams();
  const partnerId = params.id as string;
  const [options, setOptions] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // View mode'u localStorage'dan yükle
  useEffect(() => {
    const savedViewMode = localStorage.getItem('options-view-mode');
    if (savedViewMode === 'list' || savedViewMode === 'card') {
      setViewMode(savedViewMode);
    }
  }, []);

  // View mode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('options-view-mode', viewMode);
  }, [viewMode]);

  // Form states
  const [optionName, setOptionName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [optionType, setOptionType] = useState<'color' | 'size' | 'material' | 'brand' | 'other'>('color');
  const [optionValue, setOptionValue] = useState('');

  // Opsiyonları Firebase'den çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri çek
        const categoriesRes = await fetch(`/api/categories?partnerId=${partnerId}`);
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        // Opsiyonları çek
        const optionsRes = await fetch(`/api/options?partnerId=${partnerId}`);
        const optionsData = await optionsRes.json();
        setOptions(optionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (partnerId) {
      fetchData();
    }
  }, [partnerId]);

  const handleAddOption = async () => {
    if (!optionName.trim() || !categoryId) return;

    try {
      const response = await fetch('/api/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          name: optionName.trim(),
          categoryId,
          type: optionType,
          value: optionValue.trim()
        }),
      });

      if (response.ok) {
        const newOption = await response.json();
        setOptions([...options, newOption]);
        closeModal();
      } else {
        console.error('Failed to add option');
      }
    } catch (error) {
      console.error('Error adding option:', error);
    }
  };

  const handleEditOption = async () => {
    if (!editingOption || !optionName.trim() || !categoryId) return;

    try {
      const response = await fetch('/api/options', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: editingOption.id,
          name: optionName.trim(),
          categoryId,
          type: optionType,
          value: optionValue.trim()
        }),
      });

      if (response.ok) {
        const updatedOption = await response.json();
        const updatedOptions = options.map(opt =>
          opt.id === editingOption.id ? updatedOption : opt
        );
        setOptions(updatedOptions);
        closeModal();
      } else {
        console.error('Failed to update option');
      }
    } catch (error) {
      console.error('Error updating option:', error);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      const response = await fetch(`/api/options?id=${optionId}&partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedOptions = options.filter(opt => opt.id !== optionId);
        setOptions(updatedOptions);
      } else {
        console.error('Failed to delete option');
      }
    } catch (error) {
      console.error('Error deleting option:', error);
    }
  };

  const handleToggleActive = async (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option) return;

    try {
      const response = await fetch('/api/options', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: optionId,
          isActive: !option.isActive
        }),
      });

      if (response.ok) {
        const updatedOption = await response.json();
        const updatedOptions = options.map(opt =>
          opt.id === optionId ? updatedOption : opt
        );
        setOptions(updatedOptions);
      } else {
        console.error('Failed to toggle option status');
      }
    } catch (error) {
      console.error('Error toggling option status:', error);
    }
  };

  const openEditModal = (option: Option) => {
    setEditingOption(option);
    setOptionName(option.name);
    setCategoryId(option.categoryId);
    setOptionType(option.type);
    setOptionValue(option.value);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingOption(null);
    setOptionName('');
    setCategoryId('');
    setOptionType('color');
    setOptionValue('');
  };

  const getFilteredOptions = () => {
    let filtered = options;

    if (searchTerm) {
      filtered = filtered.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(opt => opt.type === selectedType);
    }

    return filtered;
  };

  const getOptionsByCategory = () => {
    const filtered = getFilteredOptions();
    const grouped: { [key: string]: Option[] } = {};

    filtered.forEach(option => {
      if (!grouped[option.categoryId]) {
        grouped[option.categoryId] = [];
      }
      grouped[option.categoryId].push(option);
    });

    return grouped;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'color':
        return <Palette className="h-4 w-4" />;
      case 'size':
        return <Hash className="h-4 w-4" />;
      case 'material':
        return <Settings className="h-4 w-4" />;
      case 'brand':
        return <Filter className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'color':
        return 'Renk';
      case 'size':
        return 'Beden';
      case 'material':
        return 'Malzeme';
      case 'brand':
        return 'Marka';
      default:
        return 'Diğer';
    }
  };

  const renderColorValue = (value: string) => {
    return (
      <div className="flex items-center space-x-2">
        <div
          className="w-6 h-6 rounded border border-gray-600"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-gray-400 font-mono">{value}</span>
      </div>
    );
  };

  const totalOptions = options.length;
  const activeOptions = options.filter(opt => opt.isActive).length;
  const totalProducts = options.reduce((sum, opt) => sum + (opt.productCount || 0), 0);
  const categoriesWithOptions = new Set(options.map(opt => opt.categoryId)).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Mağaza Filtreleme Seçenekleri
            </h1>
            <p className="mt-2 text-gray-400">
              Ürünlerinizde kullanılacak renk, beden, malzeme ve marka filtrelerini yönetin
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
              Seçenek Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Seçenek ara..."
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
          <option value="color">Renk</option>
          <option value="size">Beden</option>
          <option value="material">Malzeme</option>
          <option value="brand">Marka</option>
          <option value="other">Diğer</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Seçenek"
          value={totalOptions}
          icon={Settings}
          color="text-blue-600"
        />
        <StatCard
          title="Aktif Seçenekler"
          value={activeOptions}
          icon={Settings}
          color="text-green-600"
        />
        <StatCard
          title="Kategori Sayısı"
          value={categoriesWithOptions}
          icon={Filter}
          color="text-purple-600"
          onClick={() => window.location.href = `/partner/${partnerId}/categories`}
        />
        <StatCard
          title="Toplam Ürün"
          value={totalProducts}
          icon={Settings}
          color="text-orange-600"
          onClick={() => window.location.href = `/partner/${partnerId}/urun`}
        />
      </div>

      {/* Options by Category */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {Object.entries(getOptionsByCategory()).map(([categoryId, categoryOptions]) => {
            const category = categories.find(cat => cat.id === categoryId);
            if (!category) return null;

            return (
              <div key={categoryId} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="p-6 border-b border-gray-700 bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-gray-400">
                        {categoryOptions.length} filtreleme seçeneği
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {categoryOptions.filter(opt => opt.isActive).length} aktif
                    </div>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`p-4 border rounded-lg transition-all ${
                          option.isActive
                            ? 'border-gray-600 bg-gray-750 hover:border-gray-500'
                            : 'border-red-700 bg-gray-800 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded ${
                              option.type === 'color' ? 'bg-purple-600' :
                              option.type === 'size' ? 'bg-blue-600' :
                              option.type === 'material' ? 'bg-green-600' :
                              option.type === 'brand' ? 'bg-orange-600' :
                              'bg-gray-600'
                            }`}>
                              {getTypeIcon(option.type)}
                            </div>
                            <div>
                              <h4 className={`font-medium ${option.isActive ? 'text-white' : 'text-gray-400'}`}>
                                {option.name}
                              </h4>
                              <p className="text-xs text-gray-500">{getTypeLabel(option.type)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleActive(option.id)}
                            className={`w-3 h-3 rounded-full ${
                              option.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={option.isActive ? 'Aktif' : 'Pasif'}
                          />
                        </div>

                        <div className="mb-3">
                          {option.type === 'color' ? (
                            renderColorValue(option.value)
                          ) : (
                            <span className="text-sm text-gray-400">{option.value}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{option.productCount} ürün</span>
                          <span>ID: {option.id}</span>
                        </div>

                        <div className="flex items-center justify-end space-x-2 mt-3">
                          <button
                            onClick={() => openEditModal(option)}
                            className="p-1 text-blue-600 hover:text-blue-400 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            className="p-1 text-red-600 hover:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {categoryOptions.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Filter className="mx-auto h-8 w-8 mb-2" />
                      <p>Bu kategoride henüz seçenek yok</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {Object.keys(getOptionsByCategory()).length === 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">
                {searchTerm || selectedType !== 'all' ? 'Aramanızla eşleşen seçenek bulunamadı' : 'Henüz seçenek yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedType !== 'all' ? 'Farklı bir arama terimi deneyin' : 'İlk filtrenizi eklemek için yukarıdaki butona tıklayın.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {getFilteredOptions().map((option) => {
            const category = categories.find(cat => cat.id === option.categoryId);

            return (
              <div
                key={option.id}
                className={`bg-gray-800 border rounded-lg overflow-hidden hover:border-gray-600 transition-colors cursor-pointer ${
                  option.isActive ? 'border-gray-700' : 'border-red-700 opacity-75'
                }`}
                onClick={() => handleToggleActive(option.id)}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      option.type === 'color' ? 'bg-purple-600' :
                      option.type === 'size' ? 'bg-blue-600' :
                      option.type === 'material' ? 'bg-green-600' :
                      option.type === 'brand' ? 'bg-orange-600' :
                      'bg-gray-600'
                    }`}>
                      {getTypeIcon(option.type)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(option.id);
                        }}
                        className={`w-3 h-3 rounded-full ${
                          option.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={option.isActive ? 'Aktif' : 'Pasif'}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(option);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-400 transition-colors rounded"
                        title="Düzenle"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption(option.id);
                        }}
                        className="p-1.5 text-red-600 hover:text-red-400 transition-colors rounded"
                        title="Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${option.isActive ? 'text-white' : 'text-gray-400'}`}>
                      {option.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{getTypeLabel(option.type)}</p>
                    <div className="text-xs text-gray-500">Kategori: {category?.name}</div>
                    <div className="text-xs text-gray-500 font-mono">ID: {option.id}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Value Display */}
                    <div className="flex justify-center">
                      {option.type === 'color' ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded border border-gray-600"
                            style={{ backgroundColor: option.value }}
                          />
                          <span className="text-sm text-gray-400 font-mono">{option.value}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded">
                          {option.value}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-700 rounded p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{option.productCount}</div>
                      <div className="text-xs text-gray-400">Ürün</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {getFilteredOptions().length === 0 && (
            <div className="col-span-full bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">
                {searchTerm || selectedType !== 'all' ? 'Aramanızla eşleşen seçenek bulunamadı' : 'Henüz seçenek yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedType !== 'all' ? 'Farklı bir arama terimi deneyin' : 'İlk filtrenizi eklemek için yukarıdaki butona tıklayın.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Option Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingOption ? 'Seçeneği Düzenle' : 'Yeni Seçenek Ekle'}
              </h3>
              {/* Anlık Önizleme */}
              <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 max-w-sm">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Önizleme</h4>
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded ${
                        optionType === 'color' ? 'bg-purple-600' :
                        optionType === 'size' ? 'bg-blue-600' :
                        optionType === 'material' ? 'bg-green-600' :
                        optionType === 'brand' ? 'bg-orange-600' :
                        'bg-gray-600'
                      }`}>
                        {optionType === 'color' ? <Palette className="h-4 w-4 text-white" /> :
                         optionType === 'size' ? <Hash className="h-4 w-4 text-white" /> :
                         optionType === 'material' ? <Settings className="h-4 w-4 text-white" /> :
                         optionType === 'brand' ? <Filter className="h-4 w-4 text-white" /> :
                         <Settings className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <h4 className={`font-medium text-white`}>
                          {optionName || 'Seçenek Adı'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {optionType === 'color' ? 'Renk' :
                           optionType === 'size' ? 'Beden' :
                           optionType === 'material' ? 'Malzeme' :
                           optionType === 'brand' ? 'Marka' : 'Diğer'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-green-500`} />
                  </div>

                  <div className="mb-3">
                    {optionType === 'color' && optionValue ? (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: optionValue }}
                        />
                        <span className="text-sm text-gray-400 font-mono">{optionValue}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">{optionValue || 'Değer'}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>0 ürün</span>
                    <span>Kategori: {categoryId ? categories.find(cat => cat.id === categoryId)?.name : 'Seçilmemiş'}</span>
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
                      Seçenek Adı *
                    </label>
                    <input
                      type="text"
                      value={optionName}
                      onChange={(e) => setOptionName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Seçenek adını girin"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tip
                    </label>
                    <select
                      value={optionType}
                      onChange={(e) => setOptionType(e.target.value as 'color' | 'size' | 'material' | 'brand' | 'other')}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="color">Renk</option>
                      <option value="size">Beden</option>
                      <option value="material">Malzeme</option>
                      <option value="brand">Marka</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {optionType === 'color' ? 'Hex Kodu (#FF0000)' : 'Değer'}
                    </label>
                    <input
                      type={optionType === 'color' ? 'color' : 'text'}
                      value={optionValue}
                      onChange={(e) => setOptionValue(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={optionType === 'color' ? '#FF0000' : 'Değeri girin'}
                    />
                  </div>
                </div>

                {editingOption && (
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Hash className="h-4 w-4" />
                      <span>Seçenek ID: {editingOption.id}</span>
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
                onClick={editingOption ? handleEditOption : handleAddOption}
                disabled={!optionName.trim() || !categoryId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingOption ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}