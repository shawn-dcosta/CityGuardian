import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issue with Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to update map tiles based on theme
const MapThemeUpdater = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }, [isDarkMode, map]);

  return null;
};

interface LocationMapProps {
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    loading: boolean;
    error: string | null;
  };
  isDarkMode: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, isDarkMode }) => {
  const { latitude, longitude, address, loading, error } = location;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <MapPin className="w-5 h-5 text-electric-blue-500" />
          Detected Location
        </h3>
        <div className="space-y-3">
          <div className="skeleton h-4 rounded w-3/4"></div>
          <div className="skeleton h-64 rounded-xl"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <MapPin className="w-5 h-5 text-electric-blue-500" />
          Detected Location
        </h3>
        <p className="text-sm text-red-500">{error}</p>
      </motion.div>
    );
  }

  if (!latitude || !longitude) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-6 overflow-hidden h-full flex flex-col"
    >
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100 flex-shrink-0">
        <MapPin className="w-5 h-5 text-electric-blue-500" />
        Detected Location
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-shrink-0">
        {address}
      </p>

      <div className="rounded-xl overflow-hidden shadow-lg flex-1 w-full relative">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url={
              isDarkMode
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapThemeUpdater isDarkMode={isDarkMode} />
          <Marker position={[latitude, longitude]}>
            <Popup>Your Current Location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default LocationMap;
