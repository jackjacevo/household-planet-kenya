'use client';

import { MapPin, ExternalLink } from 'lucide-react';

interface FallbackMapProps {
  center: { lat: number; lng: number };
  title?: string;
  address?: string;
  className?: string;
  height?: string;
}

export default function FallbackMap({ 
  center, 
  title = 'Location',
  address = '',
  className = '',
  height = '400px'
}: FallbackMapProps) {
  const googleMapsUrl = `https://maps.google.com/?q=${center.lat},${center.lng}`;
  const embedUrl = `https://maps.google.com/maps?q=${center.lat},${center.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div 
      className={`relative w-full bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Embedded Google Map */}
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="w-full h-full"
      />
      
      {/* Overlay with location info */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
        <div className="flex items-start space-x-3">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-2 flex-shrink-0">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
            {address && (
              <p className="text-gray-600 text-xs leading-relaxed mb-2">{address}</p>
            )}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open in Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
