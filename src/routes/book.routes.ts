
import { Router } from 'express';
import { addBook, deleteBook, getBooks, updateBook } from '../controllers/book.controller';

const router = Router();

router.route("/add").post(addBook)
router.route("/get-books").get(getBooks)
router.route("/:isbn").put(updateBook)
router.route("/:isbn").delete(deleteBook)


export default router;
