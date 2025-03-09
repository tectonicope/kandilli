import { Hono } from "hono";
import { fetchEarthquakes } from "../utils/scraper";

const statistics = new Hono();

// Get daily earthquake count
statistics.get("/daily", async (c) => {
  const allEarthquakes = await fetchEarthquakes();
  
  // Group earthquakes by date
  const dailyCounts: Record<string, number> = {};
  
  allEarthquakes.forEach(quake => {
    if (quake && quake.date) {
      dailyCounts[quake.date] = (dailyCounts[quake.date] || 0) + 1;
    }
  });
  
  return c.json({ daily_counts: dailyCounts });
});

// Get magnitude distribution
statistics.get("/magnitude-distribution", async (c) => {
  const allEarthquakes = await fetchEarthquakes();
  
  // Define magnitude ranges
  const ranges = [
    { min: 0, max: 2, label: "0-2" },
    { min: 2, max: 3, label: "2-3" },
    { min: 3, max: 4, label: "3-4" },
    { min: 4, max: 5, label: "4-5" },
    { min: 5, max: 6, label: "5-6" },
    { min: 6, max: 10, label: "6+" }
  ];
  
  // Count earthquakes in each range
  const distribution = ranges.map(range => {
    const count = allEarthquakes.filter(quake => 
      quake && quake.magnitude >= range.min && quake.magnitude < range.max
    ).length;
    
    return {
      range: range.label,
      count
    };
  });
  
  return c.json({ magnitude_distribution: distribution });
});

// Get region distribution
statistics.get("/region-distribution", async (c) => {
  const allEarthquakes = await fetchEarthquakes();
  
  // Group earthquakes by region
  const regionCounts: Record<string, number> = {};
  
  allEarthquakes.forEach(quake => {
    // Extract region from location (simplified approach)
    const locationParts = quake?.location?.split('-') || [];
    const region = locationParts[locationParts.length - 1].trim();
    
    if (regionCounts[region]) {
      regionCounts[region]++;
    } else {
      regionCounts[region] = 1;
    }
  });
  
  // Convert to array and sort by count
  const sortedRegions = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);
  
  return c.json({ region_distribution: sortedRegions });
});

// Get depth distribution
statistics.get("/depth-distribution", async (c) => {
  const allEarthquakes = await fetchEarthquakes();
  
  // Define depth ranges in kilometers
  const ranges = [
    { min: 0, max: 5, label: "0-5 km" },
    { min: 5, max: 10, label: "5-10 km" },
    { min: 10, max: 20, label: "10-20 km" },
    { min: 20, max: 50, label: "20-50 km" },
    { min: 50, max: 100, label: "50-100 km" },
    { min: 100, max: 1000, label: "100+ km" }
  ];
  
  // Count earthquakes in each depth range
  const distribution = ranges.map(range => {
    const count = allEarthquakes.filter(quake => 
      quake && quake.depth >= range.min && quake.depth < range.max
    ).length;
    
    return {
      range: range.label,
      count
    };
  });
  
  return c.json({ depth_distribution: distribution });
});

// Get summary statistics
statistics.get("/summary", async (c) => {
  const allEarthquakes = await fetchEarthquakes();
  
  // Calculate basic statistics
  const totalCount = allEarthquakes.length;
  
  // Find max magnitude
  const maxMagnitude = allEarthquakes.reduce(
    (max, quake) => quake ? Math.max(max, quake.magnitude) : max, 0
  );
  
  // Find average magnitude
  const avgMagnitude = allEarthquakes.reduce(
    (sum, quake) => quake ? sum + quake.magnitude : sum, 0
  ) / totalCount;
  
  // Find average depth
  const avgDepth = allEarthquakes.reduce(
    (sum, quake) => quake ? sum + quake.depth : sum, 0
  ) / totalCount;
  
  return c.json({
    summary: {
      total_earthquakes: totalCount,
      max_magnitude: maxMagnitude,
      avg_magnitude: parseFloat(avgMagnitude.toFixed(2)),
      avg_depth: parseFloat(avgDepth.toFixed(2))
    }
  });
});

export default statistics;