import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import quakes from './routes/quakes';
export const config = {
    runtime: 'edge'
};
const app = new Hono().basePath('/api');
app.route("/quakes", quakes);
export default handle(app);
