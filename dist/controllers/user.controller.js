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
exports.enableDisableUserAccount = exports.trackBorrowedBooksAndFines = exports.viewUserDetails = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const user_schema_1 = require("../validationSchema/user.schema");
const prisma = new client_1.PrismaClient();
exports.viewUserDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield prisma.user.findUnique({
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
        throw new apiError_1.ApiError({ statusCode: 404, message: "User not found" });
    }
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: user,
        message: "User details retrieved successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.trackBorrowedBooksAndFines = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const borrowedBooks = yield prisma.borrowedBook.findMany({
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
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: { borrowedBooks, fines },
        message: "Borrowed books and fines tracked successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.enableDisableUserAccount = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const parsedBody = user_schema_1.enableDisableUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { isEnabled } = parsedBody.data;
    const user = yield prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
        throw new apiError_1.ApiError({ statusCode: 404, message: "User not found" });
    }
    yield prisma.user.update({
        where: { id: Number(userId) },
        data: { isVerified: isEnabled },
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: null,
        message: isEnabled ? "User account enabled successfully" : "User account disabled successfully"
    });
    return res.status(response.statusCode).json(response);
}));
