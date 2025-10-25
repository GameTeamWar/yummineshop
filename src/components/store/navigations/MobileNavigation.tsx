import React, { useState, useRef, useEffect } from 'react';
import { Home, ShoppingBag, FileText, User, Heart, LogOut, Package, Menu, Grid, X, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  user?: any;
  logout?: () => void;
  heroMode?: string;
  setHeroMode?: (mode: string) => void;
  categories?: { id: string; name: string }[];
  onCategorySelect?: (categoryId: string) => void;
  partnerOptions?: any[];
  partnerCollapsed?: {[key: string]: boolean};
  setPartnerCollapsed?: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  partnerSearchQueries?: {[key: string]: string};
  setPartnerSearchQueries?: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  selectedFilters?: {[key: string]: string[]};
  setSelectedFilters?: React.Dispatch<React.SetStateAction<{[key: string]: string[]}>>;
  selectedColors?: string[];
  setSelectedColors?: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange?: { min: string; max: string };
  setPriceRange?: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  sortBy?: string;
  setSortBy?: React.Dispatch<React.SetStateAction<string>>;
  getColorFromClass?: (colorClass: string) => string;
}

export default function MobileNavigation({ activeTab, setActiveTab, darkMode, user, logout, heroMode, setHeroMode, categories = [], onCategorySelect, partnerOptions = [], partnerCollapsed = {}, setPartnerCollapsed, partnerSearchQueries = {}, setPartnerSearchQueries, selectedFilters = {}, setSelectedFilters, selectedColors = [], setSelectedColors, priceRange = { min: '', max: '' }, setPriceRange, sortBy = 'popular', setSortBy, getColorFromClass }: MobileNavigationProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navItems = user ? [
    { id: 'home', label: 'Ana Sayfa', icon: Home, action: () => { setActiveTab('home'); if (setHeroMode) setHeroMode('shopping'); } },
    { id: 'filters', label: 'Filtreler', icon: Grid, action: () => setFilterDrawerOpen(!filterDrawerOpen) },
    { id: 'documents', label: 'Belge', icon: FileText, action: () => { setActiveTab('documents'); if (setHeroMode) setHeroMode('document'); } },
    { id: 'shopping', label: 'Siparişlerim', icon: ShoppingBag, action: () => router.push('/store/myaccount/orders') },
    { id: 'favorites', label: 'Favoriler', icon: Heart, action: () => router.push('/favorites') },
    { id: 'profile', label: 'Profil', icon: User, action: () => setProfileDropdownOpen(!profileDropdownOpen) },
  ] : [
    { id: 'home', label: 'Ana Sayfa', icon: Home, action: () => { setActiveTab('home'); if (setHeroMode) setHeroMode('shopping'); } },
    { id: 'filters', label: 'Filtreler', icon: Grid, action: () => setFilterDrawerOpen(!filterDrawerOpen) },
    { id: 'hamburger', label: 'Menü', icon: Menu, action: () => setHamburgerDropdownOpen(!hamburgerDropdownOpen) },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setFilterDrawerOpen(false);
      }
    };

    if (filterDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterDrawerOpen]);

  const router = useRouter();

  const handleNavigation = (item: any) => {
    // Close profile dropdown when navigating to other tabs
    if (item.id !== 'profile') {
      setProfileDropdownOpen(false);
    }
    // Close filter drawer when navigating to other tabs
    if (item.id !== 'filters') {
      setFilterDrawerOpen(false);
    }
    item.action();
  };

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-300 md:hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                    : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Dropdown Menu - Only show for logged in users */}
      {profileDropdownOpen && user && (
        <div className={`fixed bottom-16 left-4 right-4 z-50 rounded-lg shadow-xl border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
          <button
            onClick={() => {
              router.push('/profile');
              setProfileDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </div>
          </button>
          <button
            onClick={() => {
              router.push('/store/myaccount/deliveries');
              setProfileDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Teslimatlarım
            </div>
          </button>
          <button
            onClick={() => {
              if (logout) logout();
              setProfileDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 last:rounded-b-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </div>
          </button>
        </div>
      )}

      {/* Filter Drawer */}
      {filterDrawerOpen && (
        <div ref={drawerRef} className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300`}>
          <div className={`absolute bottom-18 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl shadow-xl border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtreler</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setSelectedFilters && setSelectedFilters({});
                    setSelectedColors && setSelectedColors([]);
                    setPriceRange && setPriceRange({ min: '', max: '' });
                    setSortBy && setSortBy('popular');
                  }} className={`px-3 py-1 text-sm rounded transition-colors ${darkMode ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}>
                    Temizle
                  </button>
                  <button onClick={() => setFilterDrawerOpen(false)} className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Partner Options */}
              {partnerOptions?.map((option: any, index: number) => (
                <div key={option.type} className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{option.title}</h4>
                    <button
                      onClick={() => setPartnerCollapsed && setPartnerCollapsed((prev: any) => ({ ...prev, [option.type]: !prev[option.type] }))}
                      className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}
                      aria-label="expand-collapse-button"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${partnerCollapsed && partnerCollapsed[option.type] ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <div className={`${partnerCollapsed && partnerCollapsed[option.type] ? 'hidden' : ''}`}>
                    {/* Search Input */}
                    {option.searchable && (
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder={option.searchPlaceholder}
                          value={partnerSearchQueries && partnerSearchQueries[option.type] || ''}
                          onChange={(e) => setPartnerSearchQueries && setPartnerSearchQueries((prev: any) => ({ ...prev, [option.type]: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                          autoComplete="off"
                        />
                      </div>
                    )}

                    {/* Price Range */}
                    {option.isPriceRange && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="En Az"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange && setPriceRange((prev: any) => ({ ...prev, min: e.target.value }))}
                            className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                            autoComplete="off"
                          />
                          <input
                            type="number"
                            placeholder="En Çok"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange && setPriceRange((prev: any) => ({ ...prev, max: e.target.value }))}
                            className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                            autoComplete="off"
                          />
                        </div>
                        <div className="space-y-2">
                          {option.priceRanges?.map((range: any) => (
                            <label key={range.id} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`price-${option.type}`}
                                value={range.value}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{range.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color List */}
                    {option.isColorList && (
                      <div className="grid grid-cols-4 gap-2">
                        {option.items?.filter((item: any) =>
                          !partnerSearchQueries || !partnerSearchQueries[option.type] ||
                          item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                        ).map((item: any) => {
                          const isSelected = selectedColors && selectedColors.includes(item.value);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedColors && setSelectedColors((prev: any) =>
                                  isSelected
                                    ? prev.filter((color: any) => color !== item.value)
                                    : [...prev, item.value]
                                );
                              }}
                              className="flex flex-col items-center gap-1 cursor-pointer group"
                            >
                              <div
                                className={`w-8 h-8 rounded-full border-2 transition-all relative ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
                                style={{
                                  backgroundColor: getColorFromClass && item.colorClass ? getColorFromClass(item.colorClass) : '#ccc'
                                }}
                              >
                                {isSelected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white drop-shadow-lg" />
                                  </div>
                                )}
                              </div>
                              <span className={`text-xs text-center ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Sectioned Items */}
                    {option.hasSections && option.sections?.map((section: any, sectionIndex: number) => (
                      <div key={sectionIndex} className="mb-4">
                        <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{section.title}</p>
                        <div className="space-y-2">
                          {section.items?.filter((item: any) =>
                            !partnerSearchQueries || !partnerSearchQueries[option.type] ||
                            item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                          ).map((item: any) => {
                            const isChecked = selectedFilters && selectedFilters[option.type]?.includes(item.value) || false;
                            return (
                              <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setSelectedFilters && setSelectedFilters((prev: any) => {
                                      const current = prev[option.type] || [];
                                      if (e.target.checked) {
                                        return { ...prev, [option.type]: [...current, item.value] };
                                      } else {
                                        return { ...prev, [option.type]: current.filter((v: any) => v !== item.value) };
                                      }
                                    });
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{item.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Regular Items */}
                    {!option.isColorList && !option.isPriceRange && !option.hasSections && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {option.items?.filter((item: any) =>
                          !partnerSearchQueries || !partnerSearchQueries[option.type] ||
                          item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                        ).map((item: any) => {
                          const isChecked = selectedFilters && selectedFilters[option.type]?.includes(item.value) || false;
                          return (
                            <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  setSelectedFilters && setSelectedFilters((prev: any) => {
                                    const current = prev[option.type] || [];
                                    if (e.target.checked) {
                                      return { ...prev, [option.type]: [...current, item.value] };
                                    } else {
                                      return { ...prev, [option.type]: current.filter((v: any) => v !== item.value) };
                                    }
                                  });
                                }}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{item.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sıralama</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy && setSortBy(e.target.value)}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
                >
                  <option value="popular">Popülerlik</option>
                  <option value="price-low">Fiyat (Düşükten Yükseğe)</option>
                  <option value="price-high">Fiyat (Yüksekten Düşüğe)</option>
                  <option value="rating">Puana Göre</option>
                  <option value="newest">En Yeni</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}