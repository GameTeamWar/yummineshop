"use client";

import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ProductZoomProps {
  images: string[];
  productName: string;
}

export default function ProductZoom({ images, productName }: ProductZoomProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const index = Math.floor((x / width) * images.length);
    setCurrentImageIndex(Math.min(index, images.length - 1));
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Ana Görsel - Inline Zoom */}
      <div className="relative group">
        <div
          className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-100"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={3}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            pinch={{ step: 0.1 }}
            doubleClick={{ mode: "reset" }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full"
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={productName}
                    className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                    draggable={false}
                  />
                </TransformComponent>

                {/* Zoom Kontrolleri */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => zoomIn()}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                    title="Yakınlaştır"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                    title="Uzaklaştır"
                  >
                    <ZoomOut className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                    title="Sıfırla"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-800" />
                  </button>
                </div>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      {/* Küçük Görseller */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                index === currentImageIndex
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img src={image} alt={`${productName} ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Talimatları */}
      <div className="text-center text-sm text-gray-600">
        <p>🖱️ Fare tekerleği ile yakınlaştırın • 📱 İki parmak ile yakınlaştırın</p>
      </div>
    </div>
  );
}