import { jest } from '@jest/globals';
import request from 'supertest';

// E2E against the Express app with a mocked DB layer to cover all status codes.
jest.unstable_mockModule('../src/models/authors.js', () => {
  return {
    getAllAuthors: jest.fn(),
    getAuthorById: jest.fn(),
    createAuthor: jest.fn(),
    updateAuthor: jest.fn(),
    deleteAuthor: jest.fn(),
  };
});
jest.unstable_mockModule('../src/models/books.js', () => {
  return {
    getAllBooks: jest.fn(),
    getBookById: jest.fn(),
    createBook: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
    countBooksForAuthor: jest.fn(),
  };
});

const authorsModel = await import('../src/models/authors.js');
const booksModel = await import('../src/models/books.js');
const { default: app } = await import('../app.js');

const validAuthor = { id: 'a4', name: 'Jane Doe', birthYear: 1975 };
const validUpdate = { name: 'Jane A. Doe', birthYear: 1976 };

// Read (#14), create (#12) and update (#15) enabled. Delete stays skipped.
describe('Authors routes (mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /authors', () => {
    test('returns 200 and an array without _id', async () => {
      authorsModel.getAllAuthors.mockResolvedValue([validAuthor]);

      const res = await request(app).get('/authors');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]._id).toBeUndefined();
    });

    test('returns 200 and an empty array when there are no authors', async () => {
      authorsModel.getAllAuthors.mockResolvedValue([]);

      const res = await request(app).get('/authors');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 500 when the DB fails', async () => {
      authorsModel.getAllAuthors.mockRejectedValue(new Error('DB down'));

      const res = await request(app).get('/authors');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /authors/:id', () => {
    test('returns 200 and the matching author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(validAuthor);

      const res = await request(app).get('/authors/a4');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(validAuthor);
    });

    test('returns 404 for an unknown id', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);

      const res = await request(app).get('/authors/unknown');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Author not found' });
    });
  });

  describe('POST /authors', () => {
    test('creates an author and returns 201 without _id', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);
      authorsModel.createAuthor.mockResolvedValue(validAuthor);

      const res = await request(app).post('/authors').send(validAuthor);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(validAuthor);
      expect(res.body._id).toBeUndefined();
    });

    test('returns 400 when a required field is missing', async () => {
      const res = await request(app).post('/authors').send({ id: 'a4' });

      expect(res.status).toBe(400);
    });

    test('returns 400 when birthYear is in the future', async () => {
      const res = await request(app)
        .post('/authors')
        .send({ id: 'a4', name: 'Jane', birthYear: 3000 });

      expect(res.status).toBe(400);
    });

    test('returns 400 when the id already exists', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a4' });

      const res = await request(app).post('/authors').send(validAuthor);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /authors/:id', () => {
    test('updates an author and returns 200', async () => {
      authorsModel.updateAuthor.mockResolvedValue({ matchedCount: 1 });
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a1', ...validUpdate });

      const res = await request(app).put('/authors/a1').send(validUpdate);

      expect(res.status).toBe(200);
    });

    test('returns 400 on an invalid field', async () => {
      const res = await request(app).put('/authors/a1').send({ name: '', birthYear: 1976 });

      expect(res.status).toBe(400);
    });

    test('returns 404 for an unknown id', async () => {
      authorsModel.updateAuthor.mockResolvedValue({ matchedCount: 0 });

      const res = await request(app).put('/authors/none').send(validUpdate);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /authors/:id', () => {
    test('returns 204 for an unreferenced author', async () => {
      booksModel.countBooksForAuthor.mockResolvedValue(0);
      authorsModel.deleteAuthor.mockResolvedValue({ deletedCount: 1 });

      const res = await request(app).delete('/authors/a1');

      expect(res.status).toBe(204);
    });

    test('returns 409 when the author is still referenced by a book', async () => {
      booksModel.countBooksForAuthor.mockResolvedValue(2);

      const res = await request(app).delete('/authors/a1');

      expect(res.status).toBe(409);
    });

    test('returns 404 for an unknown id', async () => {
      booksModel.countBooksForAuthor.mockResolvedValue(0);
      authorsModel.deleteAuthor.mockResolvedValue({ deletedCount: 0 });

      const res = await request(app).delete('/authors/none');

      expect(res.status).toBe(404);
    });
  });
});
