
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { enableDisableUserSchema } from '../validationSchema/user.schema';

const prisma = new PrismaClient();

export const viewUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: {
      BorrowedBook: {
        include: {
          book: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError({ statusCode: 404, message: "User not found" });
  }

  const response = new ApiResponse({
    statusCode: 200,
    data: user,
    message: "User details retrieved successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const trackBorrowedBooksAndFines = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const borrowedBooks = await prisma.borrowedBook.findMany({
    where: { userId: Number(userId) },
    include: {
      book: true,
    },
  });

  const fines = borrowedBooks.reduce((total, borrowedBook) => {
    if (borrowedBook.returnedAt === null && borrowedBook.returnBy < new Date()) {
      const daysLate = Math.ceil((new Date().getTime() - borrowedBook.returnBy.getTime()) / (1000 * 3600 * 24));
      return total + daysLate;
    }
    return total;
  }, 0);

  const response = new ApiResponse({
    statusCode: 200,
    data: { borrowedBooks, fines },
    message: "Borrowed books and fines tracked successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const enableDisableUserAccount = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const parsedBody = enableDisableUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { isEnabled } = parsedBody.data;

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    throw new ApiError({ statusCode: 404, message: "User not found" });
  }

  await prisma.user.update({
    where: { id: Number(userId) },
    data: { isVerified: isEnabled },
  });

  const response = new ApiResponse({
    statusCode: 200,
    data: null,
    message: isEnabled ? "User account enabled successfully" : "User account disabled successfully"
  });

  return res.status(response.statusCode).json(response);
});

