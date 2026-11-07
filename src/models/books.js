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

const updateBook = async (bookId, fields) => {
    const db = await getDb();
    return await db.collection('books').updateOne({ id: bookId }, { $set: fields });
};

const deleteBook = async (bookId) => {
    const db = await getDb();
    return await db.collection('books').deleteOne({ id: bookId });
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
