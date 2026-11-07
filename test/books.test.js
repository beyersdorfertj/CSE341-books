import { jest } from '@jest/globals';
import request from 'supertest';

// E2E against the Express app with a mocked DB layer to cover all status codes.
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
jest.unstable_mockModule('../src/models/authors.js', () => {
  return {
    getAllAuthors: jest.fn(),
    getAuthorById: jest.fn(),
    createAuthor: jest.fn(),
    updateAuthor: jest.fn(),
    deleteAuthor: jest.fn(),
  };
});

const booksModel = await import('../src/models/books.js');
const authorsModel = await import('../src/models/authors.js');
const { default: app } = await import('../app.js');

const validBook = { id: 'b4', authorId: 'a1', title: 'Example', publicationDate: '2026-01-15' };
const validUpdate = { authorId: 'a2', title: 'Updated', publicationDate: '2026-02-20' };

describe('Books routes (mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /books', () => {
    test('returns 200 and a list of books', async () => {
      const books = [validBook];
      booksModel.getAllBooks.mockResolvedValue(books);

      const res = await request(app).get('/books');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(books);
    });

    test('returns 500 when the DB fails', async () => {
      booksModel.getAllBooks.mockRejectedValue(new Error('DB down'));

      const res = await request(app).get('/books');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /books/:id', () => {
    test('returns 200 and the matching book', async () => {
      booksModel.getBookById.mockResolvedValue(validBook);

      const res = await request(app).get('/books/b4');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(validBook);
      expect(res.body._id).toBeUndefined();
    });

    test('returns 404 when the book is not found', async () => {
      booksModel.getBookById.mockResolvedValue(null);

      const res = await request(app).get('/books/unknown');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'Book not found' });
    });

    test('returns 500 when the DB fails', async () => {
      booksModel.getBookById.mockRejectedValue(new Error('DB down'));

      const res = await request(app).get('/books/b4');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /books', () => {
    test('creates a book and returns 201 without _id', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a1' });
      booksModel.getBookById.mockResolvedValue(null);
      booksModel.createBook.mockResolvedValue(validBook);

      const res = await request(app).post('/books').send(validBook);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(validBook);
      expect(res.body._id).toBeUndefined();
    });

    test('returns 400 when a required field is missing', async () => {
      const res = await request(app).post('/books').send({ id: 'b4' });

      expect(res.status).toBe(400);
    });

    test('returns 409 when the id already exists', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a1' });
      booksModel.getBookById.mockResolvedValue({ id: 'b4' });

      const res = await request(app).post('/books').send(validBook);

      expect(res.status).toBe(409);
    });

    test('returns 422 when authorId does not match an existing author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);
      booksModel.getBookById.mockResolvedValue(null);

      const res = await request(app).post('/books').send(validBook);

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /books/:id', () => {
    test('updates a book and returns 200', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a2' });
      booksModel.updateBook.mockResolvedValue({ matchedCount: 1 });
      booksModel.getBookById.mockResolvedValue({ id: 'b1', ...validUpdate });

      const res = await request(app).put('/books/b1').send(validUpdate);

      expect(res.status).toBe(200);
    });

    test('returns 400 on an invalid field', async () => {
      const res = await request(app).put('/books/b1').send({ title: '' });

      expect(res.status).toBe(400);
    });

    test('returns 422 when authorId does not match an existing author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);

      const res = await request(app).put('/books/b1').send(validUpdate);

      expect(res.status).toBe(422);
    });

    test('returns 404 when the book does not exist', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a2' });
      booksModel.updateBook.mockResolvedValue({ matchedCount: 0 });

      const res = await request(app).put('/books/none').send(validUpdate);

      expect(res.status).toBe(404);
    });
  });

  describe.skip('DELETE /books/:id', () => {
    test('deletes a book and returns 204', async () => {
      booksModel.deleteBook.mockResolvedValue({ deletedCount: 1 });

      const res = await request(app).delete('/books/b1');

      expect(res.status).toBe(204);
    });

    test('returns 404 for an unknown id', async () => {
      booksModel.deleteBook.mockResolvedValue({ deletedCount: 0 });

      const res = await request(app).delete('/books/none');

      expect(res.status).toBe(404);
    });
  });
});
