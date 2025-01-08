"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnBook = exports.borrowBook = exports.deleteBook = exports.updateBook = exports.getBooks = exports.addBook = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const book_schema_1 = require("../validationSchema/book.schema");
const prisma = new client_1.PrismaClient();
const MAX_BORROW_LIMIT = 3;
const BORROW_PERIOD_DAYS = 14;
exports.addBook = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = book_schema_1.createBookSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { isbn, title, copies } = parsedBody.data;
    const existingBook = yield prisma.book.findUnique({ where: { isbn } });
    if (existingBook) {
        throw new apiError_1.ApiError({ statusCode: 400, message: "Book with this ISBN already exists" });
    }
    const book = yield prisma.book.create({
        data: { isbn, title, copies }
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 201,
        data: book,
        message: "Book added successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.getBooks = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.query;
    const books = yield prisma.book.findMany({
        where: title ? { title: { contains: String(title), mode: 'insensitive' } } : {},
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: books,
        message: "Books retrieved successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.updateBook = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isbn } = req.params;
    const parsedBody = book_schema_1.updateBookSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const existingBook = yield prisma.book.findUnique({ where: { isbn } });
    if (!existingBook) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "Book not found" });
    }
    const updatedBook = yield prisma.book.update({
        where: { isbn },
        data: parsedBody.data,
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: updatedBook,
        message: "Book updated successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.deleteBook = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isbn } = req.params;
    const existingBook = yield prisma.book.findUnique({ where: { isbn } });
    if (!existingBook) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "Book not found" });
    }
    yield prisma.book.update({
        where: { isbn },
        data: { deletedAt: new Date() },
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: null,
        message: "Book deleted successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.borrowBook = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = book_schema_1.borrowBookSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { userId, bookId } = parsedBody.data;
    const borrowedCount = yield prisma.borrowedBook.count({
        where: { userId },
    });
    if (borrowedCount >= MAX_BORROW_LIMIT) {
        throw new apiError_1.ApiError({ statusCode: 400, message: "Borrow limit reached" });
    }
    const book = yield prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.copies <= 0) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "Book not available" });
    }
    yield prisma.borrowedBook.create({
        data: {
            userId,
            bookId,
            borrowedAt: new Date(),
            returnBy: new Date(Date.now() + BORROW_PERIOD_DAYS * 24 * 60 * 60 * 1000),
        },
    });
    yield prisma.book.update({
        where: { id: bookId },
        data: { copies: book.copies - 1 },
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 201,
        data: null,
        message: "Book borrowed successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.returnBook = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = book_schema_1.returnBookSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { userId, bookId } = parsedBody.data;
    const borrowedBook = yield prisma.borrowedBook.findFirst({
        where: {
            userId,
            bookId,
            returnedAt: null,
        },
    });
    if (!borrowedBook) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "Borrow record not found" });
    }
    const today = new Date();
    let fine = 0;
    if (today > borrowedBook.returnBy) {
        const daysLate = Math.ceil((today.getTime() - borrowedBook.returnBy.getTime()) / (1000 * 3600 * 24));
        fine = daysLate;
    }
    yield prisma.borrowedBook.update({
        where: { id: borrowedBook.id },
        data: {
            returnedAt: today,
            fine,
        },
    });
    const book = yield prisma.book.findUnique({ where: { id: bookId } });
    yield prisma.book.update({
        where: { id: bookId },
        data: { copies: book.copies + 1 },
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: { fine },
        message: "Book returned successfully"
    });
    return res.status(response.statusCode).json(response);
}));
