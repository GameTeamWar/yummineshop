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
          .filter(cat => cat.isActive !== false) // Sadece aktif kategorileri göster
          .sort((a, b) => {
            // Order field'ına göre sırala, yoksa alfabetik sırala
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;
            return a.name.localeCompare(b.name);
          }); // Order'a göre sıralama

        setCategories(categoriesData);
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
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile category bar
  return (
    <>
      {isMobile && !searchQuery.trim() && (
        <div className={`sticky top-[3.39rem] pt-5 z-10 mb-12 pb-4 border-b ${darkMode ? 'bg-gray-900 border-neutral-700' : 'bg-white border-neutral-200'} backdrop-blur-sm bg-opacity-95`}>
          {/* Mağaza Kategorileri - Mobile */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {loadingCategories ? (
              <div className="text-sm text-gray-500 px-4 py-2">Kategoriler yükleniyor...</div>
            ) : (
              categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
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
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Category;