
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { createBookSchema, updateBookSchema } from '../validationSchema/book.schema';


const prisma = new PrismaClient();

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
