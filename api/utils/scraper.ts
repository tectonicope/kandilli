import { load } from 'cheerio';

const KANDILLI_URL = "http://www.koeri.boun.edu.tr/scripts/lst0.asp";

export async function fetchEarthquakes() {
  try {
    const res = await fetch(KANDILLI_URL);
    const text = await res.text();
    const $ = load(text);

    const rows = $('pre').text().split('\n').slice(7);
    const earthquakes = rows
      .map((row) => {
        const parts = row.trim().split(/\s+/);
        if (parts.length < 6) return null;

        const [date, time, lat, lon, depth, magnitude, ...locationParts] = parts;
        const location = locationParts.join(' ');

        return {
          date,
          time,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          depth: parseFloat(depth),
          magnitude: parseFloat(magnitude),
          location,
        };
      })
      .filter(Boolean);

    return earthquakes;
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    return [];
  }
}