import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
    const db = getDb();
    return await db.collection('books').find().toArray();
};

export default getAllBooks;
