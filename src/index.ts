import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import playersRouter from './routes/players';
import { openapiSpec } from './docs/openapi';

const app = express();

// Open CORS: students consume this from localhost or GitHub Pages.
app.use(cors());

app.get('/', (_req, res) => {
  res.json({
    name: 'Futbolle API',
    status: 'ok',
    docs: '/api/docs',
    endpoints: ['GET /api/players/search?q=&limit=8', 'GET /api/players/random'],
  });
});

// Interactive documentation (Swagger UI) and raw JSON spec.
app.get('/api/docs.json', (_req, res) => res.json(openapiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api/players', playersRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Futbolle API listening on http://localhost:${port}`);
});
