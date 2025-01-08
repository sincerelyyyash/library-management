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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = exports.isAdmin = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const apiError_1 = require("../utils/apiError");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const verifyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req.headers["authorization"]) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        if (!token) {
            throw new apiError_1.ApiError({
                statusCode: 401,
                message: "Access Denied",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded); // For debugging
        const user = yield prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            throw new apiError_1.ApiError({
                statusCode: 401,
                message: "Invalid token",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new apiError_1.ApiError({
                statusCode: 401,
                message: "Invalid token",
            });
        }
        next(error);
    }
});
exports.verifyJWT = verifyJWT;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        yield (0, exports.verifyJWT)(req, res, () => { });
        if (((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            throw new apiError_1.ApiError({
                statusCode: 403,
                message: "Access denied. Admin role required.",
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.isAdmin = isAdmin;
const isUser = (req, res, next) => {
    (0, exports.verifyJWT)(req, res, next);
};
exports.isUser = isUser;
