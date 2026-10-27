import getAllBooks from '../models/books.js';

const getBooksHandler  = async (req, res) => {
  try {
    const books = await getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { getBooksHandler };