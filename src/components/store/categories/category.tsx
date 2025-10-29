'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
// Heroicons import - tüm outline iconları için
import * as HeroIcons from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  subcategories?: Category[];
  courierCompatible?: boolean;
  isActive?: boolean;
  parentCategories?: string[]; // Bu kategorinin ait olduğu üst kategoriler
  childCategories?: string[]; // Bu kategorinin alt kategorileri
  order?: number;
}

interface CategoryProps {
  darkMode: boolean;
  isMobile: boolean;
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const Category: React.FC<CategoryProps> = ({
  darkMode,
  isMobile,
  searchQuery,
  selectedCategory,
  onCategoryChange
}) => {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Kategori ismini title case'e çeviren fonksiyon
  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

  // Firebase'den kategorileri gerçek zamanlı olarak çek
  useEffect(() => {
    setLoadingCategories(true);

    const categoriesRef = collection(db, 'categories');

    // onSnapshot ile gerçek zamanlı güncellemeler
    const unsubscribe = onSnapshot(
      categoriesRef,
      (querySnapshot) => {
        const categoriesData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Category))
          .filter(cat => cat.isActive !== false); // Sadece aktif kategorileri göster

        // Ana kategorileri ve alt kategorileri ayır
        const parentCategories = categoriesData.filter(cat => !categoriesData.some(otherCat => otherCat.childCategories?.includes(cat.id)));
        const childCategories = categoriesData.filter(cat => categoriesData.some(otherCat => otherCat.childCategories?.includes(cat.id)));

        // Ana kategorilere alt kategorilerini ekle
        const categoriesWithSubcategories = parentCategories.map(parent => ({
          ...parent,
          subcategories: childCategories.filter(child => parent.childCategories?.includes(child.id))
        }));

        // Hiyerarşik sıralama
        const sortedCategories = categoriesWithSubcategories.sort((a, b) => {
          const aOrder = a.order || 0;
          const bOrder = b.order || 0;
          return aOrder - bOrder;
        });

        setCategories(sortedCategories);
        setLoadingCategories(false);
      },
      (error) => {
        console.error('Kategoriler çekilirken hata:', error);
        setLoadingCategories(false);
      }
    );

    // Cleanup function - component unmount olduğunda listener'ı kaldır
    return () => unsubscribe();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    // Kategori seçimi
    onCategoryChange(categoryId);

    // İlgili kategoriye scroll yap
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Kategori ID'sine göre ilgili elemente scroll yap
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        // Sidebar yüksekliğini hesaba kat (header + sidebar padding)
        const headerHeight = 64; // header yüksekliği (top-16 = 4rem = 64px)
        const sidebarTop = 64; // sidebar top pozisyonu
        const offset = sidebarTop + 20; // biraz ekstra boşluk

        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // Eğer kategori elementi bulunamazsa, mağaza bölümüne scroll yap
        const storesElement = document.getElementById('stores-section');
        if (storesElement) {
          storesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const handleProductCategoryClick = (categoryId: string) => {
    // Ürün kategorisi seçimi
    onCategoryChange(categoryId);

    // İlgili ürün bölümüne scroll yap
    const element = document.getElementById(`subcategory-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // En üste scroll yap
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  // Desktop sidebar categories
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {/* Mağaza Kategorileri */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
            Mağaza Kategorileri
          </h3>

          {loadingCategories ? (
            <div className="text-sm text-gray-500">Kategoriler yükleniyor...</div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      if (category.subcategories && category.subcategories.length > 0) {
                        toggleCategoryExpansion(category.id);
                      } else {
                        handleCategoryClick(category.id);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between gap-3 ${
                      selectedCategory === category.id
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                        ? 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {renderIcon(category.icon || '', category.color)}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedCategories.has(category.id) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Alt Kategoriler */}
                  {category.subcategories && category.subcategories.length > 0 && expandedCategories.has(category.id) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {category.subcategories.map(subcategory => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleCategoryClick(subcategory.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-3 text-sm ${
                            selectedCategory === subcategory.id
                              ? darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-500 text-white'
                              : darkMode
                              ? 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
                              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                        >
                          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                          {renderIcon(subcategory.icon || '', subcategory.color)}
                          <span>{subcategory.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }  // Mobile category bar
  return (
    <>
      {isMobile && !searchQuery.trim() && (
        <div className={`sticky top-[3.39rem] pt-5 z-10 mb-12 pb-4 border-b ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'} backdrop-blur-sm bg-opacity-95`}>
          {/* Mağaza Kategorileri - Mobile */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {loadingCategories ? (
              <div className="text-sm text-gray-500 px-4 py-2">Kategoriler yükleniyor...</div>
            ) : (
              categories.map(category => (
                <div key={category.id} className="flex-shrink-0">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                        : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'
                    }`}
                  >
                    {renderIcon(category.icon || '', category.color)}
                    <span>{category.name}</span>
                  </button>

                  {/* Alt kategoriler için küçük noktalar */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="flex gap-1 mt-1 ml-4">
                      {category.subcategories.slice(0, 3).map(subcategory => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleCategoryClick(subcategory.id)}
                          className={`w-6 h-6 rounded-full text-xs transition-all duration-300 flex items-center justify-center ${
                            selectedCategory === subcategory.id
                              ? darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-500 text-white'
                              : darkMode
                              ? 'bg-neutral-600 text-neutral-300 hover:bg-neutral-500'
                              : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                          }`}
                          title={subcategory.name}
                        >
                          {renderIcon(subcategory.icon || '', subcategory.color)}
                        </button>
                      ))}
                      {category.subcategories.length > 3 && (
                        <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                          darkMode ? 'bg-neutral-600 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          +{category.subcategories.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Category;