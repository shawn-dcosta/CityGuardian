import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// HeatMap layer component
const HeatMapLayer = ({ data }: { data: any[]; isDarkMode: boolean }) => {
  const map = useMap();

  useEffect(() => {
    // Dynamically load heatmap plugin
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
          0.5: '#eab308',
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

// Component to handle map clicks for clearing selection
const MapClickHandler = ({ onMapClick }: { onMapClick: () => void }) => {
  useMapEvents({
    click: () => {
      onMapClick();
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
      // Stop propagation to prevent map click from clearing immediately
      e.originalEvent.stopPropagation();
      onLock();
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    },
  };

  // Sync popup state with lock
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
        <div className="p-2 min-w-[180px]">
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${point.Urgency === 'high' ? 'bg-red-100 text-red-700' :
                point.Urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
              {point.Urgency} Priority
            </span>
            <span className="text-[10px] text-gray-400">{point.Date}</span>
          </div>
          <h4 className="font-bold text-gray-900 text-sm mb-1">{point.Category || 'Issue Report'}</h4>
          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{point.issue || point.Issue || 'No description.'}</p>
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

  const urgencyColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#eab308',
    low: '#3b82f6'
  };

  const center: [number, number] = data.length > 0
    ? [data[0].lat, data[0].lon]
    : [19.0760, 72.8777]; // Default to Mumbai

  // Custom pulse marker icon
  const createPulseIcon = (urgency: string) => {
    // @ts-ignore
    if (!window.L) return null;

    // @ts-ignore
    return window.L.divIcon({
      className: 'custom-pulse-marker',
      html: `<div class="w-3 h-3 rounded-full relative" style="background-color: ${urgencyColors[urgency] || urgencyColors.medium}">
              <div class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${urgencyColors[urgency] || urgencyColors.medium}"></div>
            </div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🗺️ Live Issue Map
        </h3>

        {/* Map Legend - Top Right */}
        <div className="flex items-center gap-3 text-xs bg-gray-100 dark:bg-midnight-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Low</span>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 min-h-[400px] relative z-0">
        {data.length > 0 ? (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={false}
            className="z-0"
          >
            <ZoomControl position="bottomright" />
            <MapClickHandler onMapClick={() => setLockedId(null)} />

            <TileLayer
              className={isDarkMode ? 'map-tiles-dark' : ''}
              url={
                isDarkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              }
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <style>{`
              .map-tiles-dark {
                filter: brightness(0.8) contrast(1.2) hue-rotate(200deg) saturate(0.5) !important;
              }
              .leaflet-popup-content-wrapper {
                 border-radius: 12px;
                 overflow: hidden;
              }
            `}</style>

            {showHeatmap && <HeatMapLayer data={data} isDarkMode={isDarkMode} />}

            {data.map((point, index) => {
              const icon = createPulseIcon(point.Urgency);
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
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-midnight-900 text-gray-400 dark:text-gray-600">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-midnight-800 mb-2">
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-sm font-medium">No active reports on the map</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeatMap;
