'use client';

import React, { useState } from 'react';

interface MapSectionProps {
  darkMode: boolean;
}

const MapSection: React.FC<MapSectionProps> = ({ darkMode }) => {
  const [isInteractive, setIsInteractive] = useState(false);

  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 transition-colors duration-300 ${darkMode ? 'border-neutral-700 bg-gray-800' : 'border-neutral-200 bg-neutral-100'} relative w-full`}
      style={{ minHeight: undefined, height: undefined, maxHeight: undefined }}
    >
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=28.8,40.9,29.2,41.2&layer=mapnik&marker=41.0082,28.9784"
        width="100%"
        height="100%"
        className="block w-full h-[655px] sm:h-[650px] md:h-[650px] lg:h-[80vh] lg:min-h-[850px] lg:max-h-[700px]"
        style={{ border: 0, pointerEvents: isInteractive ? 'auto' : 'none' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="OpenStreetMap"
      ></iframe>
      {/* Mobile overlay to toggle interaction */}
      <div className="lg:hidden absolute top-2 right-2">
        <button
          onClick={() => setIsInteractive(!isInteractive)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300"
        >
          {isInteractive ? 'Haritayı Kilitle' : 'Haritayı Etkileşimli Yap'}
        </button>
      </div>
    </div>
  );
};

export default MapSection;