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
exports.generateMonthlyUsageReport = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const prisma = new client_1.PrismaClient();
exports.generateMonthlyUsageReport = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const reportData = yield prisma.borrowedBook.findMany({
        where: {
            borrowedAt: {
                gte: currentMonthStart,
            },
        },
        include: {
            book: true,
        },
    });
    const reportSummary = reportData.reduce((acc, record) => {
        acc.totalBorrowed += 1;
        acc.books.push(record.book.title);
        return acc;
    }, { totalBorrowed: 0, books: [] });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: reportSummary,
        message: "Monthly usage report generated successfully",
    });
    return res.status(response.statusCode).json(response);
}));
