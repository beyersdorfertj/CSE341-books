import request from 'supertest';

// Read-only E2E tests against the real MongoDB.
// MONGODB_URI is loaded via the test script (node --env-file=.env).
const { default: app } = await import('../app.js');
const { closeDb } = await import('../src/db/connect.js');

afterAll(async () => {
  await closeDb();
});

describe('Authors read routes (real DB)', () => {
  test('GET /authors returns 200 and an array without _id', async () => {
    const res = await request(app).get('/authors');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const author of res.body) {
      expect(author._id).toBeUndefined();
    }
  });

  test('GET /authors/:id returns the matching author', async () => {
    const list = await request(app).get('/authors');
    const first = list.body[0];

    const res = await request(app).get(`/authors/${first.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(first.id);
  });

  test('GET /authors/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/authors/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Author not found' });
  });
});
