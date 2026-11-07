import { jest } from '@jest/globals';

// Unit tests: each book controller handler in isolation with mocked models and fake req/res.
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
const {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} = await import('../src/controllers/books.js');

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => {
    return res;
  });
  res.json = jest.fn(() => {
    return res;
  });
  res.send = jest.fn(() => {
    return res;
  });
  return res;
};

const validBook = { id: 'b4', authorId: 'a1', title: 'Example', publicationDate: '2026-01-15' };
const validUpdate = { authorId: 'a2', title: 'Updated', publicationDate: '2026-02-20' };

describe('books controller (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBooksHandler', () => {
    test('responds 200 with the books', async () => {
      const books = [validBook];
      booksModel.getAllBooks.mockResolvedValue(books);
      const res = mockRes();

      await getBooksHandler({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    test('responds 500 when the model throws', async () => {
      booksModel.getAllBooks.mockRejectedValue(new Error('DB down'));
      const res = mockRes();

      await getBooksHandler({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getBookByIdHandler', () => {
    test('responds 200 with the matching book', async () => {
      booksModel.getBookById.mockResolvedValue(validBook);
      const res = mockRes();

      await getBookByIdHandler({ params: { id: 'b4' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(validBook);
    });

    test('responds 404 when the book is not found', async () => {
      booksModel.getBookById.mockResolvedValue(null);
      const res = mockRes();

      await getBookByIdHandler({ params: { id: 'none' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('responds 500 when the model throws', async () => {
      booksModel.getBookById.mockRejectedValue(new Error('DB down'));
      const res = mockRes();

      await getBookByIdHandler({ params: { id: 'b4' } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createBookHandler', () => {
    test('responds 201 with the created book', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a1' });
      booksModel.getBookById.mockResolvedValue(null);
      booksModel.createBook.mockResolvedValue(validBook);
      const res = mockRes();

      await createBookHandler({ body: validBook }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(validBook);
    });

    test('responds 400 when a required field is missing', async () => {
      const res = mockRes();

      await createBookHandler({ body: { id: 'b4' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('responds 409 when the id already exists', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a1' });
      booksModel.getBookById.mockResolvedValue({ id: 'b4' });
      const res = mockRes();

      await createBookHandler({ body: validBook }, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('responds 422 when authorId does not match an existing author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);
      booksModel.getBookById.mockResolvedValue(null);
      const res = mockRes();

      await createBookHandler({ body: validBook }, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('updateBookHandler', () => {
    test('responds 200 when the book is updated', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a2' });
      booksModel.updateBook.mockResolvedValue({ matchedCount: 1 });
      booksModel.getBookById.mockResolvedValue({ id: 'b1', ...validUpdate });
      const res = mockRes();

      await updateBookHandler({ params: { id: 'b1' }, body: validUpdate }, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('responds 422 when authorId does not match an existing author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);
      const res = mockRes();

      await updateBookHandler({ params: { id: 'b1' }, body: validUpdate }, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    test('responds 404 when the book does not exist', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a2' });
      booksModel.updateBook.mockResolvedValue({ matchedCount: 0 });
      const res = mockRes();

      await updateBookHandler({ params: { id: 'none' }, body: validUpdate }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe.skip('deleteBookHandler', () => {
    test('responds 204 when the book is deleted', async () => {
      booksModel.deleteBook.mockResolvedValue({ deletedCount: 1 });
      const res = mockRes();

      await deleteBookHandler({ params: { id: 'b1' } }, res);

      expect(res.status).toHaveBeenCalledWith(204);
    });

    test('responds 404 for an unknown id', async () => {
      booksModel.deleteBook.mockResolvedValue({ deletedCount: 0 });
      const res = mockRes();

      await deleteBookHandler({ params: { id: 'none' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
