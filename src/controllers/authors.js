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

const isValidAuthor = ({ id, name, birthYear }) => {
  const currentYear = new Date().getFullYear();
  return (
    typeof id === 'string' && id.trim() !== '' &&
    typeof name === 'string' && name.trim() !== '' &&
    Number.isInteger(birthYear) && birthYear >= 1000 && birthYear <= currentYear
  );
};

const createAuthorHandler = async (req, res) => {
  try {
    const { id, name, birthYear } = req.body;
    if (!isValidAuthor({ id, name, birthYear })) {
      return res.status(400).json({ message: 'Invalid author data' });
    }
    if (await getAuthorById(id)) {
      return res.status(400).json({ message: 'Author id already exists' });
    }
    return res.status(201).json(await createAuthor({ id, name, birthYear }));
  } catch (err) {
    console.error('POST /authors failed', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
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
