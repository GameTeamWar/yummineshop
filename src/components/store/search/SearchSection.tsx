'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchSectionProps {
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobile: boolean;
  stores: any[];
  discountedProducts: any[];
  popularProducts: any[];
  categories: any[];
}

const SearchSection: React.FC<SearchSectionProps> = ({
  darkMode,
  searchQuery,
  setSearchQuery,
  isMobile,
  stores,
  discountedProducts,
  popularProducts,
  categories
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDesktopSearchExpanded, setIsDesktopSearchExpanded] = useState(false);

  return (
    <div className="py-8 sm:py-1 pb-2">
      {/* Fixed Search Button - Bottom right for both mobile and desktop */}
      <div className={`fixed z-60 ${isMobile ? 'bottom-28 right-8' : 'bottom-6 right-12'}`}>
        <div className={`relative flex items-center transition-all duration-500 ease-in-out ${isDesktopSearchExpanded ? (isMobile ? 'w-80' : 'w-208') : 'w-12'}`}>
          {/* Expandable Input */}
          <input
            type="text"
            placeholder={isDesktopSearchExpanded ? "Ürün, kategori, mağaza veya marka ara..." : ""}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              // Auto-collapse when losing focus and empty
              if (!searchQuery.trim()) {
                setTimeout(() => setIsDesktopSearchExpanded(false), 150);
              }
            }}
            className={`flex-1 ${isMobile ? 'pr-4 pl-4 py-4' : 'pr-4 pl-4 py-4'} rounded-xl border-2 transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 text-base font-medium shadow-xl ${darkMode ? 'shadow-blue-500/20' : 'shadow-blue-500/30'} ${
              isDesktopSearchExpanded
                ? `opacity-100 bg-linear-to-r from-blue-50 to-purple-50 border-blue-300 text-neutral-950 placeholder-neutral-600 ${darkMode ? 'from-blue-900/50 to-purple-900/50 border-blue-500 text-white placeholder-neutral-400' : ''}`
                : 'opacity-0 w-0 p-0 border-0'
            }`}
            style={{
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              width: isDesktopSearchExpanded ? 'calc(100% - 3.5rem)' : '0px'
            }}
          />

          <button
            onClick={() => setIsDesktopSearchExpanded(!isDesktopSearchExpanded)}
            className={`z-20 ml-2 ${isMobile ? 'p-2.5' : 'p-3'} rounded-xl transition-all duration-300 shadow-lg border-2 ${
              isDesktopSearchExpanded 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 animate-pulse' 
                : 'bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-blue-500 hover:border-blue-600 animate-bounce'
            }`}
          >
            <Search className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 ${isDesktopSearchExpanded ? 'scale-110 rotate-12' : 'scale-100'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};export default SearchSection;