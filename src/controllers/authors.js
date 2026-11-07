import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../models/authors.js';
import { countBooksForAuthor } from '../models/books.js';

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

const hasValidNameAndYear = ({ name, birthYear }) => {
  const currentYear = new Date().getFullYear();
  return (
    typeof name === 'string' && name.trim() !== '' &&
    Number.isInteger(birthYear) && birthYear >= 1000 && birthYear <= currentYear
  );
};

const isValidAuthor = ({ id, name, birthYear }) => {
  return typeof id === 'string' && id.trim() !== '' && hasValidNameAndYear({ name, birthYear });
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
  try {
    const { name, birthYear } = req.body;
    if (!hasValidNameAndYear({ name, birthYear })) {
      return res.status(400).json({ message: 'Invalid author data' });
    }
    const result = await updateAuthor(req.params.id, { name, birthYear });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json(await getAuthorById(req.params.id));
  } catch (err) {
    console.error(`PUT /authors/${req.params.id} failed`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAuthorHandler = async (req, res) => {
  try {
    if (await countBooksForAuthor(req.params.id) > 0) {
      return res.status(409).json({ message: 'Author is still referenced by books' });
    }
    const result = await deleteAuthor(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(`DELETE /authors/${req.params.id} failed`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getAuthorsHandler,
  getAuthorByIdHandler,
  createAuthorHandler,
  updateAuthorHandler,
  deleteAuthorHandler,
};
