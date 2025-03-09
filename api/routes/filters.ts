import { Hono } from "hono";
import { fetchEarthquakes } from "../utils/scraper";

const filters = new Hono();

// Get earthquakes by date range
filters.get("/date", async (c) => {
  const startDate = c.req.query("start");
  const endDate = c.req.query("end");
  
  if (!startDate || !endDate) {
    return c.json({ error: "Both start and end date parameters are required" }, 400);
  }
  
  const allEarthquakes = await fetchEarthquakes();
  const filteredEarthquakes = allEarthquakes.filter(quake => {
    return quake && quake.date ? quake.date >= startDate && quake.date <= endDate : false;
  });
  
  return c.json({ earthquakes: filteredEarthquakes });
});

// Get earthquakes by magnitude range
filters.get("/magnitude", async (c) => {
  const minMag = parseFloat(c.req.query("min") || "0");
  const maxMag = parseFloat(c.req.query("max") || "10");
  
  const allEarthquakes = await fetchEarthquakes();
  const filteredEarthquakes = allEarthquakes.filter(quake => {
    return quake && quake.magnitude ? quake.magnitude >= minMag && quake.magnitude <= maxMag : false;
  });
  
  return c.json({ earthquakes: filteredEarthquakes });
});

// Get earthquakes by location (partial text match)
filters.get("/location", async (c) => {
  const locationQuery = c.req.query("q");
  
  if (!locationQuery) {
    return c.json({ error: "Location query parameter is required" }, 400);
  }
  
  const allEarthquakes = await fetchEarthquakes();
  const filteredEarthquakes = allEarthquakes.filter(quake => {
    return quake && quake.location ? quake.location.toLowerCase().includes(locationQuery.toLowerCase()) : false;
  });
  
  return c.json({ earthquakes: filteredEarthquakes });
});

// Get earthquakes by geographic radius
filters.get("/radius", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  const lon = parseFloat(c.req.query("lon") || "0");
  const radius = parseFloat(c.req.query("radius") || "100"); // in kilometers
  
  if (isNaN(lat) || isNaN(lon)) {
    return c.json({ error: "Valid latitude and longitude parameters are required" }, 400);
  }
  
  const allEarthquakes = await fetchEarthquakes();
  const filteredEarthquakes = allEarthquakes.filter(quake => {
    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      lat, lon,
      quake?.latitude || 0, quake?.longitude || 0
    );
    return distance <= radius;
  });
  
  return c.json({ earthquakes: filteredEarthquakes });
});

// Get latest N earthquakes
filters.get("/latest", async (c) => {
  const limit = parseInt(c.req.query("limit") || "10");
  
  const allEarthquakes = await fetchEarthquakes();
  const latestEarthquakes = allEarthquakes.slice(0, limit);
  
  return c.json({ earthquakes: latestEarthquakes });
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default filters;