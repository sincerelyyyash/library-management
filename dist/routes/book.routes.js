"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const book_controller_1 = require("../controllers/book.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route("/add").post(auth_middleware_1.isAdmin, book_controller_1.addBook);
router.route("/get-books").get(book_controller_1.getBooks);
router.route("/:isbn").put(auth_middleware_1.isAdmin, book_controller_1.updateBook);
router.route("/:isbn").delete(auth_middleware_1.isAdmin, book_controller_1.deleteBook);
router.route("/borrow").post(auth_middleware_1.verifyJWT, book_controller_1.borrowBook);
router.route("/return").post(auth_middleware_1.verifyJWT, book_controller_1.returnBook);
exports.default = router;
