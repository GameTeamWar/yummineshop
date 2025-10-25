'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface StoreSidebarProps {
  darkMode: boolean;
  store: any;
  partnerCollapsed: {[key: string]: boolean};
  setPartnerCollapsed: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  partnerSearchQueries: {[key: string]: string};
  setPartnerSearchQueries: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  selectedFilters: {[key: string]: string[]};
  setSelectedFilters: React.Dispatch<React.SetStateAction<{[key: string]: string[]}>>;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: { min: string; max: string };
  setPriceRange: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  getColorFromClass: (colorClass: string) => string;
}

export default function StoreSidebar({
  darkMode,
  store,
  partnerCollapsed,
  setPartnerCollapsed,
  partnerSearchQueries,
  setPartnerSearchQueries,
  selectedFilters,
  setSelectedFilters,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  getColorFromClass
}: StoreSidebarProps) {
  return (
    <div className="relative lg:col-span-1 lg:sticky top-24 lg:self-start hidden lg:block">
      <div className={`rounded-2xl p-4 sm:p-6 pt-12 transition-colors duration-300 max-h-[calc(100vh-8rem)] overflow-y-auto mt-1 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>

        {/* Partner Options */}
        {store.partnerOptions?.map((option: any, index: number) => (
          <div key={option.type} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{option.title}</h3>
              <button
                onClick={() => setPartnerCollapsed(prev => ({ ...prev, [option.type]: !prev[option.type] }))}
                className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}
                aria-label="expand-collapse-button"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${partnerCollapsed[option.type] ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className={`${partnerCollapsed[option.type] ? 'hidden' : ''}`}>
              {/* Search Input */}
              {option.searchable && (
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder={option.searchPlaceholder}
                    value={partnerSearchQueries[option.type] || ''}
                    onChange={(e) => setPartnerSearchQueries(prev => ({ ...prev, [option.type]: e.target.value }))}
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
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-950 placeholder-neutral-500'}`}
                      autoComplete="off"
                    />
                    <input
                      type="number"
                      placeholder="En Çok"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
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
                    !partnerSearchQueries[option.type] ||
                    item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                  ).map((item: any) => {
                    const isSelected = selectedColors.includes(item.value);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedColors(prev =>
                            isSelected
                              ? prev.filter(color => color !== item.value)
                              : [...prev, item.value]
                          );
                        }}
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 transition-all relative ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
                          style={{
                            backgroundColor: item.colorClass ? getColorFromClass(item.colorClass) : '#ccc'
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
                      !partnerSearchQueries[option.type] ||
                      item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                    ).map((item: any) => {
                      const isChecked = selectedFilters[option.type]?.includes(item.value) || false;
                      return (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedFilters(prev => {
                                const current = prev[option.type] || [];
                                if (isChecked) {
                                  return { ...prev, [option.type]: [...current, item.value] };
                                } else {
                                  return { ...prev, [option.type]: current.filter(v => v !== item.value) };
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
                    !partnerSearchQueries[option.type] ||
                    item.name.toLowerCase().includes(partnerSearchQueries[option.type].toLowerCase())
                  ).map((item: any) => {
                    const isChecked = selectedFilters[option.type]?.includes(item.value) || false;
                    return (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedFilters(prev => {
                              const current = prev[option.type] || [];
                              if (isChecked) {
                                return { ...prev, [option.type]: [...current, item.value] };
                              } else {
                                return { ...prev, [option.type]: current.filter(v => v !== item.value) };
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
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sıralama</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full p-2 left-10 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}
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
  );
}