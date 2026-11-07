import { getDb } from '../db/connect.js';

// Stubs for issue-02 (authors API CRUD). Bodies to be implemented.
// Contract is pinned by test/authors.model.unit.test.js.

const getAllAuthors = async () => {
  throw new Error('Not implemented');
};

const getAuthorById = async (authorId) => {
  throw new Error('Not implemented');
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
