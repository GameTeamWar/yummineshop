'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Category[];
}

interface MobileNavItem {
  id: string;
  name: string;
  icon: string;
  type: 'category' | 'product';
}

interface CategoryBarProps {
  darkMode: boolean;
  isMobile: boolean;
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({
  darkMode,
  isMobile,
  searchQuery,
  selectedCategory,
  onCategoryChange
}) => {
  const categories: Category[] = [
    { id: 'all', name: 'Tümü', icon: '🛍️' },
    { id: 'textile', name: 'Tekstil', icon: '👕' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '💄' },
    { id: 'accessories', name: 'Aksesuar', icon: '⌚' },
    { id: 'decor', name: 'Dekorasyon', icon: '🏠' }
  ];

  const mobileNavItems: MobileNavItem[] = [
    { id: 'all', name: 'Tümü', icon: '🛍️', type: 'category' },
    { id: 'popular', name: 'Popüler', icon: '🔥', type: 'product' },
    { id: 'discounted', name: 'İndirimli', icon: '💰', type: 'product' },
    { id: 'new', name: 'Yeni', icon: '✨', type: 'product' },
    { id: 'trending', name: 'Trend', icon: '📈', type: 'product' },
    { id: 'flash', name: 'Flaş', icon: '⚡', type: 'product' },
    { id: 'winter', name: 'Kışlık', icon: '❄️', type: 'product' },
    { id: 'electronics', name: 'Elektronik', icon: '📱', type: 'product' },
    { id: 'sports', name: 'Spor', icon: '⚽', type: 'product' },
    { id: 'textile', name: 'Tekstil', icon: '👕', type: 'category' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '💄', type: 'category' },
    { id: 'accessories', name: 'Aksesuar', icon: '⌚', type: 'category' },
    { id: 'decor', name: 'Dekorasyon', icon: '🏠', type: 'category' }
  ];

  // Desktop sidebar categories
  if (!isMobile) {
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
          Kategoriler
        </h3>
        <div className="space-y-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
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
    );
  }

  // Mobile category bar
  return (
    <>
      {isMobile && !searchQuery.trim() && (
        <div className={`sticky top-[3.39rem] pt-5 z-10 mb-12 pb-4 border-b ${darkMode ? 'bg-gray-900 border-neutral-700' : 'bg-white border-neutral-200'} backdrop-blur-sm bg-opacity-95`}>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {mobileNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onCategoryChange(item.id);
                  if (item.id === 'all') {
                    window.scrollTo({top: 0, behavior: 'smooth'});
                  } else if (item.type === 'category') {
                    const element = document.getElementById(`category-${item.id}`);
                    element?.scrollIntoView({behavior: 'smooth'});
                  } else {
                    // Product subcategory
                    const element = document.getElementById(`subcategory-${item.id}`);
                    element?.scrollIntoView({behavior: 'smooth'});
                  }
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${darkMode ? 'bg-neutral-700 text-white hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'}`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryBar;
