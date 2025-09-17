'use client';

import { useEffect, useRef, useState } from 'react';
import FallbackMap from './FallbackMap';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    info?: string;
  }>;
  className?: string;
  height?: string;
  title?: string;
  address?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMap({ 
  center, 
  zoom = 15, 
  markers = [], 
  className = '',
  height = '400px',
  title = 'Location',
  address = ''
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [useInteractiveMap, setUseInteractiveMap] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Check if Google Maps API key is available
  const hasApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
                   process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

  // Use fallback map if no API key or if there's an error
  if (!hasApiKey || mapError) {
    return (
      <FallbackMap
        center={center}
        title={title}
        address={address}
        className={className}
        height={height}
      />
    );
  }

  useEffect(() => {
    if (!hasApiKey) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => setMapError(true);

      // Set up callback
      window.initMap = initializeMap;

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        (window as any).initMap = undefined;
      };
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add markers
      markers.forEach(marker => {
        const mapMarker = new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
          animation: window.google.maps.Animation.DROP
        });

        if (marker.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${marker.title}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${marker.info}</p>
              </div>
            `
          });

          mapMarker.addListener('click', () => {
            infoWindow.open(map, mapMarker);
          });
        }
      });
    };

    try {
      loadGoogleMaps();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setMapError(true);
    }
  }, [center, zoom, markers, hasApiKey]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full rounded-lg ${className}`}
      style={{ height }}
    />
  );
}
