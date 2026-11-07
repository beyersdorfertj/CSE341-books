import { jest } from '@jest/globals';

// Unit tests: each model function in isolation with a mocked Mongo collection.
const toArray = jest.fn();
const collection = {
  find: jest.fn(() => {
    return { toArray };
  }),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
};
const db = {
  collection: jest.fn(() => {
    return collection;
  }),
};

jest.unstable_mockModule('../src/db/connect.js', () => {
  return {
    getDb: jest.fn(() => {
      return db;
    }),
    closeDb: jest.fn(),
  };
});

const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  countBooksForAuthor,
} = await import('../src/models/books.js');

describe('books model (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllBooks reads from the books collection and returns the array', async () => {
    const books = [{ id: 'b1', authorId: 'a1', title: 'Dune' }];
    toArray.mockResolvedValue(books);

    const result = await getAllBooks();

    expect(db.collection).toHaveBeenCalledWith('books');
    expect(collection.find).toHaveBeenCalledWith({}, { projection: { _id: 0 } });
    expect(result).toEqual(books);
  });

  test('getBookById queries by custom id', async () => {
    const book = { id: 'b1' };
    collection.findOne.mockResolvedValue(book);

    const result = await getBookById('b1');

    expect(collection.findOne).toHaveBeenCalledWith({ id: 'b1' }, { projection: { _id: 0 } });
    expect(result).toEqual(book);
  });

  test('createBook inserts the book and returns it', async () => {
    const book = { id: 'b4', authorId: 'a1', title: 'X', publicationDate: '2026-01-15' };
    collection.insertOne.mockResolvedValue({ acknowledged: true });

    const result = await createBook(book);

    expect(collection.insertOne).toHaveBeenCalledWith(book);
    expect(result).toEqual(book);
  });

  test('updateBook updates by id with $set and returns the result', async () => {
    const fields = { title: 'New' };
    collection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const result = await updateBook('b1', fields);

    expect(collection.updateOne).toHaveBeenCalledWith({ id: 'b1' }, { $set: fields });
    expect(result.matchedCount).toBe(1);
  });

  test.skip('deleteBook deletes by id and returns the result', async () => {
    collection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await deleteBook('b1');

    expect(collection.deleteOne).toHaveBeenCalledWith({ id: 'b1' });
    expect(result.deletedCount).toBe(1);
  });

  test('countBooksForAuthor counts books referencing the author', async () => {
    collection.countDocuments.mockResolvedValue(2);

    const result = await countBooksForAuthor('a1');

    expect(collection.countDocuments).toHaveBeenCalledWith({ authorId: 'a1' });
    expect(result).toBe(2);
  });
});
