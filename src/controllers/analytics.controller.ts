
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

const prisma = new PrismaClient();

interface ReportSummary {
  totalBorrowed: number;
  books: string[];
}

export const generateMonthlyUsageReport = asyncHandler(async (req: Request, res: Response) => {
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const reportData = await prisma.borrowedBook.findMany({
    where: {
      borrowedAt: {
        gte: currentMonthStart,
      },
    },
    include: {
      book: true,
    },
  });

  const reportSummary = reportData.reduce<ReportSummary>((acc, record) => {
    acc.totalBorrowed += 1;
    acc.books.push(record.book.title);
    return acc;
  }, { totalBorrowed: 0, books: [] });

  const response = new ApiResponse({
    statusCode: 200,
    data: reportSummary,
    message: "Monthly usage report generated successfully",
  });

  return res.status(response.statusCode).json(response);
});

