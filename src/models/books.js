import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
    const db = await getDb();
    return await db.collection('books').find({}, { projection: { _id: 0 } }).toArray();
};

const getBookById = async (bookId) => {
    const db = await getDb();
    return await db.collection('books').findOne({ id: bookId }, { projection: { _id: 0 } });
};

const createBook = async (book) => {
    const db = await getDb();
    await db.collection('books').insertOne(book);
    const { _id, ...created } = book;
    return created;
};

// Stubs for later issues (books update/delete). Bodies to be implemented.
// Contract is pinned by test/books.model.unit.test.js.

const updateBook = async (bookId, fields) => {
    throw new Error('Not implemented');
};

const deleteBook = async (bookId) => {
    throw new Error('Not implemented');
};

const countBooksForAuthor = async (authorId) => {
    const db = await getDb();
    return await db.collection('books').countDocuments({ authorId });
};

export {
    getBookById,
    getAllBooks,
    createBook,
    updateBook,
    deleteBook,
    countBooksForAuthor,
};
