import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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

interface HeatMapProps {
  data: any[];
  isDarkMode: boolean;
  showHeatmap?: boolean;
}

const HeatMap: React.FC<HeatMapProps> = ({ data, isDarkMode, showHeatmap = true }) => {
  const urgencyColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#eab308',
    low: '#3b82f6'
  };

  const center: [number, number] = data.length > 0
    ? [data[0].lat, data[0].lon]
    : [19.0760, 72.8777]; // Default to Mumbai

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          🗺️ Live Issue Map
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Low</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: '400px' }}>
        {data.length > 0 ? (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url={
                isDarkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {showHeatmap && <HeatMapLayer data={data} isDarkMode={isDarkMode} />}

            {data.map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.lat, point.lon]}
                radius={8}
                fillColor={urgencyColors[point.Urgency] || urgencyColors.low}
                color="#fff"
                weight={2}
                opacity={1}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-gray-900">{point.Category || 'Unknown'}</p>
                    <p className="text-gray-600">Status: {point.Status}</p>
                    <p className="text-gray-600 capitalize">Urgency: {point.Urgency}</p>
                    {point.address && (
                      <p className="text-xs text-gray-500 mt-1">{point.address}</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No location data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeatMap;
