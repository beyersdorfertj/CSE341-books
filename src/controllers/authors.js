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
  try {
    return res.status(200).json(await getAllAuthors());
  } catch (err) {
    console.error('Get authors failed', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAuthorByIdHandler = async (req, res) => {
  try {
    const author = await getAuthorById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json(author);
  } catch (err) {
    console.error(`Get /authors/${req.params.id} by ID failed`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
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
