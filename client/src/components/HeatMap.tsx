import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { Target } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// HeatMap layer component
const HeatMapLayer = ({ data }: { data: any[]; isDarkMode: boolean }) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    if (window.L && window.L.heatLayer) {
      const heatData = data.map(point => [point.lat, point.lon, point.count / 10]);

      // @ts-ignore
      const heatLayer = window.L.heatLayer(heatData, {
        radius: 25,
        blur: 35,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#3b82f6',
          0.5: '#f97316',
          1.0: '#ef4444'
        }
      });

      heatLayer.addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    }
  }, [data, map]);

  return null;
};

// Component to handle map clicks for clearing selection and reset filters
const MapClickHandler = ({ onMapReset }: { onMapReset: () => void }) => {
  useMapEvents({
    click: () => {
      onMapReset();
    },
  });
  return null;
};

// Interactive Marker Component
const InteractiveMarker = ({ point, icon, isLocked, onLock }: any) => {
  const markerRef = useRef<any>(null);

  const eventHandlers = {
    mouseover: () => {
      if (markerRef.current && !isLocked) {
        markerRef.current.openPopup();
      }
    },
    mouseout: () => {
      if (markerRef.current && !isLocked) {
        markerRef.current.closePopup();
      }
    },
    click: (e: any) => {
      e.originalEvent.stopPropagation();
      onLock();
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    },
  };

  useEffect(() => {
    if (markerRef.current) {
      if (isLocked) {
        markerRef.current.openPopup();
      } else {
        if (!isLocked) {
          markerRef.current.closePopup();
        }
      }
    }
  }, [isLocked]);

  return (
    <Marker
      position={[point.lat, point.lon]}
      icon={icon}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
      <Popup className="custom-popup" closeButton={false} autoPan={false}>
        <div className="p-4 min-w-[200px] border border-gray-200/50 dark:border-white/10 bg-white/95 dark:bg-city-black/95 backdrop-blur-xl rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-city-blue/10 blur-[30px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex justify-between items-start mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 relative z-10">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border ${
                point.Urgency === 'high' ? 'bg-city-red/10 border-city-red/30 text-city-red' :
                point.Urgency === 'medium' ? 'bg-city-orange/10 border-city-orange/30 text-city-orange' : 'bg-city-blue/10 border-city-blue/30 text-city-blue'
              }`}>
              {point.Urgency}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{point.Date}</span>
          </div>
          <h4 className="font-heading font-black text-city-black dark:text-white uppercase text-[13px] mb-1 leading-tight relative z-10 line-clamp-2 drop-shadow-sm">{point.Category || 'Anomaly'}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2 font-medium tracking-wide relative z-10">{point.issue || point.Issue || 'No trace description.'}</p>
        </div>
      </Popup>
    </Marker>
  );
};

interface HeatMapProps {
  data: any[];
  isDarkMode: boolean; 
  showHeatmap?: boolean;
}

const HeatMap: React.FC<HeatMapProps> = ({ data, isDarkMode, showHeatmap = true }) => {
  const [lockedId, setLockedId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(['high', 'medium', 'low']);

  const urgencyColors: Record<string, string> = {
    high: '#ef4444',     
    medium: '#f97316',   
    low: '#3b82f6'       
  };

  const center: [number, number] = data.length > 0
    ? [data[0].lat, data[0].lon]
    : [19.0760, 72.8777];

  const handleMapReset = () => {
    setLockedId(null);
    setActiveFilters(['high', 'medium', 'low']);
  };

  const toggleFilter = (urgency: string) => {
    setActiveFilters(prev => 
      prev.includes(urgency) 
        ? prev.filter(f => f !== urgency) 
        : [...prev, urgency]
    );
  };

  const createPulseIcon = (urgency: string, status: string) => {
    // @ts-ignore
    if (!window.L) return null;

    const isActive = status?.toLowerCase() !== 'resolved';

    // @ts-ignore
    return window.L.divIcon({
      className: 'custom-pulse-marker',
      html: `<div class="w-3 h-3 relative rounded-full border border-white/50 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style="background-color: ${urgencyColors[urgency] || urgencyColors.medium}">
              ${isActive ? `<div class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${urgencyColors[urgency] || urgencyColors.medium}"></div>` : ''}
            </div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  // Filter data for both markers and heatmap
  const filteredData = data.filter(p => activeFilters.includes(p.Urgency?.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/40 dark:bg-city-surface/40 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-white/10 p-6 h-full flex flex-col shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200/50 dark:border-white/10 relative z-10">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Target className="w-4 h-4 text-city-blue animate-pulse" />
          Geospatial Impact Map
        </h3>

        {/* Interactive Map Legend */}
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
          <button 
            onClick={() => toggleFilter('high')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-300 ${
              activeFilters.includes('high') 
                ? 'bg-city-red/10 border-city-red/30 text-city-red shadow-sm' 
                : 'bg-gray-100 dark:bg-white/5 border-transparent opacity-40 grayscale'
            }`}
          >
            <span className={`w-2 h-2 rounded-full bg-city-red shadow-[0_0_5px_rgba(239,68,68,0.8)] ${activeFilters.includes('high') ? 'animate-pulse' : ''}`}></span>
            <span>Critical</span>
          </button>
          
          <button 
            onClick={() => toggleFilter('medium')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-300 ${
              activeFilters.includes('medium') 
                ? 'bg-city-orange/10 border-city-orange/30 text-city-orange shadow-sm' 
                : 'bg-gray-100 dark:bg-white/5 border-transparent opacity-40 grayscale'
            }`}
          >
            <span className={`w-2 h-2 rounded-full bg-city-orange shadow-[0_0_5px_rgba(249,115,22,0.8)] ${activeFilters.includes('medium') ? 'animate-pulse' : ''}`}></span>
            <span>Moderate</span>
          </button>
          
          <button 
            onClick={() => toggleFilter('low')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-300 ${
              activeFilters.includes('low') 
                ? 'bg-city-blue/10 border-city-blue/30 text-city-blue shadow-sm' 
                : 'bg-gray-100 dark:bg-white/5 border-transparent opacity-40 grayscale'
            }`}
          >
            <span className={`w-2 h-2 rounded-full bg-city-blue shadow-[0_0_5px_rgba(59,130,246,0.8)] ${activeFilters.includes('low') ? 'animate-pulse' : ''}`}></span>
            <span>Low</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full rounded-2xl border border-gray-200/50 dark:border-white/10 min-h-[400px] relative z-10 overflow-hidden shadow-inner isolate">
        
        {/* HUD Elements */}
        <div className="absolute top-3 left-3 z-[400] pointer-events-none bg-city-black/40 dark:bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
            <span className="text-[9px] font-black text-white uppercase tracking-widest font-mono">SYS.MAP.TRACKING</span>
            {filteredData.length > 0 && <span className="text-[9px] text-city-blue font-bold ml-2 animate-pulse">LIVE</span>}
        </div>
        <div className="absolute inset-0 ring-1 ring-inset ring-city-blue/10 pointer-events-none z-[400] rounded-2xl"></div>

        {data.length > 0 ? (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%', backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb' }}
            scrollWheelZoom={true}
            zoomControl={false}
            className="z-0"
          >
            <ZoomControl position="bottomright" />
            <MapClickHandler onMapReset={handleMapReset} />

            <TileLayer
              className={isDarkMode ? 'map-tiles-dark opacity-80' : 'map-tiles-standard opacity-[0.85]'}
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <style>{`
              .leaflet-popup-content-wrapper {
                 border-radius: 0px !important;
                 background: transparent;
                 border: none;
                 box-shadow: none;
                 padding: 0;
                 overflow: visible;
              }
              .leaflet-popup-content {
                 margin: 0;
              }
              .leaflet-popup-tip {
                 display: none;
              }
            `}</style>

            {showHeatmap && <HeatMapLayer data={filteredData} isDarkMode={isDarkMode} />}

            {filteredData.filter(p => p.Status !== 'Resolved').map((point, index) => {
              const icon = createPulseIcon(point.Urgency, point.Status);
              if (!icon) return null;

              return (
                <InteractiveMarker
                  key={index}
                  point={point}
                  icon={icon}
                  isLocked={lockedId === index}
                  onLock={() => setLockedId(index)}
                />
              );
            })}
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#0a0a0a]/50 text-gray-400">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-city-blue/20 blur-xl rounded-full"></div>
              <Target className="w-10 h-10 text-gray-300 dark:text-gray-600 relative z-10 animate-pulse" />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Awaiting sector activity</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeatMap;
