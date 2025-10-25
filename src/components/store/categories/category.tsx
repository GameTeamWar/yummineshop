'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Category[];
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

  const productCategories: Category[] = [
    { id: 'popular', name: 'Popüler Ürünler', icon: '🔥' },
    { id: 'discounted', name: 'İndirimli', icon: '💰' },
    { id: 'winter', name: 'Kışlık', icon: '❄️' },
    { id: 'summer', name: 'Yazlık', icon: '☀️' },
    { id: 'trending', name: 'Trend', icon: '📈' },
    { id: 'flash', name: 'Flaş Ürünler', icon: '⚡' },
    { id: 'electronics', name: 'Elektronik', icon: '�' },
    { id: 'sports', name: 'Spor', icon: '⚽' }
  ];

  const storeCategories: Category[] = [
    { id: 'textile', name: 'Tekstil', icon: '👕' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '💄' },
    { id: 'accessories', name: 'Aksesuar', icon: '⌚' },
    { id: 'decor', name: 'Dekorasyon', icon: '🏠' }
  ];

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
        {/* Ürün Kategorileri */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
            Ürün Kategorileri
          </h3>

          {/* Ürünler Dropdown */}
          <div className="mb-4">
            <button
              onClick={() => {
                setIsProductDropdownOpen(!isProductDropdownOpen);
                if (!isProductDropdownOpen) {
                  handleCategoryClick('all');
                }
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                selectedCategory === 'all'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                    ? 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🛍️</span>
                <span className="font-medium">Ürünler</span>
              </div>
              {isProductDropdownOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown İçeriği */}
            {isProductDropdownOpen && (
              <div className="mt-2 ml-4 space-y-1 transition-all duration-300">
                {productCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleProductCategoryClick(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all duration-300 flex items-center gap-3 text-sm ${
                      selectedCategory === category.id
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                          ? 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
                          : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950'
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mağaza Kategorileri */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
            Mağaza Kategorileri
          </h3>
          <div className="space-y-2">
            {storeCategories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                  selectedCategory === category.id
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile category bar
  return (
    <>
      {isMobile && !searchQuery.trim() && (
        <div className={`sticky top-[3.39rem] pt-5 z-10 mb-12 pb-4 border-b ${darkMode ? 'bg-gray-900 border-neutral-700' : 'bg-white border-neutral-200'} backdrop-blur-sm bg-opacity-95`}>
          {/* Ürün Kategorileri - Mobile */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => {
                  setIsProductDropdownOpen(!isProductDropdownOpen);
                  if (!isProductDropdownOpen) {
                    handleCategoryClick('all');
                  }
                }}
                className={`shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === 'all'
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                      : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'
                }`}
              >
                <span>🛍️</span>
                <span>Ürünler</span>
                {isProductDropdownOpen ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {/* Ürün kategorileri dropdown - Mobile */}
              {isProductDropdownOpen && (
                <div className="flex gap-2 ml-2">
                  {productCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleProductCategoryClick(category.id)}
                      className={`shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === category.id
                          ? darkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : darkMode
                            ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                            : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'
                      }`}
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mağaza Kategorileri - Mobile */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {storeCategories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                      : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Category;