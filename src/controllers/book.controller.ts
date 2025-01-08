
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { borrowBookSchema, createBookSchema, returnBookSchema, updateBookSchema } from '../validationSchema/book.schema';


const prisma = new PrismaClient();
const MAX_BORROW_LIMIT = 3;
const BORROW_PERIOD_DAYS = 14;

export const addBook = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = createBookSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { isbn, title, copies } = parsedBody.data;

  const existingBook = await prisma.book.findUnique({ where: { isbn } });
  if (existingBook) {
    throw new ApiError({ statusCode: 400, message: "Book with this ISBN already exists" });
  }

  const book = await prisma.book.create({
    data: { isbn, title, copies }
  });

  const response = new ApiResponse({
    statusCode: 201,
    data: book,
    message: "Book added successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.query;

  const books = await prisma.book.findMany({
    where: title ? { title: { contains: String(title), mode: 'insensitive' } } : {},
  });

  const response = new ApiResponse({
    statusCode: 200,
    data: books,
    message: "Books retrieved successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const { isbn } = req.params;

  const parsedBody = updateBookSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const existingBook = await prisma.book.findUnique({ where: { isbn } });

  if (!existingBook) {
    throw new ApiError({ statusCode: 404, message: "Book not found" });
  }

  const updatedBook = await prisma.book.update({
    where: { isbn },
    data: parsedBody.data,
  });

  const response = new ApiResponse({
    statusCode: 200,
    data: updatedBook,
    message: "Book updated successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const { isbn } = req.params;

  const existingBook = await prisma.book.findUnique({ where: { isbn } });

  if (!existingBook) {
    throw new ApiError({ statusCode: 404, message: "Book not found" });
  }

  await prisma.book.update({
    where: { isbn },
    data: { deletedAt: new Date() },
  });

  const response = new ApiResponse({
    statusCode: 200,
    data: null,
    message: "Book deleted successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const borrowBook = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = borrowBookSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { userId, bookId } = parsedBody.data;

  const borrowedCount = await prisma.borrowedBook.count({
    where: { userId },
  });

  if (borrowedCount >= MAX_BORROW_LIMIT) {
    throw new ApiError({ statusCode: 400, message: "Borrow limit reached" });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });

  if (!book || book.copies <= 0) {
    throw new ApiError({ statusCode: 404, message: "Book not available" });
  }

  await prisma.borrowedBook.create({
    data: {
      userId,
      bookId,
      borrowedAt: new Date(),
      returnBy: new Date(Date.now() + BORROW_PERIOD_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.book.update({
    where: { id: bookId },
    data: { copies: book.copies - 1 },
  });

  const response = new ApiResponse({
    statusCode: 201,
    data: null,
    message: "Book borrowed successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = returnBookSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { userId, bookId } = parsedBody.data;

  const borrowedBook = await prisma.borrowedBook.findFirst({
    where: {
      userId,
      bookId,
      returnedAt: null,
    },
  });

  if (!borrowedBook) {
    throw new ApiError({ statusCode: 404, message: "Borrow record not found" });
  }

  const today = new Date();
  let fine = 0;

  if (today > borrowedBook.returnBy) {
    const daysLate = Math.ceil((today.getTime() - borrowedBook.returnBy.getTime()) / (1000 * 3600 * 24));
    fine = daysLate;
  }

  await prisma.borrowedBook.update({
    where: { id: borrowedBook.id },
    data: {
      returnedAt: today,
      fine,
    },
  });

  const book = await prisma.book.findUnique({ where: { id: bookId } });

  await prisma.book.update({
    where: { id: bookId },
    data: { copies: book!.copies + 1 },
  });

  const response = new ApiResponse({
    statusCode: 200,
    data: { fine },
    message: "Book returned successfully"
  });

  return res.status(response.statusCode).json(response);
});
