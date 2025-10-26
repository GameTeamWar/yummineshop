'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  isEditing?: boolean;
}

function LocationMarker({ position, onLocationSelect, isEditing }: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
  isEditing?: boolean;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(position);

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  const map = useMapEvents({
    click(e: any) {
      // Sadece düzenleme modunda tıklama etkin
      if (!isEditing) return;

      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return markerPosition === null ? null : (
    <Marker position={markerPosition}>
      <Popup>
        {isEditing ? 'Seçilen konum' : 'Mevcut konum'}: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

export default function AddressMap({
  latitude,
  longitude,
  onLocationSelect,
  height = 'h-64',
  isEditing = false
}: AddressMapProps) {
  // İstanbul merkezli varsayılan konum
  const defaultCenter: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : [41.0082, 28.9784]; // İstanbul

  const position: [number, number] | null = latitude && longitude
    ? [latitude, longitude]
    : null;

  console.log('AddressMap render:', { latitude, longitude, position, isEditing });

  return (
    <div className={`${height} rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600`}>
      <MapContainer
        center={defaultCenter}
        zoom={position ? 15 : 6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={isEditing}
        dragging={isEditing}
        scrollWheelZoom={isEditing}
        doubleClickZoom={isEditing}
        boxZoom={isEditing}
        keyboard={isEditing}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          onLocationSelect={onLocationSelect}
          isEditing={isEditing}
        />
      </MapContainer>

      <div className="p-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 text-center">
        {isEditing ? 'Haritada tıklayarak konum seçin' : 'Konum bilgisi görüntüleniyor'}
      </div>
    </div>
  );
}