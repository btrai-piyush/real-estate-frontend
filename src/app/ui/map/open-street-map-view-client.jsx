'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';

const FALLBACK_CENTER = { lat: 27.7172, lng: 85.3240 };

const isValidCoordinate = (lat, lng) => (
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180
);

const normalizeLocation = (location) => {
  if (!location) {
    return null;
  }

  const lat = Number.parseFloat(location.lat);
  const lng = Number.parseFloat(location.lng);

  if (!isValidCoordinate(lat, lng)) {
    return null;
  }

  return { lat, lng };
};

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      if (!onLocationSelect) {
        return;
      }

      onLocationSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);

  return null;
}

export default function OpenStreetMapViewClient({ selectedPosition = null, onLocationSelect }) {
  const storedLocation = useSelector((state) => state.app.location);
  const contextLocation = normalizeLocation(storedLocation);
  const [browserLocation, setBrowserLocation] = useState(null);
  const geolocationRequested = useRef(false);
  const initialLocationSynced = useRef(false);

  useEffect(() => {
    if (selectedPosition || contextLocation || browserLocation || geolocationRequested.current) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    geolocationRequested.current = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (isValidCoordinate(detected.lat, detected.lng)) {
          setBrowserLocation(detected);
        }
      },
      () => {
        // Keep fallback center if user denies permission or location lookup fails.
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [selectedPosition, contextLocation, browserLocation]);

  useEffect(() => {
    if (selectedPosition || initialLocationSynced.current || !onLocationSelect) {
      return;
    }

    const initialLocation = contextLocation || browserLocation;
    if (!initialLocation) {
      return;
    }

    onLocationSelect(initialLocation);
    initialLocationSynced.current = true;
  }, [selectedPosition, contextLocation, browserLocation, onLocationSelect]);

  const center = selectedPosition || contextLocation || browserLocation || FALLBACK_CENTER;
  const markerPosition = useMemo(() => [center.lat, center.lng], [center.lat, center.lng]);

  return (
    <div style={{ width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <MapContainer
        center={markerPosition}
        zoom={13}
        scrollWheelZoom
        style={{ width: '100%', height: 320 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <RecenterMap position={markerPosition} />
        <ClickHandler onLocationSelect={onLocationSelect} />
        <Marker
          icon={markerIcon}
          position={markerPosition}
          draggable
          eventHandlers={{
            dragend: (event) => {
              if (!onLocationSelect) {
                return;
              }

              const { lat, lng } = event.target.getLatLng();
              onLocationSelect({ lat, lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
