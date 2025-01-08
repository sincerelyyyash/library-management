"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnBookSchema = exports.borrowBookSchema = exports.updateBookSchema = exports.createBookSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createBookSchema = zod_1.default.object({
    isbn: zod_1.default.string().min(10).max(13),
    title: zod_1.default.string().min(1),
    copies: zod_1.default.number().int().min(1),
});
exports.updateBookSchema = zod_1.default.object({
    title: zod_1.default.string().optional(),
    copies: zod_1.default.number().int().min(1).optional(),
});
exports.borrowBookSchema = zod_1.default.object({
    userId: zod_1.default.number().int(),
    bookId: zod_1.default.number().int(),
});
exports.returnBookSchema = zod_1.default.object({
    userId: zod_1.default.number().int(),
    bookId: zod_1.default.number().int(),
});
