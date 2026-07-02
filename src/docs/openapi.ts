/**
 * OpenAPI 3.0 specification for the Futbolle API.
 * Served with swagger-ui-express at /api/docs.
 *
 * The backend is a pure dataset provider: it serves players and a random secret.
 * All game logic (comparison, hints, blur, difficulty, history) lives in the frontend.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Futbolle API',
    version: '2.0.0',
    description:
      'Backend for the Futbolle game. A pure dataset provider: it exposes player ' +
      'search and a random secret player. The frontend owns all game logic and validation.',
  },
  servers: [{ url: '/', description: 'This server' }],
  tags: [{ name: 'players', description: 'Player dataset access' }],
  paths: {
    '/api/players/search': {
      get: {
        tags: ['players'],
        summary: 'Partial name search',
        description:
          'Returns full player objects whose name partially matches `q` ' +
          '(contains, case-insensitive), so the frontend can compare a guess locally. ' +
          'With `q` shorter than 2 characters it returns an empty array.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'mess',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 25, default: 8 },
          },
        ],
        responses: {
          200: {
            description: 'List of matching players',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Player' },
                },
              },
            },
          },
        },
      },
    },
    '/api/players/random': {
      get: {
        tags: ['players'],
        summary: 'Get a random player (the secret)',
        description:
          'Returns a full random player. The frontend uses it as the secret to guess ' +
          'and runs the whole game locally (comparison, hints, blurred photo, difficulty).',
        responses: {
          200: {
            description: 'A random player',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Player' },
              },
            },
          },
          500: {
            description: 'No players loaded in the database',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Error' } },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Player: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 158023 },
          name: { type: 'string', example: 'L. Messi' },
          age: { type: 'integer', example: 35 },
          photo: {
            type: 'string',
            example: 'https://cdn.sofifa.net/players/158/023/23_60.png',
          },
          nationality: { type: 'string', example: 'Argentina' },
          flag: { type: 'string' },
          overall: { type: 'integer', example: 91 },
          potential: { type: 'integer' },
          club: { type: 'string', example: 'Paris Saint-Germain' },
          clubLogo: { type: 'string' },
          value: { type: 'integer' },
          wage: { type: 'integer' },
          preferredFoot: { type: 'string' },
          position: { type: 'string', example: 'RW' },
          heightCm: { type: 'integer', example: 169 },
          weightLbs: { type: 'number' },
          bestOverallRating: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'No players loaded in the database' },
        },
      },
    },
  },
} as const;
