import request from 'supertest';
import fs from 'node:fs';

// TDD specs for the Swagger/OpenAPI requirement of issues #9 and #10.
// Red until Swagger is wired up at /api-docs and an OpenAPI spec exists.
const { default: app } = await import('../app.js');
const { closeDb } = await import('../src/db/connect.js');

afterAll(async () => {
  await closeDb();
});

// Expected location of the generated/authored OpenAPI spec.
const SPEC_PATH = 'src/swagger.json';

// Every route the API exposes must be documented (OpenAPI path style: {id}).
const routes = [
  { method: 'get', path: '/books' },
  { method: 'get', path: '/books/{id}' },
  { method: 'post', path: '/books' },
  { method: 'put', path: '/books/{id}' },
  { method: 'delete', path: '/books/{id}' },
  { method: 'get', path: '/authors' },
  { method: 'get', path: '/authors/{id}' },
  { method: 'post', path: '/authors' },
  { method: 'put', path: '/authors/{id}' },
  { method: 'delete', path: '/authors/{id}' },
];

const loadSpec = () => {
  return JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
};

describe('Swagger documentation', () => {
  test('GET /api-docs serves the Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });

  test('an OpenAPI spec file exists and is valid JSON', () => {
    expect(fs.existsSync(SPEC_PATH)).toBe(true);
    expect(() => {
      loadSpec();
    }).not.toThrow();
  });

  describe('every route is documented', () => {
    test.each(routes)('$method $path is documented', ({ method, path }) => {
      const spec = loadSpec();

      expect(spec.paths).toBeDefined();
      expect(spec.paths[path]).toBeDefined();
      expect(spec.paths[path][method]).toBeDefined();
    });
  });
});
