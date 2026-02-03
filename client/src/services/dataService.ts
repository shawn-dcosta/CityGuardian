import axios from 'axios';
import { AI_API_URL } from '../config';

const API_URL = AI_API_URL;

/**
 * Fetches and processes data from Google Sheets via Backend Proxy
 * @returns {Promise<Array>} Processed report data
 */
export const fetchReportsData = async () => {
  try {
    // Fetch from local backend to avoid CORS and ensure consistent data source
    const response = await axios.get(`${API_URL}/reports`);

    // Backend returns parsed JSON array
    const rawData = response.data;

    return cleanData(rawData);
  } catch (error) {
    console.error('Error fetching reports data:', error);
    throw error;
  }
};

/**
 * Cleans and processes raw CSV data
 * @param {Array} data - Raw CSV data
 * @returns {Array} Cleaned data
 */
const cleanData = (data: any[]) => {
  return data
    .map(row => {
      // Clean column values
      const cleaned: any = {};
      Object.keys(row).forEach(key => {
        const cleanKey = key.trim();
        cleaned[cleanKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
      });

      // Parse location coordinates
      if (cleaned.Location && cleaned.Location.includes(',')) {
        const [lat, lon] = cleaned.Location.split(',').map((coord: string) => parseFloat(coord.trim()));
        cleaned.lat = lat;
        cleaned.lon = lon;
      }

      // Normalize Status (fix "Pending " space issue)
      if (cleaned.Status) {
        cleaned.Status = cleaned.Status.trim().charAt(0).toUpperCase() +
          cleaned.Status.trim().slice(1).toLowerCase();
      }

      // Normalize Category
      if (cleaned.Category) {
        cleaned.Category = cleaned.Category.trim();
      }

      // Normalize Urgency
      if (cleaned.Urgency) {
        cleaned.Urgency = cleaned.Urgency.trim().toLowerCase();
      }

      // Parse date if available
      if (cleaned.Date) {
        cleaned.parsedDate = new Date(cleaned.Date);
      }

      return cleaned;
    })
    .filter(row => row.lat && row.lon && !isNaN(row.lat) && !isNaN(row.lon)); // Remove invalid coordinates
};

/**
 * Calculate statistics from reports data
 * @param {Array} data - Reports data
 * @returns {Object} Statistics
 */
export const calculateStats = (data: any[]) => {
  const total = data.length;
  const pending = data.filter(r => r.Status === 'Pending').length;
  const resolved = data.filter(r => r.Status === 'Resolved').length;
  const successRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

  // Category breakdown
  const categoryBreakdown = data.reduce((acc: Record<string, number>, report: any) => {
    const category = report.Category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Urgency breakdown
  const urgencyBreakdown = data.reduce((acc: Record<string, number>, report: any) => {
    const urgency = report.Urgency || 'unknown';
    acc[urgency] = (acc[urgency] || 0) + 1;
    return acc;
  }, {});

  // Department workload (by category and urgency)
  const departmentWorkload = data.reduce((acc: Record<string, number>, report: any) => {
    const key = `${report.Category}-${report.Urgency}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    pending,
    resolved,
    successRate,
    categoryBreakdown,
    urgencyBreakdown,
    departmentWorkload
  };
};

/**
 * Group data for heatmap visualization
 * @param {Array} data - Reports data
 * @returns {Array} Heatmap data points
 */
export const prepareHeatmapData = (data: any[]) => {
  // Group reports by proximity (grid-based)
  const gridSize = 0.005; // Approximately 500m
  const heatmapGrid: Record<string, { lat: number, lon: number, count: number, urgency: Record<string, number> }> = {};

  data.forEach(report => {
    const gridLat = Math.round(report.lat / gridSize) * gridSize;
    const gridLon = Math.round(report.lon / gridSize) * gridSize;
    const key = `${gridLat},${gridLon}`;

    if (!heatmapGrid[key]) {
      heatmapGrid[key] = {
        lat: gridLat,
        lon: gridLon,
        count: 0,
        urgency: { high: 0, medium: 0, low: 0 }
      };
    }

    heatmapGrid[key].count += 1;
    if (report.Urgency && heatmapGrid[key].urgency[report.Urgency] !== undefined) {
      heatmapGrid[key].urgency[report.Urgency] += 1;
    }
  });

  return Object.values(heatmapGrid);
};
