import request from 'supertest';

// TDD specs for the Swagger/OpenAPI requirement of issues #9 and #10.
// Red until Swagger is wired up at /api-docs and an OpenAPI spec exists.
const { default: app } = await import('../app.js');
const { closeDb } = await import('../src/db/connect.js');
const { swaggerSpec } = await import('../swagger.js');

afterAll(async () => {
  await closeDb();
});

// Express path (/books/:id) -> OpenAPI path (/books/{id}).
const toOpenApiPath = (expressPath) => {
  return expressPath.replace(/:([^/]+)/g, '{$1}');
};

// Routes that intentionally are not part of the documented API.
const UNDOCUMENTED = new Set();

// Recursively collect every route registered on the app (app-level routes plus
// mounted routers), so a new undocumented route anywhere fails the suite.
const collectRoutes = (stack) => {
  const routes = [];
  for (const layer of stack) {
    if (layer.route) {
      const path = toOpenApiPath(layer.route.path);
      for (const method of Object.keys(layer.route.methods)) {
        routes.push({ method, path });
      }
    } else if (layer.handle && Array.isArray(layer.handle.stack)) {
      routes.push(...collectRoutes(layer.handle.stack));
    }
  }
  return routes;
};

const routes = collectRoutes(app.router.stack).filter((route) => {
  return !UNDOCUMENTED.has(`${route.method} ${route.path}`);
});

describe('Swagger documentation', () => {
  test('GET /api-docs serves the Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });

  test('the OpenAPI spec is built in process', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBe('3.0.0');
  });

  describe('every route is documented', () => {
    test('routes were discovered from the app', () => {
      expect(routes.length).toBeGreaterThan(0);
    });

    test.each(routes)('$method $path is documented', ({ method, path }) => {
      const spec = swaggerSpec;

      expect(spec.paths).toBeDefined();
      expect(spec.paths[path]).toBeDefined();
      expect(spec.paths[path][method]).toBeDefined();
    });
  });
});
