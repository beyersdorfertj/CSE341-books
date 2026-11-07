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
    const books = await getAllBooks();
    return res.status(200).json(books);
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

// Stub handlers for issue-03 (finish books CRUD). Return 501 until implemented.
// Behaviour is pinned by test/books.test.js and test/books.controller.unit.test.js.

const createBookHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

const updateBookHandler = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented' });
};

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
