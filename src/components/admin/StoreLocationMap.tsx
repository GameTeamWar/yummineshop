'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StoreLocationMapProps {
  latitude: number;
  longitude: number;
  storeName: string;
  height?: string;
}

export default function StoreLocationMap({
  latitude,
  longitude,
  storeName,
  height = '300px'
}: StoreLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Fix for default markers in Leaflet with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Leaflet map initialization
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);

    // Add popup to marker
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${storeName}</strong><br/>
        <small>Enlem: ${latitude.toFixed(6)}<br/>
        Boylam: ${longitude.toFixed(6)}</small>
      </div>
    `).openPopup();

    // Add circle to show approximate location
    L.circle([latitude, longitude], {
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      radius: 100, // 100 meters radius
    }).addTo(map);

    leafletMapRef.current = map;

    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [latitude, longitude, storeName]);

  // Update map view when coordinates change
  useEffect(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([latitude, longitude], 15);

      // Update marker position
      const marker = leafletMapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          leafletMapRef.current?.removeLayer(layer);
        }
      });

      const newMarker = L.marker([latitude, longitude]).addTo(leafletMapRef.current);
      newMarker.bindPopup(`
        <div style="text-align: center;">
          <strong>${storeName}</strong><br/>
          <small>Enlem: ${latitude.toFixed(6)}<br/>
          Boylam: ${longitude.toFixed(6)}</small>
        </div>
      `).openPopup();
    }
  }, [latitude, longitude, storeName]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg border border-gray-300 dark:border-gray-600"
    />
  );
}