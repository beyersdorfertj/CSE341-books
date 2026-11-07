import request from 'supertest';

// Read-only E2E tests against the real MongoDB.
// MONGODB_URI is loaded via the test script (node --env-file=.env).
const { default: app } = await import('../app.js');
const { closeDb } = await import('../src/db/connect.js');

afterAll(async () => {
  await closeDb();
});

describe('Books read routes (real DB)', () => {
  test('GET /books returns 200 and an array', async () => {
    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /books exposes authorId and never _id', async () => {
    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    for (const book of res.body) {
      expect(book).toHaveProperty('authorId');
      expect(book._id).toBeUndefined();
    }
  });

  test('GET /books/:id returns the matching book', async () => {
    const list = await request(app).get('/books');
    const first = list.body[0];

    const res = await request(app).get(`/books/${first.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(first.id);
  });

  test('GET /books/:id returns 404 for an unknown id', async () => {
    const res = await request(app).get('/books/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Book not found' });
  });
});
