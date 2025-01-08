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
exports.signin = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const auth_schema_1 = require("../validationSchema/auth.schema");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
exports.register = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = auth_schema_1.registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { email, password } = parsedBody.data;
    const existingUser = yield prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new apiError_1.ApiError({ statusCode: 400, message: "Email already in use" });
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const user = yield prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'member'
        }
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 201,
        data: user,
        message: "User registered successfully"
    });
    return res.status(response.statusCode).json(response);
}));
exports.signin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedBody = auth_schema_1.signinSchema.safeParse(req.body);
    if (!parsedBody.success) {
        const errors = parsedBody.error.errors.map(err => ({
            path: err.path[0],
            message: err.message,
        }));
        throw new apiError_1.ApiError({ statusCode: 400, message: "Validation failed", errors });
    }
    const { email, password } = parsedBody.data;
    const user = yield prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new apiError_1.ApiError({
            statusCode: 401,
            message: "Invalid email or password"
        });
    }
    const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError({
            statusCode: 401,
            message: "Password invalid"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        role: user.role
    }, JWT_SECRET, {
        expiresIn: "1h"
    });
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600000
    });
    const response = new apiResponse_1.ApiResponse({
        statusCode: 200,
        data: { token },
        message: "Sign In successful"
    });
    return res.status(response.statusCode).json(response);
}));
