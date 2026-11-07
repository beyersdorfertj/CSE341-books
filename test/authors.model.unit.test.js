import { jest } from '@jest/globals';

// Unit tests: each author model function in isolation with a mocked Mongo collection.
const toArray = jest.fn();
const collection = {
  find: jest.fn(() => {
    return { toArray };
  }),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
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
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = await import('../src/models/authors.js');

describe('authors model (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllAuthors reads from the authors collection without _id', async () => {
    const authors = [{ id: 'a1', name: 'X', birthYear: 1975 }];
    toArray.mockResolvedValue(authors);

    const result = await getAllAuthors();

    expect(db.collection).toHaveBeenCalledWith('authors');
    expect(collection.find).toHaveBeenCalledWith({}, { projection: { _id: 0 } });
    expect(result).toEqual(authors);
  });

  test('getAuthorById queries by custom id without _id', async () => {
    const author = { id: 'a1', name: 'X', birthYear: 1975 };
    collection.findOne.mockResolvedValue(author);

    const result = await getAuthorById('a1');

    expect(collection.findOne).toHaveBeenCalledWith({ id: 'a1' }, { projection: { _id: 0 } });
    expect(result).toEqual(author);
  });

  test('createAuthor inserts the author and returns it', async () => {
    const author = { id: 'a4', name: 'Jane Doe', birthYear: 1975 };
    collection.insertOne.mockResolvedValue({ acknowledged: true });

    const result = await createAuthor(author);

    expect(collection.insertOne).toHaveBeenCalledWith(author);
    expect(result).toEqual(author);
  });

  test('updateAuthor updates by id with $set and returns the result', async () => {
    const fields = { name: 'Jane A. Doe', birthYear: 1976 };
    collection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const result = await updateAuthor('a1', fields);

    expect(collection.updateOne).toHaveBeenCalledWith({ id: 'a1' }, { $set: fields });
    expect(result.matchedCount).toBe(1);
  });

  test('deleteAuthor deletes by id and returns the result', async () => {
    collection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await deleteAuthor('a1');

    expect(collection.deleteOne).toHaveBeenCalledWith({ id: 'a1' });
    expect(result.deletedCount).toBe(1);
  });
});
