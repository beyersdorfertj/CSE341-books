import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../models/authors.js';
import { countBooksForAuthor } from '../models/books.js';

// Stub handlers for issue-02 (authors API CRUD). Return 501 until implemented.
// Behaviour is pinned by test/authors.test.js and test/authors.controller.unit.test.js.

const getAuthorsHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

const getAuthorByIdHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

const createAuthorHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

const updateAuthorHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

const deleteAuthorHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

export {
  getAuthorsHandler,
  getAuthorByIdHandler,
  createAuthorHandler,
  updateAuthorHandler,
  deleteAuthorHandler,
};
