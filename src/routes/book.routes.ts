
import { Router } from 'express';
import { addBook, borrowBook, deleteBook, getBooks, returnBook, updateBook } from '../controllers/book.controller';

const router = Router();

router.route("/add").post(addBook)
router.route("/get-books").get(getBooks)
router.route("/:isbn").put(updateBook)
router.route("/:isbn").delete(deleteBook)

router.route("/borrow").post(borrowBook)
router.route("/return").post(returnBook)

export default router;
