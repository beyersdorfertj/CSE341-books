import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
    const db = await getDb();
    return await db.collection('books').find().toArray();
};

const getBookById = async (bookId) => {
    const db = await getDb();
    return await db.collection('books').findOne({ id: bookId });
};

export { getBookById, getAllBooks };
