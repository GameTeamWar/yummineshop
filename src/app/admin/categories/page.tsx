'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';
import { toast } from 'react-toastify';
import * as HeroIcons from '@heroicons/react/24/outline';
import SuperpassModal, { SuperpassData } from '@/components/SuperpassModal';

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
  productCategories?: string[]; // Bu mağaza kategorisine bağlı ürün kategorileri
  level?: number; // Hiyerarşik seviye (UI için)
  hasChildren?: boolean; // Alt kategorisi var mı (UI için)
  children?: Category[]; // Alt kategoriler (UI için)
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

interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  order?: number;
  childCategories?: string[]; // Bu kategorinin alt kategorileri
}

export default function AdminCategoriesPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isProductCategoryModalOpen, setIsProductCategoryModalOpen] = useState(false);
  const [isEditProductCategoryModalOpen, setIsEditProductCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | null>(null);
  const [selectedRule, setSelectedRule] = useState<CategoryRule | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'product'>('store');
  const [isSuperpassModalOpen, setIsSuperpassModalOpen] = useState(false);
  const [superpassData, setSuperpassData] = useState<SuperpassData | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const [selectAllProductCategories, setSelectAllProductCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<Category | null>(null);
  const [draggedProductCategory, setDraggedProductCategory] = useState<ProductCategory | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);
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
    childCategories: [] as string[], // Bu kategorinin alt kategorileri
    productCategories: [] as string[], // Bu mağaza kategorisine bağlı ürün kategorileri
  });
  const [productCategoryFormData, setProductCategoryFormData] = useState({
    name: '',
    icon: '',
    color: '#3b82f6',
    isActive: true,
    childCategories: [] as string[], // Bu kategorinin alt kategorileri
  });

  // Search states for category selection
  const [storeCategorySearch, setStoreCategorySearch] = useState('');
  const [productCategorySearch, setProductCategorySearch] = useState('');
  const [ruleCategorySearch, setRuleCategorySearch] = useState('');
  
  // Search states for table filtering
  const [storeCategoriesTableSearch, setStoreCategoriesTableSearch] = useState('');
  const [productCategoriesTableSearch, setProductCategoriesTableSearch] = useState('');

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

  const fetchProductCategories = async () => {
    const productCategoriesSnapshot = await getDocs(collection(db, 'productCategories'));
    const productCategoriesData = productCategoriesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ProductCategory))
      .sort((a, b) => {
        const aOrder = a.order || 0;
        const bOrder = b.order || 0;
        return aOrder - bOrder;
      });

    setProductCategories(productCategoriesData);
  };

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchCategories();
    fetchProductCategories();
  }, [user, role, router]);

  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Category));
    
    // Hiyerarşik sıralama: Ana kategoriler önce, sonra alt kategoriler
    const sortedCategories = categoriesData.sort((a, b) => {
      // Bir kategorinin parentCategories'ı varsa alt kategoridir
      const aIsChild = categoriesData.some(cat => cat.childCategories?.includes(a.id));
      const bIsChild = categoriesData.some(cat => cat.childCategories?.includes(b.id));
      
      if (!aIsChild && bIsChild) return -1;
      if (aIsChild && !bIsChild) return 1;
      
      // Aynı seviyedeki kategoriler için order'a göre sırala
      if (!aIsChild && !bIsChild) {
        const aOrder = a.order || 0;
        const bOrder = b.order || 0;
        return aOrder - bOrder;
      }
      
      // Alt kategoriler için order'a göre sırala
      const aOrder = a.order || 0;
      const bOrder = b.order || 0;
      return aOrder - bOrder;
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

  const generateSuperpass = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createSuperpass = async (action: 'single' | 'bulk' | 'single-product' | 'bulk-product', categoryIds: string[]) => {
    const code = generateSuperpass();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 30);

    try {
      await addDoc(collection(db, 'superpasses'), {
        code,
        expiresAt,
        action,
        categoryIds,
        createdAt: new Date(),
        used: false,
        adminEmail: 'yumminecom@gmail.com'
      });

      const actionText = action === 'single' ? 'Tek Mağaza Kategorisi Silme' :
                        action === 'bulk' ? 'Toplu Mağaza Kategorisi Silme' :
                        action === 'single-product' ? 'Tek Ürün Kategorisi Silme' :
                        'Toplu Ürün Kategorisi Silme';

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yumminecom@gmail.com',
          additionalData: {
            superpassCode: code,
            action: actionText,
            categoryCount: categoryIds.length,
            expiresAt: expiresAt.toISOString(),
            isSuperpass: true
          }
        })
      });

      return { code, expiresAt, action, categoryIds };
    } catch (error) {
      console.error('Superpass oluşturma hatası:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const superpassData = await createSuperpass('single', [categoryId]);
      setSuperpassData(superpassData);
      setIsSuperpassModalOpen(true);
      toast.success('Superpass oluşturuldu ve yöneticiye gönderildi');
    } catch (error) {
      toast.error('Superpass oluşturulamadı');
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
      childCategories: category.childCategories || [],
      productCategories: category.productCategories || [],
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

  const openEditProductCategoryModal = (category: ProductCategory) => {
    setSelectedProductCategory(category);
    setProductCategoryFormData({
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      isActive: category.isActive !== false,
      childCategories: category.childCategories || [],
    });
    setIsEditProductCategoryModalOpen(true);
  };

  const handleAddProductCategory = async () => {
    if (!productCategoryFormData.name.trim()) {
      toast.error('Ürün kategori adı zorunludur');
      return;
    }

    try {
      const maxOrder = productCategories.length > 0 ? Math.max(...productCategories.map(cat => cat.order || 0)) : 0;

      await addDoc(collection(db, 'productCategories'), {
        ...productCategoryFormData,
        name: productCategoryFormData.name.trim(),
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success('Ürün kategorisi başarıyla eklendi');
      fetchProductCategories();
      setIsProductCategoryModalOpen(false);
      resetProductCategoryForm();
    } catch (error) {
      console.error('Ürün kategorisi ekleme hatası:', error);
      toast.error('Ürün kategorisi eklenirken hata oluştu');
    }
  };

  const handleEditProductCategory = async () => {
    if (!selectedProductCategory || !productCategoryFormData.name.trim()) {
      toast.error('Ürün kategori adı zorunludur');
      return;
    }

    try {
      await updateDoc(doc(db, 'productCategories', selectedProductCategory.id), {
        ...productCategoryFormData,
        name: productCategoryFormData.name.trim(),
        updatedAt: new Date(),
      });

      toast.success('Ürün kategorisi başarıyla güncellendi');
      fetchProductCategories();
      setIsEditProductCategoryModalOpen(false);
      setSelectedProductCategory(null);
      resetProductCategoryForm();
    } catch (error) {
      console.error('Ürün kategorisi güncelleme hatası:', error);
      toast.error('Ürün kategorisi güncellenirken hata oluştu');
    }
  };

  const handleDeleteProductCategory = async (categoryId: string) => {
    try {
      const superpassData = await createSuperpass('single-product', [categoryId]);
      setSuperpassData(superpassData);
      setIsSuperpassModalOpen(true);
    } catch (error) {
      toast.error('Superpass oluşturulamadı');
    }
  };

  const handleBulkDeleteProductCategories = async () => {
    if (selectedProductCategories.length === 0) {
      toast.error('Lütfen silmek için ürün kategorisi seçin');
      return;
    }

    try {
      const superpassData = await createSuperpass('bulk-product', selectedProductCategories);
      setSuperpassData(superpassData);
      setIsSuperpassModalOpen(true);
    } catch (error) {
      toast.error('Superpass oluşturulamadı');
    }
  };

  const toggleProductCategorySelection = (categoryId: string) => {
    setSelectedProductCategories(prev => {
      const newSelected = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      setSelectAllProductCategories(newSelected.length === productCategories.length);
      return newSelected;
    });
  };

  const toggleSelectAllProductCategories = () => {
    if (selectAllProductCategories) {
      setSelectedProductCategories([]);
      setSelectAllProductCategories(false);
    } else {
      setSelectedProductCategories(productCategories.map(cat => cat.id));
      setSelectAllProductCategories(true);
    }
  };

  const resetProductCategoryForm = () => {
    setProductCategoryFormData({
      name: '',
      icon: '',
      color: '#3b82f6',
      isActive: true,
      childCategories: [],
    });
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
      childCategories: [],
      productCategories: [],
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

    createSuperpass('bulk', selectedCategories).then((superpassData) => {
      setSuperpassData(superpassData);
      setIsSuperpassModalOpen(true);
    }).catch(() => {
      toast.error('Superpass oluşturulamadı');
    });
  };

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, category: Category) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(category);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = async (e: React.DragEvent, dropCategory: Category) => {
    e.preventDefault();
    
    if (!draggedCategory) return;

    // For now, we'll implement a simple reordering within the same level
    // In a full implementation, you'd need to handle parent-child relationships
    const draggedIndex = categories.findIndex(cat => cat.id === draggedCategory.id);
    if (draggedIndex === -1) return;

    // Simple reordering - move dragged category to position of drop category
    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    const dropIndex = newCategories.findIndex(cat => cat.id === dropCategory.id);
    
    if (dropIndex !== -1) {
      newCategories.splice(dropIndex, 0, removed);
    }

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
      console.error('Kategori sıralama güncelleme hatası:', error);
      toast.error('Kategori sıralaması güncellenirken hata oluştu');
      // Revert changes on error
      fetchCategories();
    }

    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Ana kategorileri al (alt kategorisi olmayanlar)
  const getMainCategories = () => {
    return categories.filter(category => 
      !categories.some(cat => cat.childCategories?.includes(category.id))
    );
  };

  // Bir kategorinin alt kategorilerini al
  const getChildCategories = (parentCategoryId: string) => {
    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    if (!parentCategory?.childCategories) return [];
    
    return categories.filter(cat => parentCategory.childCategories!.includes(cat.id));
  };

  // Hiyerarşik kategori ağacı oluştur
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const mainCategories = getMainCategories();
    const result: Category[] = [];

    const processCategory = (category: Category, level: number = 0): Category => {
      return {
        ...category,
        level,
        hasChildren: getChildCategories(category.id).length > 0,
        children: getChildCategories(category.id).map(child => processCategory(child, level + 1))
      };
    };

    mainCategories.forEach(category => {
      result.push(processCategory(category));
    });

    return result;
  };

  // Kategori ağacını render et
  const renderCategoryTree = (categoryTree: Category[], level: number = 0) => {
    return categoryTree.map((category, index) => {
      const hasChildren = category.hasChildren;
      const isExpanded = expandedCategories.has(category.id);
      const paddingLeft = level * 24; // Her seviye için 24px padding

      return (
        <React.Fragment key={category.id}>
          <tr 
            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              dragOverCategory?.id === category.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, category)}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category)}
          >
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
              <div className="flex items-center" style={{ paddingLeft }}>
                {hasChildren && (
                  <button
                    onClick={() => toggleCategoryExpansion(category.id)}
                    className="mr-1 sm:mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {isExpanded ? (
                      <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-3 sm:w-6" />}
                <div className="flex items-center cursor-move">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500">#{level + 1}.{index + 1}</span>
                </div>
              </div>
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategorySelection(category.id)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {renderIcon(category.icon || '', category.color)}
                <div className="ml-2 sm:ml-3">
                  <div className={`text-xs sm:text-sm font-medium text-gray-900 dark:text-white ${level > 0 ? 'ml-2 sm:ml-4' : ''}`}>
                    {level > 0 && '└─ '}{category.name}
                    {level > 0 && (
                      <span className="ml-1 sm:ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (Alt)
                      </span>
                    )}
                  </div>
                  {/* Mobil cihazlarda ek bilgiler */}
                  <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                    <div>İkon: {category.icon || 'Belirtilmemiş'}</div>
                    <div className="flex items-center">
                      Renk: 
                      <div
                        className="w-3 h-3 rounded-full border ml-1 mr-1"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      ></div>
                      {category.color || '#3b82f6'}
                    </div>
                    <div>Kurye: {category.courierCompatible !== false ? 'Evet' : 'Hayır'}</div>
                  </div>
                </div>
              </div>
            </td>
            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
              {category.icon || 'Belirtilmemiş'}
            </td>
            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                ></div>
                <span className="ml-2 text-xs sm:text-sm text-gray-900 dark:text-white">
                  {category.color || '#3b82f6'}
                </span>
              </div>
            </td>
            <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                category.courierCompatible !== false
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {category.courierCompatible !== false ? 'Evet' : 'Hayır'}
              </span>
            </td>
            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
              <div className="flex items-center space-x-1 sm:space-x-3">
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category.isActive !== false}
                    onChange={() => toggleCategoryStatus(category)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-300">
                    {category.isActive !== false ? 'Aktif' : 'Pasif'}
                  </span>
                </label>
                
                {/* Action Buttons */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Düzenle"
                  >
                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Sil"
                  >
                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </td>
          </tr>
          {/* Alt kategorileri göster */}
          {hasChildren && isExpanded && category.children && renderCategoryTree(category.children, level + 1)}
        </React.Fragment>
      );
    });
  };
  const handleProductDragStart = (e: React.DragEvent, category: ProductCategory) => {
    setDraggedProductCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProductDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverProductIndex(index);
  };

  const handleProductDragEnd = () => {
    setDraggedProductCategory(null);
    setDragOverProductIndex(null);
  };

  const handleProductDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedProductCategory) return;

    const draggedIndex = productCategories.findIndex(cat => cat.id === draggedProductCategory.id);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    // Reorder product categories
    const newProductCategories = [...productCategories];
    const [removed] = newProductCategories.splice(draggedIndex, 1);
    newProductCategories.splice(dropIndex, 0, removed);

    // Update order field for all product categories
    const updatedProductCategories = newProductCategories.map((cat, index) => ({
      ...cat,
      order: index
    }));

    setProductCategories(updatedProductCategories);

    // Update order in Firebase
    try {
      const updatePromises = updatedProductCategories.map(cat =>
        updateDoc(doc(db, 'productCategories', cat.id), {
          order: cat.order,
          updatedAt: new Date(),
        })
      );
      await Promise.all(updatePromises);
      toast.success('Ürün kategori sıralaması güncellendi');
    } catch (error) {
      console.error('Ürün kategori sıralama güncelleme hatası:', error);
      toast.error('Ürün kategori sıralaması güncellenirken hata oluştu');
      // Revert changes on error
      fetchProductCategories();
    }

    setDraggedProductCategory(null);
    setDragOverProductIndex(null);
  };

  if (!user || role !== 0) {
    return null;
  }

  if (loading) {
    return <div className="text-gray-900 dark:text-white">Yükleniyor...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 ">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col sm:flex-row">
              <button
                onClick={() => setActiveTab('store')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 sm:border-b-2 ${
                  activeTab === 'store'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Mağaza Kategorileri
              </button>
              <button
                onClick={() => setActiveTab('product')}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 sm:border-b-2 ${
                  activeTab === 'product'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Ürün Kategorileri
              </button>
            </nav>
          </div>

          {/* Store Categories Tab */}
          {activeTab === 'store' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mağaza Kategorileri Yönetimi</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Mağazaların kayıt olurken seçeceği kategorileri yönetin
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      value={storeCategoriesTableSearch}
                      onChange={(e) => setStoreCategoriesTableSearch(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kategori ara..."
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => handleBulkDeleteCategories()}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Sil ({selectedCategories.length})
                      </button>
                    )}
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                    >
                      Yeni Kategori
                    </button>
                  </div>
                </div>
              </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <span className="hidden sm:inline">Sıra</span>
                      <span className="sm:hidden">#</span>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İkon
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Renk
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kurye
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {renderCategoryTree(buildCategoryTree(
                    categories.filter(category => 
                      category.name.toLowerCase().includes(storeCategoriesTableSearch.toLowerCase())
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Categories Tab */}
          {activeTab === 'product' && (
            <div className="p-4 sm:p-5 ">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ürün Kategorileri Yönetimi</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Mağazalar ürün eklerken seçeceği kategorileri yönetin
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      value={productCategoriesTableSearch}
                      onChange={(e) => setProductCategoriesTableSearch(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ürün kategorisi ara..."
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedProductCategories.length > 0 && (
                      <button
                        onClick={() => handleBulkDeleteProductCategories()}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Sil ({selectedProductCategories.length})
                      </button>
                    )}
                    <button
                      onClick={() => setIsProductCategoryModalOpen(true)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                    >
                      Yeni Kategori
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <span className="hidden sm:inline">Sıra</span>
                        <span className="sm:hidden">#</span>
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectAllProductCategories}
                          onChange={toggleSelectAllProductCategories}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ürün Kategorisi
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        İkon
                      </th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Renk
                      </th>
                      <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Alt Kategoriler
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {productCategories
                      .filter(category => category.name.toLowerCase().includes(productCategoriesTableSearch.toLowerCase()))
                      .map((category, index) => (
                      <tr 
                        key={category.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          dragOverProductIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleProductDragStart(e, category)}
                        onDragOver={(e) => handleProductDragOver(e, index)}
                        onDrop={(e) => handleProductDrop(e, index)}
                        onDragEnd={handleProductDragEnd}
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center cursor-move">
                            <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProductCategories.includes(category.id)}
                            onChange={() => toggleProductCategorySelection(category.id)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {renderIcon(category.icon || '', category.color)}
                            <div className="ml-2 sm:ml-3">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                {category.name}
                              </div>
                              {/* Mobil cihazlarda ek bilgiler */}
                              <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                                <div>İkon: {category.icon || 'Belirtilmemiş'}</div>
                                <div className="flex items-center">
                                  Renk: 
                                  <div
                                    className="w-3 h-3 rounded-full border ml-1 mr-1"
                                    style={{ backgroundColor: category.color || '#3b82f6' }}
                                  ></div>
                                  {category.color || '#3b82f6'}
                                </div>
                                {category.childCategories && category.childCategories.length > 0 && (
                                  <div>Alt Kategoriler: {category.childCategories.length} adet</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                          {category.icon || 'Belirtilmemiş'}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: category.color || '#3b82f6' }}
                            ></div>
                            <span className="ml-2 text-xs sm:text-sm text-gray-900 dark:text-white">
                              {category.color || '#3b82f6'}
                            </span>
                          </div>
                        </td>
                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                          {category.childCategories && category.childCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {category.childCategories.slice(0, 2).map(childId => {
                                const childCategory = productCategories.find(cat => cat.id === childId);
                                return childCategory ? (
                                  <span key={childId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    {childCategory.name}
                                  </span>
                                ) : null;
                              })}
                              {category.childCategories.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                                  +{category.childCategories.length - 2} daha
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Alt kategori yok</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex items-center space-x-1 sm:space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={category.isActive !== false}
                                onChange={() => {
                                  // Toggle active status
                                  const updatedCategory = { ...category, isActive: !category.isActive };
                                  updateDoc(doc(db, 'productCategories', category.id), {
                                    isActive: updatedCategory.isActive,
                                    updatedAt: new Date(),
                                  }).then(() => {
                                    fetchProductCategories();
                                    toast.success(`Ürün kategorisi ${updatedCategory.isActive ? 'aktif' : 'pasif'} yapıldı`);
                                  });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-300">
                                {category.isActive !== false ? 'Aktif' : 'Pasif'}
                              </span>
                            </label>

                            <div className="flex space-x-1">
                              <button
                                onClick={() => openEditProductCategoryModal(category)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                title="Düzenle"
                              >
                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProductCategory(category.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                                title="Sil"
                              >
                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          )}
        </div>
      </div>      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Mağaza Kategorisi Ekle</h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                    setStoreCategorySearch('');
                    setProductCategorySearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol Kolon - Temel Bilgiler */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Örn: Elektronik"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      İkon (SVG URL veya Hazır İkon)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Örn: https://freesvgicons.com/icon.svg veya shirt"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      SVG URL'i (freesvgicons.com vb.) veya hazır ikon adı (shirt, laptop, home vb.) girin
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      İkon Rengi
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-14 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#3b82f6"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      İkonun rengini seçin (hex kodu veya renk seçici ile)
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Durum Ayarları</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Aktif Kategori</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.courierCompatible}
                          onChange={(e) => setFormData(prev => ({ ...prev, courierCompatible: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Kurye ile Teslim Edilebilir</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon - Kategori İlişkileri */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Alt Kategoriler (Bu kategorinin alt kategorileri olacak olanlar)
                    </label>
                    <input
                      type="text"
                      value={storeCategorySearch}
                      onChange={(e) => setStoreCategorySearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      placeholder="Kategori ara..."
                    />
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto bg-white dark:bg-gray-700">
                      {categories
                        .filter(cat => cat.id !== selectedCategory?.id) // Kendisini alt kategori olarak seçemesin
                        .filter(cat => cat.name.toLowerCase().includes(storeCategorySearch.toLowerCase()))
                        .map(category => (
                          <label key={category.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                            <input
                              type="checkbox"
                              checked={formData.childCategories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    childCategories: [...prev.childCategories, category.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    childCategories: prev.childCategories.filter(id => id !== category.id)
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-4 flex items-center">
                              {renderIcon(category.icon || '', category.color)}
                              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">{category.name}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Seçili: {formData.childCategories.length} alt kategori
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      İlişkili Ürün Kategorileri (Bu mağaza kategorisine ait ürün kategorileri)
                    </label>
                    <input
                      type="text"
                      value={productCategorySearch}
                      onChange={(e) => setProductCategorySearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      placeholder="Ürün kategorisi ara..."
                    />
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto bg-white dark:bg-gray-700">
                      {productCategories
                        .filter(category => category.name.toLowerCase().includes(productCategorySearch.toLowerCase()))
                        .map(category => (
                          <label key={category.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                            <input
                              type="checkbox"
                              checked={formData.productCategories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Ürün kategorisini ve onun alt kategorilerini ekle
                                  const categoriesToAdd = [category.id];
                                  if (category.childCategories && category.childCategories.length > 0) {
                                    categoriesToAdd.push(...category.childCategories);
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    productCategories: [...new Set([...prev.productCategories, ...categoriesToAdd])]
                                  }));
                                } else {
                                  // Ürün kategorisini ve onun alt kategorilerini çıkar
                                  const categoriesToRemove = [category.id];
                                  if (category.childCategories && category.childCategories.length > 0) {
                                    categoriesToRemove.push(...category.childCategories);
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    productCategories: prev.productCategories.filter(id => !categoriesToRemove.includes(id))
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-4 flex items-center">
                              {renderIcon(category.icon || '', category.color)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {category.name}
                                </div>
                                {category.childCategories && category.childCategories.length > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {category.childCategories.length} alt kategori ile birlikte
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Seçili: {formData.productCategories.length} ürün kategorisi
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                    setStoreCategorySearch('');
                    setProductCategorySearch('');
                  }}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg"
                >
                  Kategori Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-8 pb-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mağaza Kategorisi Düzenle</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCategory(null);
                  resetForm();
                  setIsRuleCreationEnabled(false);
                  setSelectedRuleCategories([]);
                  setSelectedRuleType('cross-display');
                  setStoreCategorySearch('');
                  setProductCategorySearch('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-4">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol Kolon - Temel Bilgiler */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      İkon (SVG URL veya Hazır İkon)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      SVG URL'i (freesvgicons.com için cdn ve https://heroicons.com/ icon adları ) (shirt, laptop, home vb.) girin
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      İkon Rengi
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-14 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      İkonun rengini seçin (hex kodu veya renk seçici ile)
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Durum Ayarları</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Aktif Kategori</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.courierCompatible}
                          onChange={(e) => setFormData(prev => ({ ...prev, courierCompatible: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Kurye ile Teslim Edilebilir</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon - Kategori İlişkileri */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Alt Kategoriler (Bu kategorinin alt kategorileri olacak olanlar)
                    </label>
                    <input
                      type="text"
                      value={storeCategorySearch}
                      onChange={(e) => setStoreCategorySearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      placeholder="Kategori ara..."
                    />
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto bg-white dark:bg-gray-700">
                      {categories
                        .filter(cat => cat.id !== selectedCategory?.id) // Kendisini alt kategori olarak seçemesin
                        .filter(cat => cat.name.toLowerCase().includes(storeCategorySearch.toLowerCase()))
                        .map(category => (
                          <label key={category.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                            <input
                              type="checkbox"
                              checked={formData.childCategories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    childCategories: [...prev.childCategories, category.id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    childCategories: prev.childCategories.filter(id => id !== category.id)
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-4 flex items-center">
                              {renderIcon(category.icon || '', category.color)}
                              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">{category.name}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Seçili: {formData.childCategories.length} alt kategori
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      İlişkili Ürün Kategorileri (Bu mağaza kategorisine ait ürün kategorileri)
                    </label>
                    <input
                      type="text"
                      value={productCategorySearch}
                      onChange={(e) => setProductCategorySearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      placeholder="Ürün kategorisi ara..."
                    />
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto bg-white dark:bg-gray-700">
                      {productCategories
                        .filter(category => category.name.toLowerCase().includes(productCategorySearch.toLowerCase()))
                        .map(category => (
                          <label key={category.id} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                            <input
                              type="checkbox"
                              checked={formData.productCategories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Ürün kategorisini ve onun alt kategorilerini ekle
                                  const categoriesToAdd = [category.id];
                                  if (category.childCategories && category.childCategories.length > 0) {
                                    categoriesToAdd.push(...category.childCategories);
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    productCategories: [...new Set([...prev.productCategories, ...categoriesToAdd])]
                                  }));
                                } else {
                                  // Ürün kategorisini ve onun alt kategorilerini çıkar
                                  const categoriesToRemove = [category.id];
                                  if (category.childCategories && category.childCategories.length > 0) {
                                    categoriesToRemove.push(...category.childCategories);
                                  }
                                  setFormData(prev => ({
                                    ...prev,
                                    productCategories: prev.productCategories.filter(id => !categoriesToRemove.includes(id))
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-4 flex items-center">
                              {renderIcon(category.icon || '', category.color)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {category.name}
                                </div>
                                {category.childCategories && category.childCategories.length > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {category.childCategories.length} alt kategori ile birlikte
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Seçili: {formData.productCategories.length} ürün kategorisi
                    </p>
                  </div>
                </div>
              </div>

              {/* Kural Oluşturma Bölümü */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mt-8">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={isRuleCreationEnabled}
                    onChange={(e) => setIsRuleCreationEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bu Kategoriyi Kurallaştır
                  </label>
                </div>

                {isRuleCreationEnabled && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Kural Türü
                        </label>
                        <select
                          value={selectedRuleType}
                          onChange={(e) => setSelectedRuleType(e.target.value as 'parent-child' | 'cross-display')}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="cross-display">Çapraz Gösterim - Ürünler seçili kategorilerin hepsinde görünür</option>
                          <option value="parent-child">Üst-Alt İlişkisi - Hiyerarşik kategori yapısı</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          İlişkili Kategoriler (En az 1 kategori seçin)
                        </label>
                        <input
                          type="text"
                          value={ruleCategorySearch}
                          onChange={(e) => setRuleCategorySearch(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                          placeholder="Kategori ara..."
                        />
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                          {categories
                            .filter(cat => cat.id !== selectedCategory?.id) // Kendisini seçemesin
                            .filter(cat => cat.name.toLowerCase().includes(ruleCategorySearch.toLowerCase()))
                            .map((category) => (
                              <label key={category.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
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
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="ml-3 flex items-center">
                                  {renderIcon(category.icon || '', category.color)}
                                  <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">{category.name}</span>
                                </div>
                              </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Seçili: {selectedRuleCategories.length} kategori
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 p-4 sm:p-8 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                    resetForm();
                    setIsRuleCreationEnabled(false);
                    setSelectedRuleCategories([]);
                    setSelectedRuleType('cross-display');
                    setStoreCategorySearch('');
                    setProductCategorySearch('');
                  }}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleEditCategory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
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
                  setRuleCategorySearch('');
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
      <SuperpassModal
        isOpen={isSuperpassModalOpen}
        onClose={() => {
          setIsSuperpassModalOpen(false);
          setSuperpassData(null);
        }}
        onVerify={async (action: string, categoryIds: string[]) => {
          // Perform the delete action
          if (action === 'single') {
            await deleteDoc(doc(db, 'categories', categoryIds[0]));
            toast.success('Mağaza kategorisi başarıyla silindi');
          } else if (action === 'bulk') {
            const deletePromises = categoryIds.map(categoryId =>
              deleteDoc(doc(db, 'categories', categoryId))
            );
            await Promise.all(deletePromises);
            toast.success(`${categoryIds.length} mağaza kategorisi başarıyla silindi`);
          } else if (action === 'single-product') {
            await deleteDoc(doc(db, 'productCategories', categoryIds[0]));
            toast.success('Ürün kategorisi başarıyla silindi');
          } else if (action === 'bulk-product') {
            const deletePromises = categoryIds.map(categoryId =>
              deleteDoc(doc(db, 'productCategories', categoryId))
            );
            await Promise.all(deletePromises);
            toast.success(`${categoryIds.length} ürün kategorisi başarıyla silindi`);
          }

          // Reset state
          setSelectedCategories([]);
          setSelectAll(false);
          setSelectedProductCategories([]);
          setSelectAllProductCategories(false);
          fetchCategories();
          fetchProductCategories();
        }}
        superpassData={superpassData}
      />

      {/* Add Product Category Modal */}
      {isProductCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Yeni Ürün Kategorisi Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ürün Kategori Adı *
                </label>
                <input
                  type="text"
                  value={productCategoryFormData.name}
                  onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Örn: Elbise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon (SVG URL veya Hazır İkon)
                </label>
                <input
                  type="text"
                  value={productCategoryFormData.icon}
                  onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
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
                    value={productCategoryFormData.color}
                    onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={productCategoryFormData.color}
                    onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  İkonun rengini seçin (hex kodu veya renk seçici ile)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Kategoriler (Bu kategorinin alt kategorileri olacak olanlar)
                </label>
                <input
                  type="text"
                  value={productCategorySearch}
                  onChange={(e) => setProductCategorySearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  placeholder="Kategori ara..."
                />
                <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {productCategories
                    .filter(cat => cat.id !== selectedProductCategory?.id) // Kendisini alt kategori olarak seçemesin
                    .filter(cat => cat.name.toLowerCase().includes(productCategorySearch.toLowerCase()))
                    .map(category => (
                      <label key={category.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productCategoryFormData.childCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProductCategoryFormData(prev => ({
                                ...prev,
                                childCategories: [...prev.childCategories, category.id]
                              }));
                            } else {
                              setProductCategoryFormData(prev => ({
                                ...prev,
                                childCategories: prev.childCategories.filter(id => id !== category.id)
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
                  Seçili: {productCategoryFormData.childCategories.length} alt kategori
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productCategoryFormData.isActive}
                  onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aktif</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsProductCategoryModalOpen(false);
                  resetProductCategoryForm();
                  setProductCategorySearch('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
              <button
                onClick={handleAddProductCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Category Modal */}
      {isEditProductCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ürün Kategorisi Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ürün Kategori Adı *
                </label>
                <input
                  type="text"
                  value={productCategoryFormData.name}
                  onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon (SVG URL veya Hazır İkon)
                </label>
                <input
                  type="text"
                  value={productCategoryFormData.icon}
                  onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    value={productCategoryFormData.color}
                    onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={productCategoryFormData.color}
                    onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  İkonun rengini seçin (hex kodu veya renk seçici ile)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Kategoriler (Bu kategorinin alt kategorileri olacak olanlar)
                </label>
                <input
                  type="text"
                  value={productCategorySearch}
                  onChange={(e) => setProductCategorySearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  placeholder="Kategori ara..."
                />
                <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {productCategories
                    .filter(cat => cat.id !== selectedProductCategory?.id) // Kendisini alt kategori olarak seçemesin
                    .filter(cat => cat.name.toLowerCase().includes(productCategorySearch.toLowerCase()))
                    .map(category => (
                      <label key={category.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productCategoryFormData.childCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProductCategoryFormData(prev => ({
                                ...prev,
                                childCategories: [...prev.childCategories, category.id]
                              }));
                            } else {
                              setProductCategoryFormData(prev => ({
                                ...prev,
                                childCategories: prev.childCategories.filter(id => id !== category.id)
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
                  Seçili: {productCategoryFormData.childCategories.length} alt kategori
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productCategoryFormData.isActive}
                  onChange={(e) => setProductCategoryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aktif</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsEditProductCategoryModalOpen(false);
                  setSelectedProductCategory(null);
                  resetProductCategoryForm();
                  setProductCategorySearch('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                İptal
              </button>
              <button
                onClick={handleEditProductCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}