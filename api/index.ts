import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { serveStatic } from 'hono/serve-static';
import quakes from './routes/quakes';
import filters from './routes/filters';
import statistics from './routes/statistics';
import alerts from './routes/alerts';

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')

// Serve API documentation at the root path
app.get("/", serveStatic({
  root: './public',
  getContent: async (path, c) => {
    return await fetch(new URL(path, import.meta.url)).then(res => res.ok ? res : null);
  }
}));

app.route("/quakes", quakes);
app.route("/filters", filters);
app.route("/statistics", statistics);
app.route("/alerts", alerts);

export default handle(app)
