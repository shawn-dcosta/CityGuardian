import React from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Target } from 'lucide-react';
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

// Component to configure map initially
const MapTileLayer = ({ isDarkMode }: { isDarkMode: boolean }) => {
    // Basic OSM tile, but we could make it a dark variant based on theme if desired
    return (
        <TileLayer
            className={isDarkMode ? 'map-tiles-dark opacity-80' : 'map-tiles-standard opacity-90'}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
    );
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
  editableAddress?: string;
  onAddressChange?: (val: string) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, isDarkMode, editableAddress, onAddressChange }) => {
  const { latitude, longitude, address, loading, error } = location;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 h-full bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-inner relative overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>

        <h3 className="text-[10px] font-bold mb-6 flex items-center gap-2 text-gray-500 uppercase tracking-[0.2em] relative z-10">
          <Target className="w-4 h-4 text-city-blue animate-pulse" />
          Acquiring Geographic Data
        </h3>
        <div className="space-y-4 relative z-10 flex-1 flex flex-col">
          <div className="h-4 bg-gray-200/50 dark:bg-white/5 rounded w-3/4 animate-pulse"></div>
          <div className="flex-1 bg-white/50 dark:bg-[#0a0a0a] rounded-2xl border border-gray-200/50 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
             
             {/* Scanner effects */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none"></div>
             <motion.div
                 className="absolute inset-0 border-b-[4px] border-city-blue/30 z-10 bg-city-blue/5 blur-[2px]"
                 animate={{ top: ["-10%", "110%", "-10%"] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             />

             <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] animate-pulse">Running Trace...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 h-full bg-red-50/50 dark:bg-red-900/10 backdrop-blur-2xl rounded-3xl border border-red-200/50 dark:border-red-500/20 shadow-inner relative overflow-hidden"
      >
        <h3 className="font-heading text-lg font-black mb-4 flex items-center gap-2 text-red-600 dark:text-red-400 uppercase tracking-tighter">
          <MapPin className="w-5 h-5" />
          Lock Failed
        </h3>
        <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest leading-relaxed">
          {error}
        </p>
      </motion.div>
    );
  }

  if (!latitude || !longitude) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 h-full flex flex-col bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.1)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-5 border-b border-gray-200/50 dark:border-white/10 pb-4 relative z-10">
        <div className="p-1.5 rounded-lg bg-city-blue/10 dark:bg-city-blue/20">
            <Target className="w-4 h-4 text-city-blue" />
        </div>
        <div>
            <h3 className="font-heading text-xl font-black text-city-black dark:text-white uppercase tracking-tighter leading-none drop-shadow-sm">
                Geospatial Vector
            </h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Satellite Lock Acquired</p>
        </div>
      </div>
      
      {onAddressChange ? (
        <textarea
          value={editableAddress || ''}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter detailed location..."
          className="w-full text-xs font-bold uppercase tracking-widest mb-5 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a] outline-none focus:border-city-blue focus:ring-1 focus:ring-city-blue shadow-inner transition-all relative z-10"
          rows={2}
        />
      ) : (
        <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-city-black dark:text-gray-300 mb-5 line-clamp-2 p-4 rounded-xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0a] flex-shrink-0 shadow-inner relative z-10">
          {address}
        </p>
      )}

      <div className="flex-1 w-full relative rounded-2xl border border-gray-200 dark:border-white/10 min-h-[250px] overflow-hidden shadow-inner group relative z-10">
        
        {/* Cinematic hud elements over map */}
        <div className="absolute top-2 left-2 z-[400] pointer-events-none bg-black/40 backdrop-blur rounded px-2 py-1 border border-white/10">
            <span className="text-[8px] font-black text-white font-mono">{latitude.toFixed(4)}N {longitude.toFixed(4)}E</span>
        </div>
        <div className="absolute inset-0 ring-1 ring-inset ring-city-blue/20 pointer-events-none z-[400] rounded-2xl mix-blend-overlay"></div>

        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb' }}
          scrollWheelZoom={false}
          className="z-0"
        >
          <MapTileLayer isDarkMode={isDarkMode} />
          <Marker position={[latitude, longitude]}>
            <Popup className="font-heading font-black uppercase text-xs">Active Trace</Popup>
          </Marker>
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default LocationMap;
