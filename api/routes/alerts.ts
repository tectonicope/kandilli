import { Hono } from "hono";
import { fetchEarthquakes } from "../utils/scraper";

const alerts = new Hono();

// Get significant earthquakes (magnitude >= 4.0)
alerts.get("/significant", async (c) => {
  const minMagnitude = parseFloat(c.req.query("min") || "4.0");
  
  const allEarthquakes = await fetchEarthquakes();
  const significantQuakes = allEarthquakes.filter(quake => {
    return quake && quake.magnitude >= minMagnitude;
  });
  
  return c.json({ 
    significant_earthquakes: significantQuakes,
    count: significantQuakes.length
  });
});

// Get earthquakes in critical regions
alerts.get("/critical-regions", async (c) => {
  // Define critical regions (can be expanded)
  const criticalRegions = [
    "ISTANBUL",
    "IZMIR",
    "ANKARA",
    "ANTALYA",
    "BURSA",
    "ADANA",
    "NORTH ANATOLIAN FAULT",
    "EAST ANATOLIAN FAULT"
  ].map(region => region.toLowerCase());
  
  const allEarthquakes = await fetchEarthquakes();
  const criticalQuakes = allEarthquakes.filter(quake => {
    const location = quake?.location?.toLowerCase() ?? '';
    return criticalRegions.some(region => location.includes(region));
  });
  
  return c.json({ 
    critical_region_earthquakes: criticalQuakes,
    count: criticalQuakes.length
  });
});

// Get recent significant earthquakes (last 24 hours with magnitude >= threshold)
alerts.get("/recent-significant", async (c) => {
  const minMagnitude = parseFloat(c.req.query("min") || "3.0");
  const hoursWindow = parseInt(c.req.query("hours") || "24");
  
  const allEarthquakes = await fetchEarthquakes();
  
  // Get current date and time
  const now = new Date();
  const timeWindow = hoursWindow * 60 * 60 * 1000; // Convert hours to milliseconds
  
  const recentSignificant = allEarthquakes.filter(quake => {
    // Check magnitude threshold
    if (!quake || quake.magnitude < minMagnitude) return false;
    
    // Parse earthquake date and time
    const [day, month, year] = quake.date.split('.');
    const [hour, minute, second] = quake.time.split(':');
    
    const quakeDate = new Date(
      parseInt(`20${year}`), // Assuming years are in format YY
      parseInt(month) - 1, // Months are 0-indexed in JS
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
    
    // Check if within time window
    return (now.getTime() - quakeDate.getTime()) <= timeWindow;
  });
  
  return c.json({
    recent_significant_earthquakes: recentSignificant,
    count: recentSignificant.length,
    parameters: {
      min_magnitude: minMagnitude,
      hours_window: hoursWindow
    }
  });
});

// Get potentially damaging earthquakes (shallow + high magnitude)
alerts.get("/potentially-damaging", async (c) => {
  const minMagnitude = parseFloat(c.req.query("min") || "4.5");
  const maxDepth = parseFloat(c.req.query("depth") || "10"); // shallow earthquakes in km
  
  const allEarthquakes = await fetchEarthquakes();
  const damagingQuakes = allEarthquakes.filter(quake => {
    return quake && quake.magnitude >= minMagnitude && quake.depth <= maxDepth;
  });
  
  return c.json({
    potentially_damaging_earthquakes: damagingQuakes,
    count: damagingQuakes.length,
    parameters: {
      min_magnitude: minMagnitude,
      max_depth: maxDepth
    }
  });
});

export default alerts;