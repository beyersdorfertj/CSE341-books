import { getDb } from '../db/connect.js';

// Stubs for issue-02 (authors API CRUD). Bodies to be implemented.
// Contract is pinned by test/authors.model.unit.test.js.

const getAllAuthors = async () => {
  const db = await getDb();
  return await db.collection('authors').find({}, { projection: { _id: 0 } }).toArray();
};

const getAuthorById = async (authorId) => {
  const db = await getDb();
  return await db.collection('authors').findOne({ id: authorId }, { projection: { _id: 0 } });
};

const createAuthor = async (author) => {
  throw new Error('Not implemented');
};

const updateAuthor = async (authorId, fields) => {
  throw new Error('Not implemented');
};

const deleteAuthor = async (authorId) => {
  throw new Error('Not implemented');
};

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
