'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useSelector } from 'react-redux';
import { getRuntimeConfig } from "@/app/lib/runtime-config";

const FALLBACK_CENTER = { lat: 27.7172, lng: 85.3240 };
const MAP_LOADER_ID = 'google-map-script';
const MAP_LIBRARIES = ['marker'];

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

function GoogleMapLoader({ apiKey, selectedPosition, onLocationSelect }) {
    const mapId = getRuntimeConfig("NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID") || '';
    const mapIds = mapId ? [mapId] : [];

    const { isLoaded } = useJsApiLoader({
        id: MAP_LOADER_ID,
        googleMapsApiKey: apiKey,
        libraries: MAP_LIBRARIES,
        mapIds,
    });
    const userLocation = useSelector((state) => state.app.location);
    const [map, setMap] = useState(null);
    const markerRef = useRef(null);

    const normalizedSelected = useMemo(() => normalizeLocation(selectedPosition), [selectedPosition]);
    const normalizedUser = useMemo(() => normalizeLocation(userLocation), [userLocation]);
    const center = normalizedSelected || normalizedUser || FALLBACK_CENTER;

    const emitLocation = useCallback((lat, lng) => {
        if (!onLocationSelect) {
            return;
        }

        onLocationSelect({ lat, lng });
    }, [onLocationSelect]);

    useEffect(() => {
        if (!isLoaded || !map || !window.google?.maps?.marker) {
            return;
        }

        if (!markerRef.current) {
            markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
                map,
                position: center,
                gmpDraggable: true,
            });

            markerRef.current.addListener('dragend', (event) => {
                const latLng = event?.latLng;
                if (!latLng) {
                    return;
                }

                emitLocation(latLng.lat(), latLng.lng());
            });
        } else {
            markerRef.current.position = center;
            markerRef.current.map = map;
        }

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, [isLoaded, map, center, emitLocation]);

    if (!isLoaded) {
        return (
            <div style={{ width: '100%', minHeight: 300, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Loading map...</p>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '320px', borderRadius: 12 }}
            center={center}
            zoom={13}
            onClick={(event) => {
                if (!event.latLng) {
                    return;
                }

                emitLocation(event.latLng.lat(), event.latLng.lng());
            }}
            onLoad={(loadedMap) => setMap(loadedMap)}
            onUnmount={() => setMap(null)}
            options={{
                mapId: mapId || undefined,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        />
    );
}

function GoogleMapView({ selectedPosition = null, onLocationSelect, apiKey: apiKeyProp }) {
    const apiKey = apiKeyProp ?? getRuntimeConfig("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY") ?? "";

    if (!apiKey) {
        return (
            <div style={{ width: '100%', minHeight: 300, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                    Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map pin selection.
                </p>
            </div>
        );
    }

    return (
        <GoogleMapLoader
            apiKey={apiKey}
            selectedPosition={selectedPosition}
            onLocationSelect={onLocationSelect}
        />
    );
}

export default GoogleMapView;