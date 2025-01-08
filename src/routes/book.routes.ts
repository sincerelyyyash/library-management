
import { Router } from 'express';
import { addBook, borrowBook, deleteBook, getBooks, returnBook, updateBook } from '../controllers/book.controller';
import { isAdmin, isUser } from '../middleware/auth.middleware';

const router = Router();

router.route("/add").post(isAdmin, addBook)
router.route("/get-books").get(getBooks)
router.route("/:isbn").put(isAdmin, updateBook)
router.route("/:isbn").delete(isAdmin, deleteBook)

router.route("/borrow").post(isUser, borrowBook)
router.route("/return").post(isUser, returnBook)

export default router;
