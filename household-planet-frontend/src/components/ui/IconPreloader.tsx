'use client';

import { useEffect } from 'react';
import { 
  Package, 
  Eye, 
  RotateCcw, 
  Download, 
  Search, 
  Truck, 
  RefreshCw, 
  Smartphone,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Share2,
  Facebook,
  MessageCircle,
  Calendar,
  Clock
} from 'lucide-react';

// Preload all icons used in order pages
const IconPreloader = () => {
  useEffect(() => {
    // Force render all icons to ensure they're loaded
    const iconContainer = document.createElement('div');
    iconContainer.style.position = 'absolute';
    iconContainer.style.left = '-9999px';
    iconContainer.style.opacity = '0';
    iconContainer.style.pointerEvents = 'none';
    
    // Add all icons to preload them
    const icons = [
      Package, Eye, RotateCcw, Download, Search, Truck, RefreshCw, 
      Smartphone, CheckCircle, MapPin, Phone, Mail, Share2, Facebook, 
      MessageCircle, Calendar, Clock
    ];
    
    document.body.appendChild(iconContainer);
    
    return () => {
      if (document.body.contains(iconContainer)) {
        document.body.removeChild(iconContainer);
      }
    };
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <Package />
      <Eye />
      <RotateCcw />
      <Download />
      <Search />
      <Truck />
      <RefreshCw />
      <Smartphone />
      <CheckCircle />
      <MapPin />
      <Phone />
      <Mail />
      <Share2 />
      <Facebook />
      <MessageCircle />
      <Calendar />
      <Clock />
    </div>
  );
};

export default IconPreloader;
