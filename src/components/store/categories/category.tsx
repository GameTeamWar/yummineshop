'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import * as HeroIcons from '@heroicons/react/24/outline';

interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  subcategories?: Category[];
  productCategories?: ProductCategory[];
  courierCompatible?: boolean;
  isActive?: boolean;
  parentCategories?: string[];
  childCategories?: string[];
  order?: number;
}

interface CategoryProps {
  darkMode: boolean;
  isMobile: boolean;
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (categoryId: string, type: 'category' | 'product') => void;
}

const Category: React.FC<CategoryProps> = ({
  darkMode,
  isMobile,
  searchQuery,
  selectedCategory,
  onCategoryChange
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Icon render fonksiyonu
  const renderIcon = (iconName?: string, color?: string) => {
    const iconColor = color || '#666';

    if (iconName && (iconName.startsWith('http') || iconName.startsWith('data:image/svg'))) {
      return (
        <div
          className="w-5 h-5 flex items-center justify-center shrink-0"
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

    if (iconName) {
      const pascalCaseIcon = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const IconComponent = (HeroIcons as any)[pascalCaseIcon + 'Icon'];

      if (IconComponent) {
        return (
          <div className="w-5 h-5 flex items-center justify-center shrink-0" style={{ color: iconColor }}>
            <IconComponent className="w-5 h-5" />
          </div>
        );
      }
    }

    const PlusIcon = (HeroIcons as any)['PlusIcon'];
    return (
      <div className="w-5 h-5 flex items-center justify-center shrink-0" style={{ color: iconColor }}>
        {PlusIcon ? <PlusIcon className="w-5 h-5" /> : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" opacity="0.2"/>
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    );
  };

  // Firebase'den kategorileri ve ürün kategorilerini çek
  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategories(true);
      try {
        // Kategorileri çek
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Category))
          .filter(cat => cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Ürün kategorilerini çek
        const productCategoriesSnapshot = await getDocs(collection(db, 'productCategories'));
        const productCategoriesData = productCategoriesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ProductCategory))
          .filter(cat => cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setProductCategories(productCategoriesData);

        // Kategori ağacı oluşturucu (admin paneliyle aynı mantık)
        function buildTree(category: Category): Category {
          // Alt kategorileri bul
          const subcategories = (category.childCategories || [])
            .map(childId => categoriesData.find(cat => cat.id === childId))
            .filter(Boolean)
            .map(child => buildTree(child!));

          // Ürün kategorilerini bul
          const productCats = (Array.isArray(category.productCategories) ? category.productCategories : [])
            .map(prodId => typeof prodId === 'string' ? productCategoriesData.find(pc => pc.id === prodId) : undefined)
            .filter(Boolean) as ProductCategory[];

          return {
            ...category,
            subcategories: subcategories.length > 0 ? subcategories : undefined,
            productCategories: productCats.length > 0 ? productCats : undefined
          };
        }

        // En üst (parent'ı olmayan) kategorileri bul
        const topCategories = categoriesData.filter(cat =>
          !categoriesData.some(other => (other.childCategories || []).includes(cat.id))
        );

        const categoriesWithTree = topCategories.map(buildTree);
        setCategories(categoriesWithTree);
      } catch (error) {
        console.error('Kategoriler çekilirken hata:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

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

  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (categoryId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleCategoryExpansion(categoryId);
    } else {
      onCategoryChange(categoryId, 'category');
    }
  };

  const handleSubcategoryClick = (subcategoryId: string, hasProductCategories: boolean) => {
    if (hasProductCategories) {
      toggleSubcategoryExpansion(subcategoryId);
    } else {
      onCategoryChange(subcategoryId, 'category');
    }
  };

  const handleProductCategoryClick = (productCategoryId: string) => {
    onCategoryChange(productCategoryId, 'product');
  };

  // Recursive kategori render fonksiyonu
  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = !!(category.subcategories && category.subcategories.length > 0);
    const hasProductCategories = !!(category.productCategories && category.productCategories.length > 0);

    return (
      <div key={category.id} style={{ marginLeft: level === 0 ? 0 : 16 }}>
        <button
          onClick={() => {
            if (hasSubcategories) {
              setExpandedCategories(prev => {
                const newSet = new Set(prev);
                if (newSet.has(category.id)) newSet.delete(category.id);
                else newSet.add(category.id);
                return newSet;
              });
            } else if (hasProductCategories) {
              setExpandedCategories(prev => {
                const newSet = new Set(prev);
                if (newSet.has(category.id)) newSet.delete(category.id);
                else newSet.add(category.id);
                return newSet;
              });
            } else {
              onCategoryChange(category.id, 'category');
            }
          }}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between gap-3 ${
            selectedCategory === category.id
              ? darkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : darkMode
              ? 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
              : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {renderIcon(category.icon, category.color)}
            <span className="font-medium truncate">{category.name}</span>
          </div>
          {hasSubcategories && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
          {!hasSubcategories && hasProductCategories && (
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            />
          )}
        </button>

        {/* Alt Kategoriler */}
        {hasSubcategories && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {category.subcategories!.map(sub => renderCategory(sub, level + 1))}
          </div>
        )}

        {/* Ürün Kategorileri */}
        {!hasSubcategories && hasProductCategories && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {category.productCategories!.map(productCategory => (
              <button
                key={productCategory.id}
                onClick={() => handleProductCategoryClick(productCategory.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs ${
                  selectedCategory === productCategory.id
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                    ? 'text-neutral-500 hover:bg-neutral-700 hover:text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></div>
                {renderIcon(productCategory.icon, productCategory.color)}
                <span className="truncate">{productCategory.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Desktop sidebar
  if (!isMobile) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
            Mağaza Kategorileri
          </h3>
          {loadingCategories ? (
            <div className="text-sm text-gray-500">Kategoriler yükleniyor...</div>
          ) : (
            <div className="space-y-1">
              {categories.map(category => renderCategory(category))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile görünümü
  return (
    <>
      {isMobile && !searchQuery.trim() && (
        <div className={`sticky top-[3.39rem] pt-5 z-10 mb-12 pb-4 border-b ${
          darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'
        } backdrop-blur-sm bg-opacity-95`}>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {loadingCategories ? (
              <div className="text-sm text-gray-500 px-4 py-2">Kategoriler yükleniyor...</div>
            ) : (
              categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id, 'category')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 shrink-0 ${
                    selectedCategory === category.id
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                      : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'
                  }`}
                >
                  {renderIcon(category.icon, category.color)}
                  <span>{category.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Category;