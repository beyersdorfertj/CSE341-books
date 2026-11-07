import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the DB layer to force errors that are hard to trigger against a real DB.
jest.unstable_mockModule('../src/models/books.js', () => {
  return {
    getAllBooks: jest.fn(),
    getBookById: jest.fn(),
  };
});

const { getAllBooks, getBookById } = await import('../src/models/books.js');
const { default: app } = await import('../app.js');

describe('Books routes error handling (mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /books returns 500 when the DB fails', async () => {
    getAllBooks.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/books');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Internal Server Error' });
  });

  test('GET /books/:id returns 500 when the DB fails', async () => {
    getBookById.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/books/b1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Internal Server Error' });
  });
});
