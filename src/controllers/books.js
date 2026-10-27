import { getAllBooks, getBookById } from '../models/books.js';

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
      res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.error(`GET /books/${req.params.id} failed:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { getBooksHandler, getBookByIdHandler };