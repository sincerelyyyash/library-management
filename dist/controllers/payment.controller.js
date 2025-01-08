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
exports.generateInvoice = exports.payFine = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const payment_schema_1 = require("../validationSchema/payment.schema");
const prisma = new client_1.PrismaClient();
exports.payFine = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = payment_schema_1.payFineSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { userId, borrowedBookId } = parsedBody.data;
    const borrowedBook = yield prisma.borrowedBook.findUnique({
        where: { id: borrowedBookId },
    });
    if (!borrowedBook || borrowedBook.userId !== userId) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "Borrow record not found" });
    }
    if (borrowedBook.fine === null || borrowedBook.fine <= 0) {
        throw new apiError_1.ApiError({ statusCode: 400, message: "No fines to pay" });
    }
    yield prisma.transaction.create({
        data: {
            userId,
            amount: borrowedBook.fine,
            createdAt: new Date(),
        },
    });
    yield prisma.borrowedBook.update({
        where: { id: borrowedBookId },
        data: { fine: 0 },
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: null,
        message: "Fine paid successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.generateInvoice = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = payment_schema_1.generateInvoiceSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { userId } = parsedBody.data;
    const transactions = yield prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    if (transactions.length === 0) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "No transactions found for this user" });
    }
    // invoice logic here (for simplicity, we will just return the transactions)
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: transactions,
        message: "Invoice generated successfully"
    });
    return res.status(response.statusCode).json(response);
}));
