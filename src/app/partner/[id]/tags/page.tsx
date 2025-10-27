'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Tag, Hash, Package, Palette, Search, Star, TrendingUp, Sparkles, Percent, Clock, Zap, List, Grid3X3 } from 'lucide-react';

interface Tag {
  id: string; // 8 haneli sayı
  name: string;
  category: string;
  color: string;
  description?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  icon?: string; // İkon adı
}

interface TagCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  tags: Tag[];
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

const tagColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const tagCategories: TagCategory[] = [
  {
    id: 'popularity',
    name: 'Popülerlik',
    description: 'Popülerlik ve müşteri tercihleri',
    color: '#f59e0b',
    icon: 'star',
    tags: []
  },
  {
    id: 'promotion',
    name: 'Kampanya',
    description: 'İndirim ve kampanya etiketleri',
    color: '#ef4444',
    icon: 'percent',
    tags: []
  },
  {
    id: 'seasonal',
    name: 'Mevsimsel',
    description: 'Sezon ve dönem bazlı etiketler',
    color: '#22c55e',
    icon: 'sparkles',
    tags: []
  },
  {
    id: 'urgency',
    name: 'Aciliyet',
    description: 'Sınırlı stok ve zaman baskısı',
    color: '#f97316',
    icon: 'clock',
    tags: []
  },
  {
    id: 'quality',
    name: 'Kalite',
    description: 'Kalite ve özellik etiketleri',
    color: '#8b5cf6',
    icon: 'zap',
    tags: []
  },
  {
    id: 'trend',
    name: 'Trend',
    description: 'Trend ve moda etiketleri',
    color: '#ec4899',
    icon: 'trending-up',
    tags: []
  },
  {
    id: 'other',
    name: 'Diğer',
    description: 'Genel etiketler',
    color: '#6b7280',
    icon: 'tag',
    tags: []
  }
];

export default function TagsPage() {
  const params = useParams();
  const partnerId = params.id as string;
  const [tags, setTags] = useState<Tag[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // View mode'u localStorage'dan yükle
  useEffect(() => {
    const savedViewMode = localStorage.getItem('tags-view-mode');
    if (savedViewMode === 'list' || savedViewMode === 'card') {
      setViewMode(savedViewMode);
    }
  }, []);

  // View mode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('tags-view-mode', viewMode);
  }, [viewMode]);

  // Form states
  const [tagName, setTagName] = useState('');
  const [tagCategory, setTagCategory] = useState('');
  const [tagColor, setTagColor] = useState(tagColors[0]);
  const [tagDescription, setTagDescription] = useState('');
  const [tagIcon, setTagIcon] = useState('tag');

  // Etiketleri Firebase'den çek
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/tags?partnerId=${partnerId}`);
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    if (partnerId) {
      fetchTags();
    }
  }, [partnerId]);

  const handleAddTag = async () => {
    if (!tagName.trim() || !tagCategory) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          name: tagName.trim(),
          category: tagCategory,
          color: tagColor,
          description: tagDescription.trim(),
          icon: tagIcon
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        closeModal();
      } else {
        console.error('Failed to add tag');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !tagName.trim() || !tagCategory) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: editingTag.id,
          name: tagName.trim(),
          category: tagCategory,
          color: tagColor,
          description: tagDescription.trim(),
          icon: tagIcon
        }),
      });

      if (response.ok) {
        const updatedTag = await response.json();
        const updatedTags = tags.map(tag =>
          tag.id === editingTag.id ? updatedTag : tag
        );
        setTags(updatedTags);
        closeModal();
      } else {
        console.error('Failed to update tag');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/tags?id=${tagId}&partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedTags = tags.filter(tag => tag.id !== tagId);
        setTags(updatedTags);
      } else {
        console.error('Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleToggleActive = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId,
          id: tagId,
          isActive: !tag.isActive
        }),
      });

      if (response.ok) {
        const updatedTag = await response.json();
        const updatedTags = tags.map(tag =>
          tag.id === tagId ? updatedTag : tag
        );
        setTags(updatedTags);
      } else {
        console.error('Failed to toggle tag status');
      }
    } catch (error) {
      console.error('Error toggling tag status:', error);
    }
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagCategory(tag.category);
    setTagColor(tag.color);
    setTagDescription(tag.description || '');
    setTagIcon(tag.icon || 'tag');
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTag(null);
    setTagName('');
    setTagCategory('');
    setTagColor(tagColors[0]);
    setTagDescription('');
    setTagIcon('tag');
  };

  const getCategoryInfo = (categoryId: string) => {
    return tagCategories.find(cat => cat.id === categoryId) || tagCategories.find(cat => cat.id === 'other')!;
  };

  const getTagsByCategory = (categoryId: string) => {
    return tags.filter(tag => tag.category === categoryId);
  };

  const getFilteredTags = () => {
    if (!searchTerm) return tags;
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="h-4 w-4" />;
      case 'percent':
        return <Percent className="h-4 w-4" />;
      case 'sparkles':
        return <Sparkles className="h-4 w-4" />;
      case 'clock':
        return <Clock className="h-4 w-4" />;
      case 'zap':
        return <Zap className="h-4 w-4" />;
      case 'trending-up':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const totalTags = tags.length;
  const activeTags = tags.filter(tag => tag.isActive).length;
  const totalUsage = tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0);
  const categoriesWithTags = new Set(tags.map(tag => tag.category)).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Ürün Etiketleri
            </h1>
            <p className="mt-2 text-gray-400">
              Ürünlerinizi etiketlerle kategorize edin ve müşterilere görünür kılın
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
              Etiket Ekle
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
            placeholder="Etiket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Etiket"
          value={totalTags}
          icon={Tag}
          color="text-blue-600"
        />
        <StatCard
          title="Aktif Etiketler"
          value={activeTags}
          icon={Tag}
          color="text-green-600"
        />
        <StatCard
          title="Kategori Sayısı"
          value={categoriesWithTags}
          icon={Package}
          color="text-purple-600"
          onClick={() => window.location.href = `/partner/${partnerId}/categories`}
        />
        <StatCard
          title="Toplam Kullanım"
          value={totalUsage}
          icon={Hash}
          color="text-orange-600"
          onClick={() => window.location.href = `/partner/${partnerId}/urun`}
        />
      </div>

      {/* Tags by Category */}
      {viewMode === 'list' ? (
        <div className="space-y-8">
          {tagCategories.map((category) => {
            const categoryTags = getTagsByCategory(category.id).filter(tag =>
              getFilteredTags().some(filteredTag => filteredTag.id === tag.id)
            );

            if (categoryTags.length === 0) return null;

            return (
              <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="p-6 border-b border-gray-700" style={{ backgroundColor: `${category.color}15` }}>
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {getIconComponent(category.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <p className="text-sm text-gray-400">{category.description}</p>
                    </div>
                    <span className="ml-auto text-sm text-gray-400">
                      {categoryTags.length} etiket
                    </span>
                  </div>
                </div>

                {/* Category Tags */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryTags.map((tag) => (
                      <div
                        key={tag.id}
                        className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
                          tag.isActive
                            ? 'border-gray-600 bg-gray-750 hover:border-gray-500'
                            : 'border-red-700 bg-gray-750 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div
                              className="p-1.5 rounded"
                              style={{ backgroundColor: tag.color }}
                            >
                              {getIconComponent(tag.icon || 'tag')}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(tag.id);
                              }}
                              className={`w-2 h-2 rounded-full ${
                                tag.isActive ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              title={tag.isActive ? 'Aktif' : 'Pasif'}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className={`font-medium ${tag.isActive ? 'text-white' : 'text-gray-400'}`}>
                            {tag.name}
                          </h4>
                          {tag.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {tag.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{tag.usageCount} kullanım</span>
                          <span>ID: {tag.id}</span>
                        </div>

                        <div className="flex items-center justify-end space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(tag);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-400 transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTag(tag.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {getFilteredTags().length === 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">
                {searchTerm ? 'Aramanızla eşleşen etiket bulunamadı' : 'Henüz etiket yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Farklı bir arama terimi deneyin' : 'İlk etiketinizi eklemek için yukarıdaki butona tıklayın.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {getFilteredTags().map((tag) => {
            const category = getCategoryInfo(tag.category);

            return (
              <div
                key={tag.id}
                className={`bg-gray-800 border rounded-lg overflow-hidden hover:border-gray-600 transition-colors cursor-pointer ${
                  tag.isActive ? 'border-gray-700' : 'border-red-700 opacity-75'
                }`}
                onClick={() => handleToggleActive(tag.id)}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: tag.color }}
                    >
                      {getIconComponent(tag.icon || 'tag')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(tag.id);
                        }}
                        className={`w-3 h-3 rounded-full ${
                          tag.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={tag.isActive ? 'Aktif' : 'Pasif'}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(tag);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-400 transition-colors rounded"
                        title="Düzenle"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(tag.id);
                        }}
                        className="p-1.5 text-red-600 hover:text-red-400 transition-colors rounded"
                        title="Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${tag.isActive ? 'text-white' : 'text-gray-400'}`}>
                      {tag.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{category.name}</p>
                    <div className="text-xs text-gray-500 font-mono">ID: {tag.id}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Description */}
                    {tag.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {tag.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="bg-gray-700 rounded p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{tag.usageCount}</div>
                      <div className="text-xs text-gray-400">Kullanım</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {getFilteredTags().length === 0 && (
            <div className="col-span-full bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">
                {searchTerm ? 'Aramanızla eşleşen etiket bulunamadı' : 'Henüz etiket yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Farklı bir arama terimi deneyin' : 'İlk etiketinizi eklemek için yukarıdaki butona tıklayın.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Tag Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingTag ? 'Etiketi Düzenle' : 'Yeni Etiket Ekle'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Etiket Adı *
                  </label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Etiket adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={tagCategory}
                    onChange={(e) => setTagCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kategori seçin</option>
                    {tagCategories.map((category) => (
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
                    İkon
                  </label>
                  <select
                    value={tagIcon}
                    onChange={(e) => setTagIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tag">Etiket</option>
                    <option value="star">Yıldız</option>
                    <option value="percent">Yüzde</option>
                    <option value="sparkles">Kıvılcım</option>
                    <option value="clock">Saat</option>
                    <option value="zap">Şimşek</option>
                    <option value="trending-up">Trend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Önizleme
                  </label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg">
                    <div
                      className="p-1.5 rounded"
                      style={{ backgroundColor: tagColor }}
                    >
                      {getIconComponent(tagIcon)}
                    </div>
                    <span className="text-sm text-gray-300">{tagName || 'Önizleme'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Renk Seçimi
                </label>
                <div className="flex flex-wrap gap-2">
                  {tagColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTagColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        tagColor === color ? 'border-white scale-110' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Renk: ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Etiket açıklaması (opsiyonel)"
                />
              </div>

              {editingTag && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Hash className="h-4 w-4" />
                    <span>Etiket ID: {editingTag.id}</span>
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
                onClick={editingTag ? handleEditTag : handleAddTag}
                disabled={!tagName.trim() || !tagCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingTag ? 'Kaydet' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}