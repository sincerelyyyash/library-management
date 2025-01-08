
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { generateInvoiceSchema, payFineSchema } from '../validationSchema/payment.schema';

const prisma = new PrismaClient();

export const payFine = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = payFineSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { userId, borrowedBookId } = parsedBody.data;

  const borrowedBook = await prisma.borrowedBook.findUnique({
    where: { id: borrowedBookId },
  });

  if (!borrowedBook || borrowedBook.userId !== userId) {
    throw new ApiError({ statusCode: 404, message: "Borrow record not found" });
  }

  if (borrowedBook.fine === null || borrowedBook.fine <= 0) {
    throw new ApiError({ statusCode: 400, message: "No fines to pay" });
  }

  await prisma.transaction.create({
    data: {
      userId,
      amount: borrowedBook.fine,
      createdAt: new Date(),
    },
  });

  await prisma.borrowedBook.update({
    where: { id: borrowedBookId },
    data: { fine: 0 },
  });

  const response = new ApiResponse({
    statusCode: 200,
    data: null,
    message: "Fine paid successfully"
  });

  return res.status(response.statusCode).json(response);
});

export const generateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = generateInvoiceSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { userId } = parsedBody.data;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (transactions.length === 0) {
    throw new ApiError({ statusCode: 404, message: "No transactions found for this user" });
  }

  // invoice logic here (for simplicity, we will just return the transactions)

  const response = new ApiResponse({
    statusCode: 200,
    data: transactions,
    message: "Invoice generated successfully"
  });

  return res.status(response.statusCode).json(response);
});


