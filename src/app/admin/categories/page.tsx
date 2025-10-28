'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';
import { toast } from 'react-toastify';
import * as HeroIcons from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  courierCompatible?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
  parentCategories?: string[]; // Bu kategorinin ait olduğu üst kategoriler
  childCategories?: string[]; // Bu kategorinin alt kategorileri
}

interface CategoryRule {
  id: string;
  name: string;
  description?: string;
  categoryIds: string[]; // İlişkili kategorilerin ID'leri
  ruleType: 'parent-child' | 'cross-display'; // Kural türü
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminCategoriesPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRule, setSelectedRule] = useState<CategoryRule | null>(null);
  const [isSuperpassModalOpen, setIsSuperpassModalOpen] = useState(false);
  const [superpassData, setSuperpassData] = useState<{
    code: string;
    expiresAt: Date;
    action: 'single' | 'bulk';
    categoryIds: string[];
  } | null>(null);
  const [enteredSuperpass, setEnteredSuperpass] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    categoryIds: [] as string[],
    ruleType: 'cross-display' as 'parent-child' | 'cross-display',
  });
  const [isRuleCreationEnabled, setIsRuleCreationEnabled] = useState(false);
  const [selectedRuleCategories, setSelectedRuleCategories] = useState<string[]>([]);
  const [selectedRuleType, setSelectedRuleType] = useState<'parent-child' | 'cross-display'>('cross-display');
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    color: '#3b82f6',
    courierCompatible: true,
    isActive: true,
    parentCategories: [] as string[],
    childCategories: [] as string[],
  });

  // Icon render fonksiyonu - SVG icon'lar ve URL'ler için
  const renderIcon = (iconName: string, color?: string) => {
    const iconColor = color || '#666';

    // Eğer icon bir URL ise (SVG URL'i)
    if (iconName && (iconName.startsWith('http') || iconName.startsWith('data:image/svg'))) {
      return (
        <div
          className="w-5 h-5 flex items-center justify-center"
          style={{
            maskImage: `url(${iconName})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            backgroundColor: iconColor,
            WebkitMaskImage: `url(${iconName})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center'
          }}
        />
      );
    }

    // Mevcut switch case - hardcoded SVG icon'lar için
    const iconStyle = { color: iconColor };

    // Heroicons dynamic rendering
    if (iconName) {
      // Kebab-case'i PascalCase'e çevir (puzzle-piece -> PuzzlePiece)
      const pascalCaseIcon = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const IconComponent = (HeroIcons as any)[pascalCaseIcon + 'Icon'];

      if (IconComponent) {
        return (
          <div className="w-5 h-5 flex items-center justify-center" style={iconStyle}>
            <IconComponent className="w-5 h-5" />
          </div>
        );
      }
    }

    // Default plus icon
    const PlusIcon = (HeroIcons as any)['PlusIcon'];
    return (
      <div className="w-5 h-5 flex items-center justify-center" style={iconStyle}>
        {PlusIcon ? <PlusIcon className="w-5 h-5" /> : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" opacity="0.2"/>
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    );
  };

  // Kategori ismini title case'e çeviren fonksiyon
  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchCategories();
  }, [user, role, router]);

  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Category));
    
    // Sort by order field, fallback to name sorting for categories without order
    const sortedCategories = categoriesData.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });
    
    setCategories(sortedCategories);

    // Fetch category rules
    const rulesSnapshot = await getDocs(collection(db, 'categoryRules'));
    const rulesData = rulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CategoryRule));
    
    setCategoryRules(rulesData);
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Kategori adı zorunludur');
      return;
    }

    try {
      // Get the highest order number
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(cat => cat.order || 0)) : 0;
      
      await addDoc(collection(db, 'categories'), {
        ...formData,
        name: formData.name.trim(),
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success('Kategori başarıyla eklendi');
      fetchCategories();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      toast.error('Kategori eklenirken hata oluştu');
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast.error('Kategori adı zorunludur');
      return;
    }

    try {
      // Kategoriyi güncelle
      await updateDoc(doc(db, 'categories', selectedCategory.id), {
        ...formData,
        name: formData.name.trim(),
        updatedAt: new Date(),
      });

      // Eğer kurallaştırma etkinse ve kategoriler seçildiyse kural oluştur
      if (isRuleCreationEnabled && selectedRuleCategories.length > 0) {
        const ruleCategoryIds = [selectedCategory.id, ...selectedRuleCategories];
        
        // Bu kategorilerin zaten bir kuralı var mı kontrol et
        const existingRule = categoryRules.find(rule => 
          rule.categoryIds.some(id => ruleCategoryIds.includes(id))
        );

        if (existingRule) {
          // Mevcut kuralı güncelle
          await updateDoc(doc(db, 'categoryRules', existingRule.id), {
            categoryIds: ruleCategoryIds,
            ruleType: selectedRuleType,
            updatedAt: new Date(),
          });
          toast.success('Kategori güncellendi ve mevcut kural güncellendi');
        } else {
          // Yeni kural oluştur
          await addDoc(collection(db, 'categoryRules'), {
            name: `${formData.name} ve İlişkili Kategoriler`,
            description: `${formData.name} kategorisi ile seçili kategoriler arasındaki ${selectedRuleType === 'cross-display' ? 'çapraz gösterim' : 'üst-alt'} ilişkisi`,
            categoryIds: ruleCategoryIds,
            ruleType: selectedRuleType,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          toast.success('Kategori güncellendi ve yeni kural oluşturuldu');
        }
      } else {
        toast.success('Kategori başarıyla güncellendi');
      }

      fetchCategories();
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      resetForm();
      setIsRuleCreationEnabled(false);
      setSelectedRuleCategories([]);
      setSelectedRuleType('cross-display');
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      toast.error('Kategori güncellenirken hata oluştu');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await createSuperpass('single', [categoryId]);
  };

  const generateSuperpass = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createSuperpass = async (action: 'single' | 'bulk', categoryIds: string[]) => {
    const code = generateSuperpass();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    try {
      // Store superpass in Firebase
      await addDoc(collection(db, 'superpasses'), {
        code,
        expiresAt,
        action,
        categoryIds,
        createdAt: new Date(),
        used: false,
        adminEmail: 'yumminecom@gmail.com'
      });

      // Send email to admin
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'yumminecom@gmail.com',
          additionalData: {
            superpassCode: code,
            action: action === 'single' ? 'Tek Kategori Silme' : 'Toplu Kategori Silme',
            categoryCount: categoryIds.length,
            expiresAt: expiresAt.toISOString(),
            isSuperpass: true
          }
        })
      });

      setSuperpassData({ code, expiresAt, action, categoryIds });
      setIsSuperpassModalOpen(true);

      toast.success('Superpass oluşturuldu ve yöneticiye gönderildi');
    } catch (error) {
      console.error('Superpass oluşturma hatası:', error);
      toast.error('Superpass oluşturulamadı');
    }
  };

  const verifySuperpass = async () => {
    if (!superpassData || !enteredSuperpass) {
      toast.error('Superpass kodunu girin');
      return;
    }

    try {
      // Check if superpass exists and is valid
      const superpassQuery = collection(db, 'superpasses');
      const q = query(superpassQuery, where('code', '==', enteredSuperpass), where('used', '==', false));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Geçersiz veya kullanılmış superpass kodu');
        return;
      }

      const superpassDoc = querySnapshot.docs[0];
      const superpass = superpassDoc.data();

      // Check expiry
      if (new Date() > superpass.expiresAt.toDate()) {
        toast.error('Superpass kodu süresi dolmuş');
        return;
      }

      // Mark as used
      await updateDoc(doc(db, 'superpasses', superpassDoc.id), {
        used: true,
        usedAt: new Date()
      });

      // Perform the delete action
      if (superpassData.action === 'single') {
        await deleteDoc(doc(db, 'categories', superpassData.categoryIds[0]));
        toast.success('Kategori başarıyla silindi');
      } else {
        const deletePromises = superpassData.categoryIds.map(categoryId =>
          deleteDoc(doc(db, 'categories', categoryId))
        );
        await Promise.all(deletePromises);
        toast.success(`${superpassData.categoryIds.length} kategori başarıyla silindi`);
      }

      // Reset state
      setIsSuperpassModalOpen(false);
      setSuperpassData(null);
      setEnteredSuperpass('');
      setSelectedCategories([]);
      setSelectAll(false);
      fetchCategories();

    } catch (error) {
      console.error('Superpass doğrulama hatası:', error);
      toast.error('Superpass doğrulanırken hata oluştu');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      courierCompatible: category.courierCompatible !== false,
      isActive: category.isActive !== false,
      parentCategories: category.parentCategories || [],
      childCategories: category.childCategories || [],
    });
    
    // Kurallaştırma state'lerini sıfırla
    setIsRuleCreationEnabled(false);
    setSelectedRuleCategories([]);
    setSelectedRuleType('cross-display');
    
    setIsEditModalOpen(true);
  };

  const handleCreateRule = async () => {
    if (!ruleFormData.name.trim() || ruleFormData.categoryIds.length < 2) {
      toast.error('Kural adı ve en az 2 kategori seçmelisiniz');
      return;
    }

    try {
      await addDoc(collection(db, 'categoryRules'), {
        ...ruleFormData,
        name: ruleFormData.name.trim(),
        description: ruleFormData.description.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success('Kategori kuralı başarıyla oluşturuldu');
      fetchCategories();
      setIsRuleModalOpen(false);
      resetRuleForm();
    } catch (error) {
      console.error('Kural oluşturma hatası:', error);
      toast.error('Kural oluşturulurken hata oluştu');
    }
  };

  const handleEditRule = async () => {
    if (!selectedRule || !ruleFormData.name.trim() || ruleFormData.categoryIds.length < 2) {
      toast.error('Kural adı ve en az 2 kategori seçmelisiniz');
      return;
    }

    try {
      await updateDoc(doc(db, 'categoryRules', selectedRule.id), {
        ...ruleFormData,
        name: ruleFormData.name.trim(),
        description: ruleFormData.description.trim(),
        updatedAt: new Date(),
      });

      toast.success('Kategori kuralı başarıyla güncellendi');
      fetchCategories();
      setIsRuleModalOpen(false);
      setSelectedRule(null);
      resetRuleForm();
    } catch (error) {
      console.error('Kural güncelleme hatası:', error);
      toast.error('Kural güncellenirken hata oluştu');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteDoc(doc(db, 'categoryRules', ruleId));
      toast.success('Kategori kuralı başarıyla silindi');
      fetchCategories();
    } catch (error) {
      console.error('Kural silme hatası:', error);
      toast.error('Kural silinirken hata oluştu');
    }
  };

  const openRuleModal = (rule?: CategoryRule) => {
    if (rule) {
      setSelectedRule(rule);
      setRuleFormData({
        name: rule.name,
        description: rule.description || '',
        categoryIds: rule.categoryIds,
        ruleType: rule.ruleType,
      });
    } else {
      // Seçili kategorileri kullanarak yeni kural oluştur
      setRuleFormData({
        name: '',
        description: '',
        categoryIds: selectedCategories,
        ruleType: 'cross-display',
      });
    }
    setIsRuleModalOpen(true);
  };

  const resetRuleForm = () => {
    setRuleFormData({
      name: '',
      description: '',
      categoryIds: [],
      ruleType: 'cross-display',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      color: '#3b82f6',
      courierCompatible: true,
      isActive: true,
      parentCategories: [],
      childCategories: [],
    });
    setIsRuleCreationEnabled(false);
    setSelectedRuleCategories([]);
    setSelectedRuleType('cross-display');
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      await updateDoc(doc(db, 'categories', category.id), {
        isActive: !category.isActive,
        updatedAt: new Date(),
      });

      toast.success(`Kategori ${!category.isActive ? 'aktif' : 'pasif'} yapıldı`);
      fetchCategories();
    } catch (error) {
      console.error('Kategori durum güncelleme hatası:', error);
      toast.error('Kategori durumu güncellenirken hata oluştu');
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSelected = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      setSelectAll(newSelected.length === categories.length);
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
      setSelectAll(false);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
      setSelectAll(true);
    }
  };

  const handleBulkDeleteCategories = () => {
    if (selectedCategories.length === 0) {
      toast.error('Lütfen silmek için kategori seçin');
      return;
    }
    createSuperpass('bulk', selectedCategories);
  };

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedCategory) return;

    const draggedIndex = categories.findIndex(cat => cat.id === draggedCategory.id);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    // Reorder categories
    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(dropIndex, 0, removed);

    // Update order field for all categories
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index
    }));

    setCategories(updatedCategories);

    // Update order in Firebase
    try {
      const updatePromises = updatedCategories.map(cat =>
        updateDoc(doc(db, 'categories', cat.id), {
          order: cat.order,
          updatedAt: new Date(),
        })
      );
      await Promise.all(updatePromises);
      toast.success('Kategori sıralaması güncellendi');
    } catch (error) {
      console.error('Sıralama güncelleme hatası:', error);
      toast.error('Sıralama güncellenirken hata oluştu');
      // Revert changes on error
      fetchCategories();
    }

    setDraggedCategory(null);
    setDragOverIndex(null);
  };

  if (!user || role !== 0) {
    return null;
  }

  if (loading) {
    return <div className="text-gray-900 dark:text-white">Yükleniyor...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Site Kategorileri Yönetimi</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Mağazaların kayıt olurken seçeceği kategorileri yönetin
                </p>
              </div>
              <div className="flex space-x-2">
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => handleBulkDeleteCategories()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Seçilenleri Sil ({selectedCategories.length})
                  </button>
                )}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Yeni Kategori Ekle
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İkon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Renk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kurye Teslimi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.map((category, index) => (
                    <tr 
                      key={category.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        dragOverIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, category)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center cursor-move">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                          <span className="ml-2 text-sm text-gray-500">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategorySelection(category.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderIcon(category.icon || '', category.color)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.icon || 'Belirtilmemiş'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          ></div>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">
                            {category.color || '#3b82f6'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.courierCompatible !== false
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {category.courierCompatible !== false ? 'Evet' : 'Hayır'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.isActive !== false}
                              onChange={() => toggleCategoryStatus(category)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {category.isActive !== false ? 'Aktif' : 'Pasif'}
                            </span>
                          </label>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(category)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Düzenle"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Sil"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Rules Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Kategori Kuralları</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Kategoriler arası ilişkileri ve çapraz gösterim kurallarını yönetin
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {categoryRules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                      {rule.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500 mr-2">İlişkili Kategoriler:</span>
                        <div className="flex flex-wrap gap-1">
                          {rule.categoryIds.map((categoryId) => {
                            const category = categories.find(cat => cat.id === categoryId);
                            return category ? (
                              <span key={categoryId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {category.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.ruleType === 'cross-display'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        }`}>
                          {rule.ruleType === 'cross-display' ? 'Çapraz Gösterim' : 'Üst-Alt İlişkisi'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openRuleModal(rule)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Düzenle"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Sil"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {categoryRules.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Henüz kural yok</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Kategorileri seçip kural oluşturabilirsiniz
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Yeni Kategori Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Örn: Elektronik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon (SVG URL veya Hazır İkon)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Örn: https://freesvgicons.com/icon.svg veya shirt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  SVG URL'i (freesvgicons.com vb.) veya hazır ikon adı (shirt, laptop, home vb.) girin
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon Rengi
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  İkonun rengini seçin (hex kodu veya renk seçici ile)
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.courierCompatible}
                    onChange={(e) => setFormData(prev => ({ ...prev, courierCompatible: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Kurye ile Teslim Edilebilir</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Üst Kategoriler (Bu kategorinin ait olduğu kategoriler)
                </label>
                <select
                  multiple
                  value={formData.parentCategories}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, parentCategories: selectedOptions }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-h-32 overflow-y-auto"
                >
                  {categories
                    .filter(cat => cat.id !== selectedCategory?.id) // Kendisini üst kategori olarak seçemesin
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bu kategorinin ürünleri seçilen üst kategorilerde de gösterilecek
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Kategoriler (Bu kategoriye ait alt kategoriler)
                </label>
                <select
                  multiple
                  value={formData.childCategories}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, childCategories: selectedOptions }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-h-32 overflow-y-auto"
                >
                  {categories
                    .filter(cat => cat.id !== selectedCategory?.id) // Kendisini alt kategori olarak seçemesin
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seçilen alt kategorilerin ürünleri bu kategoride de gösterilecek
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Kategori Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon (SVG URL veya Hazır İkon)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  SVG URL'i (freesvgicons.com için cdn ve https://heroicons.com/ icon adları ) (shirt, laptop, home vb.) girin
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon Rengi
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  İkonun rengini seçin (hex kodu veya renk seçici ile)
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.courierCompatible}
                    onChange={(e) => setFormData(prev => ({ ...prev, courierCompatible: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Kurye ile Teslim Edilebilir</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Üst Kategoriler (Bu kategorinin ait olduğu kategoriler)
                </label>
                <select
                  multiple
                  value={formData.parentCategories}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, parentCategories: selectedOptions }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-h-32 overflow-y-auto"
                >
                  {categories
                    .filter(cat => cat.id !== selectedCategory?.id) // Kendisini üst kategori olarak seçemesin
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bu kategorinin ürünleri seçilen üst kategorilerde de gösterilecek
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Kategoriler (Bu kategoriye ait alt kategoriler)
                </label>
                <select
                  multiple
                  value={formData.childCategories}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, childCategories: selectedOptions }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-h-32 overflow-y-auto"
                >
                  {categories
                    .filter(cat => cat.id !== selectedCategory?.id) // Kendisini alt kategori olarak seçemesin
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seçilen alt kategorilerin ürünleri bu kategoride de gösterilecek
                </p>
              </div>

              {/* Kural Oluşturma Bölümü */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={isRuleCreationEnabled}
                    onChange={(e) => setIsRuleCreationEnabled(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bu Kategoriyi Kurallaştır
                  </label>
                </div>

                {isRuleCreationEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kural Türü
                      </label>
                      <select
                        value={selectedRuleType}
                        onChange={(e) => setSelectedRuleType(e.target.value as 'parent-child' | 'cross-display')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="cross-display">Çapraz Gösterim - Ürünler seçili kategorilerin hepsinde görünür</option>
                        <option value="parent-child">Üst-Alt İlişkisi - Hiyerarşik kategori yapısı</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        İlişkili Kategoriler (En az 1 kategori seçin)
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                        {categories
                          .filter(cat => cat.id !== selectedCategory?.id) // Kendisini seçemesin
                          .map((category) => (
                            <label key={category.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedRuleCategories.includes(category.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRuleCategories(prev => [...prev, category.id]);
                                  } else {
                                    setSelectedRuleCategories(prev => prev.filter(id => id !== category.id));
                                  }
                                }}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="ml-3 flex items-center">
                                {renderIcon(category.icon || '', category.color)}
                                <span className="ml-2 text-sm text-gray-900 dark:text-white">{category.name}</span>
                              </div>
                            </label>
                          ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Seçili: {selectedRuleCategories.length} kategori
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCategory(null);
                  resetForm();
                  setIsRuleCreationEnabled(false);
                  setSelectedRuleCategories([]);
                  setSelectedRuleType('cross-display');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {selectedRule ? 'Kategori Kuralını Düzenle' : 'Yeni Kategori Kuralı Oluştur'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kural Adı *
                </label>
                <input
                  type="text"
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Örn: Elektronik Ürünler Grubu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Bu kuralın ne yaptığını açıklayın..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kural Türü
                </label>
                <select
                  value={ruleFormData.ruleType}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, ruleType: e.target.value as 'parent-child' | 'cross-display' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="cross-display">Çapraz Gösterim - Ürünler seçili kategorilerin hepsinde görünür</option>
                  <option value="parent-child">Üst-Alt İlişkisi - Hiyerarşik kategori yapısı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İlişkili Kategoriler * (En az 2 kategori seçin)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ruleFormData.categoryIds.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRuleFormData(prev => ({
                              ...prev,
                              categoryIds: [...prev.categoryIds, category.id]
                            }));
                          } else {
                            setRuleFormData(prev => ({
                              ...prev,
                              categoryIds: prev.categoryIds.filter(id => id !== category.id)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        {renderIcon(category.icon || '', category.color)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seçili: {ruleFormData.categoryIds.length} kategori
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsRuleModalOpen(false);
                  setSelectedRule(null);
                  resetRuleForm();
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
              <button
                onClick={selectedRule ? handleEditRule : handleCreateRule}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {selectedRule ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Superpass Modal */}
      {isSuperpassModalOpen && superpassData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Superpass Doğrulama</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Güvenlik Doğrulaması Gerekli
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        {superpassData.action === 'single'
                          ? 'Kategori silme işlemi için'
                          : `${superpassData.categoryIds.length} kategori silme işlemi için`
                        } superpass kodu yumminecom@gmail.com adresine gönderildi.
                      </p>
                      <p className="mt-2">
                        Superpass kodu 10 dakika geçerlidir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Superpass Kodu *
                </label>
                <input
                  type="text"
                  value={enteredSuperpass}
                  onChange={(e) => setEnteredSuperpass(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono tracking-wider"
                  placeholder="ABC12345"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email adresinizden gelen 8 haneli kodu girin
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsSuperpassModalOpen(false);
                  setSuperpassData(null);
                  setEnteredSuperpass('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
              <button
                onClick={verifySuperpass}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {superpassData.action === 'single' ? 'Kategoriyi Sil' : 'Kategorileri Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}