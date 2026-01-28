import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  interface LocationState {
    latitude: number | null;
    longitude: number | null;
    address: string;
    loading: boolean;
    error: string | null;
  }

  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: 'Fetching location...',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const address = await reverseGeocode(latitude, longitude);
          setLocation({
            latitude,
            longitude,
            address,
            loading: false,
            error: null
          });
        } catch (err) {
          setLocation({
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            loading: false,
            error: null
          });
        }
      },
      (_error) => {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Location permission denied. Please enable GPS for accurate reporting.'
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return location;
};

async function reverseGeocode(lat: number, lng: number) {
  // Strategy 1: Try OSM Nominatim (Best for full street address)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    );
    if (!response.ok) throw new Error('Nominatim failed');
    const data = await response.json();
    if (data.display_name) return data.display_name;
  } catch (err) {
    console.warn('Nominatim geocoding failed, falling back to BigDataCloud:', err);
  }

  // Strategy 2: Fallback to BigDataCloud (Reliable but less detailed)
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await response.json();

    const parts = [
      data.locality,
      data.city,
      data.principalSubdivision,
      data.countryName
    ].filter(Boolean);

    const uniqueParts = [...new Set(parts)];

    return uniqueParts.join(', ') || `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('All geocoding failed:', error);
    return `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`;
  }
}
