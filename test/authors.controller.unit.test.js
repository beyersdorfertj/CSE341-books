import { jest } from '@jest/globals';

// Unit tests: each author controller handler in isolation with mocked models and fake req/res.
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
const {
  getAuthorsHandler,
  getAuthorByIdHandler,
  createAuthorHandler,
  updateAuthorHandler,
  deleteAuthorHandler,
} = await import('../src/controllers/authors.js');

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

const validAuthor = { id: 'a4', name: 'Jane Doe', birthYear: 1975 };
const validUpdate = { name: 'Jane A. Doe', birthYear: 1976 };

describe('authors controller (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorsHandler', () => {
    test('responds 200 with the authors', async () => {
      const authors = [validAuthor];
      authorsModel.getAllAuthors.mockResolvedValue(authors);
      const res = mockRes();

      await getAuthorsHandler({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authors);
    });

    test('responds 500 when the model throws', async () => {
      authorsModel.getAllAuthors.mockRejectedValue(new Error('DB down'));
      const res = mockRes();

      await getAuthorsHandler({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAuthorByIdHandler', () => {
    test('responds 200 with the matching author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(validAuthor);
      const res = mockRes();

      await getAuthorByIdHandler({ params: { id: 'a4' } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(validAuthor);
    });

    test('responds 404 when the author is not found', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);
      const res = mockRes();

      await getAuthorByIdHandler({ params: { id: 'none' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createAuthorHandler', () => {
    test('responds 201 with the created author', async () => {
      authorsModel.getAuthorById.mockResolvedValue(null);
      authorsModel.createAuthor.mockResolvedValue(validAuthor);
      const res = mockRes();

      await createAuthorHandler({ body: validAuthor }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(validAuthor);
    });

    test('responds 400 when a required field is missing', async () => {
      const res = mockRes();

      await createAuthorHandler({ body: { id: 'a4' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('responds 400 when birthYear is in the future', async () => {
      const res = mockRes();

      await createAuthorHandler({ body: { id: 'a4', name: 'Jane', birthYear: 3000 } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('responds 400 when the id already exists', async () => {
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a4' });
      const res = mockRes();

      await createAuthorHandler({ body: validAuthor }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateAuthorHandler', () => {
    test('responds 200 when the author is updated', async () => {
      authorsModel.updateAuthor.mockResolvedValue({ matchedCount: 1 });
      authorsModel.getAuthorById.mockResolvedValue({ id: 'a1', ...validUpdate });
      const res = mockRes();

      await updateAuthorHandler({ params: { id: 'a1' }, body: validUpdate }, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('responds 400 on invalid field', async () => {
      const res = mockRes();

      await updateAuthorHandler({ params: { id: 'a1' }, body: { name: '', birthYear: 1976 } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('responds 404 when the author does not exist', async () => {
      authorsModel.updateAuthor.mockResolvedValue({ matchedCount: 0 });
      const res = mockRes();

      await updateAuthorHandler({ params: { id: 'none' }, body: validUpdate }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteAuthorHandler', () => {
    test('responds 204 for an unreferenced author', async () => {
      booksModel.countBooksForAuthor.mockResolvedValue(0);
      authorsModel.deleteAuthor.mockResolvedValue({ deletedCount: 1 });
      const res = mockRes();

      await deleteAuthorHandler({ params: { id: 'a1' } }, res);

      expect(res.status).toHaveBeenCalledWith(204);
    });

    test('responds 409 when the author is still referenced by a book', async () => {
      booksModel.countBooksForAuthor.mockResolvedValue(2);
      const res = mockRes();

      await deleteAuthorHandler({ params: { id: 'a1' } }, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('responds 404 for an unknown id', async () => {
      booksModel.countBooksForAuthor.mockResolvedValue(0);
      authorsModel.deleteAuthor.mockResolvedValue({ deletedCount: 0 });
      const res = mockRes();

      await deleteAuthorHandler({ params: { id: 'none' } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
