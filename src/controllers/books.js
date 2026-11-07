import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../models/books.js';
import { getAuthorById } from '../models/authors.js';

const getBooksHandler  = async (req, res) => {
  try {
    return res.status(200).json(await getAllBooks());
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getBookByIdHandler = async (req, res) => {
  try {
    const book = await getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.error(`GET /books/${req.params.id} failed:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const isValidIsoDate = (value) => {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
};

const hasValidBookFields = ({ authorId, title, publicationDate }) => {
  return (
    typeof authorId === 'string' && authorId.trim() !== '' &&
    typeof title === 'string' && title.trim() !== '' &&
    isValidIsoDate(publicationDate)
  );
};

const isValidBook = ({ id, authorId, title, publicationDate }) => {
  return (
    typeof id === 'string' && id.trim() !== '' &&
    hasValidBookFields({ authorId, title, publicationDate })
  );
};

const createBookHandler = async (req, res) => {
  try {
    const { id, authorId, title, publicationDate } = req.body;
    if (!isValidBook({ id, authorId, title, publicationDate })) {
      return res.status(400).json({ message: 'Invalid book data' });
    }
    if (await getBookById(id)) {
      return res.status(409).json({ message: 'Book id already exists' });
    }
    if (!(await getAuthorById(authorId))) {
      return res.status(422).json({ message: 'authorId does not match an existing author' });
    }
    return res.status(201).json(await createBook({ id, authorId, title, publicationDate }));
  } catch (error) {
    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateBookHandler = async (req, res) => {
  try {
    const { authorId, title, publicationDate } = req.body;
    if (!hasValidBookFields({ authorId, title, publicationDate })) {
      return res.status(400).json({ message: 'Invalid book data' });
    }
    if (!(await getAuthorById(authorId))) {
      return res.status(422).json({ message: 'authorId does not match an existing author' });
    }
    const result = await updateBook(req.params.id, { authorId, title, publicationDate });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(await getBookById(req.params.id));
  } catch (error) {
    console.error(`PUT /books/${req.params.id} failed:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Stub handler for a later issue (books delete). Returns 501 until implemented.
// Behaviour is pinned by test/books.test.js and test/books.controller.unit.test.js.

const deleteBookHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
};
