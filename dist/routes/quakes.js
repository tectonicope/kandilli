import { Hono } from "hono";
import { fetchEarthquakes } from "../utils/scraper";
const quakes = new Hono();
quakes.get("/", async (c) => {
    const data = await fetchEarthquakes();
    return c.json({ earthquakes: data });
});
export default quakes;
