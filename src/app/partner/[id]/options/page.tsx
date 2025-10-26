'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, Palette, Hash, Search, Filter } from 'lucide-react';

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

export default function OptionsPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Form states
  const [optionName, setOptionName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [optionType, setOptionType] = useState<'color' | 'size' | 'material' | 'brand' | 'other'>('color');
  const [optionValue, setOptionValue] = useState('');

  // Mock data - mağaza filtreleme seçenekleri için
  useEffect(() => {
    const mockCategories: Category[] = [
      { id: '10000001', name: 'Kadın Giyim' },
      { id: '10000002', name: 'Erkek Giyim' },
      { id: '10000003', name: 'Çocuk Giyim' },
      { id: '10000004', name: 'Ayakkabı' },
      { id: '10000005', name: 'Aksesuar' }
    ];

    const mockOptions: Option[] = [
      // Renk seçenekleri
      {
        id: '20000001',
        name: 'Kırmızı',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'color',
        value: '#FF0000',
        isActive: true,
        sortOrder: 1,
        productCount: 15
      },
      {
        id: '20000002',
        name: 'Mavi',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'color',
        value: '#0000FF',
        isActive: true,
        sortOrder: 2,
        productCount: 23
      },
      {
        id: '20000003',
        name: 'Siyah',
        categoryId: '10000002',
        categoryName: 'Erkek Giyim',
        type: 'color',
        value: '#000000',
        isActive: true,
        sortOrder: 1,
        productCount: 31
      },
      {
        id: '20000004',
        name: 'Beyaz',
        categoryId: '10000002',
        categoryName: 'Erkek Giyim',
        type: 'color',
        value: '#FFFFFF',
        isActive: true,
        sortOrder: 2,
        productCount: 18
      },
      // Beden seçenekleri
      {
        id: '20000005',
        name: 'S',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'size',
        value: 'S',
        isActive: true,
        sortOrder: 1,
        productCount: 12
      },
      {
        id: '20000006',
        name: 'M',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'size',
        value: 'M',
        isActive: true,
        sortOrder: 2,
        productCount: 28
      },
      {
        id: '20000007',
        name: 'L',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'size',
        value: 'L',
        isActive: true,
        sortOrder: 3,
        productCount: 19
      },
      {
        id: '20000008',
        name: 'XL',
        categoryId: '10000002',
        categoryName: 'Erkek Giyim',
        type: 'size',
        value: 'XL',
        isActive: true,
        sortOrder: 3,
        productCount: 14
      },
      // Ayakkabı numaraları
      {
        id: '20000009',
        name: '36',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'size',
        value: '36',
        isActive: true,
        sortOrder: 1,
        productCount: 8
      },
      {
        id: '20000010',
        name: '37',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'size',
        value: '37',
        isActive: true,
        sortOrder: 2,
        productCount: 12
      },
      {
        id: '20000011',
        name: '38',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'size',
        value: '38',
        isActive: true,
        sortOrder: 3,
        productCount: 15
      },
      // Malzeme seçenekleri
      {
        id: '20000012',
        name: 'Pamuk',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'material',
        value: 'Pamuk',
        isActive: true,
        sortOrder: 1,
        productCount: 22
      },
      {
        id: '20000013',
        name: 'Polyester',
        categoryId: '10000001',
        categoryName: 'Kadın Giyim',
        type: 'material',
        value: 'Polyester',
        isActive: true,
        sortOrder: 2,
        productCount: 16
      },
      {
        id: '20000014',
        name: 'Deri',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'material',
        value: 'Deri',
        isActive: true,
        sortOrder: 1,
        productCount: 25
      },
      // Marka seçenekleri
      {
        id: '20000015',
        name: 'Nike',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'brand',
        value: 'Nike',
        isActive: true,
        sortOrder: 1,
        productCount: 18
      },
      {
        id: '20000016',
        name: 'Adidas',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'brand',
        value: 'Adidas',
        isActive: true,
        sortOrder: 2,
        productCount: 22
      },
      {
        id: '20000017',
        name: 'Puma',
        categoryId: '10000004',
        categoryName: 'Ayakkabı',
        type: 'brand',
        value: 'Puma',
        isActive: false,
        sortOrder: 3,
        productCount: 0
      }
    ];

    setCategories(mockCategories);
    setOptions(mockOptions);
  }, []);

  const generateOptionId = (): string => {
    // 8 haneli benzersiz ID oluştur (2 ile başlayan)
    let id: string;
    do {
      id = '2' + Math.floor(1000000 + Math.random() * 9000000).toString();
    } while (options.some(opt => opt.id === id));
    return id;
  };

  const handleAddOption = () => {
    if (!optionName.trim() || !categoryId) return;

    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (!selectedCategory) return;

    const newOption: Option = {
      id: generateOptionId(),
      name: optionName.trim(),
      categoryId,
      categoryName: selectedCategory.name,
      type: optionType,
      value: optionValue.trim(),
      isActive: true,
      sortOrder: options.filter(opt => opt.categoryId === categoryId && opt.type === optionType).length + 1,
      productCount: 0
    };

    setOptions([...options, newOption]);
    closeModal();
  };

  const handleEditOption = () => {
    if (!editingOption || !optionName.trim() || !categoryId) return;

    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (!selectedCategory) return;

    const updatedOptions = options.map(opt =>
      opt.id === editingOption.id
        ? {
            ...opt,
            name: optionName.trim(),
            categoryId,
            categoryName: selectedCategory.name,
            type: optionType,
            value: optionValue.trim()
          }
        : opt
    );

    setOptions(updatedOptions);
    closeModal();
  };

  const handleDeleteOption = (optionId: string) => {
    const updatedOptions = options.filter(opt => opt.id !== optionId);
    setOptions(updatedOptions);
  };

  const handleToggleActive = (optionId: string) => {
    const updatedOptions = options.map(opt =>
      opt.id === optionId ? { ...opt, isActive: !opt.isActive } : opt
    );
    setOptions(updatedOptions);
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
  const totalProducts = options.reduce((sum, opt) => sum + opt.productCount, 0);
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Seçenek Ekle
          </button>
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Seçenek</p>
              <p className="text-2xl font-bold text-blue-600">{totalOptions}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Aktif Seçenekler</p>
              <p className="text-2xl font-bold text-green-600">{activeOptions}</p>
            </div>
            <Settings className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Kategori Sayısı</p>
              <p className="text-2xl font-bold text-purple-600">{categoriesWithOptions}</p>
            </div>
            <Filter className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Toplam Ürün</p>
              <p className="text-2xl font-bold text-orange-600">{totalProducts}</p>
            </div>
            <Settings className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Options by Category */}
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