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
const auth_controller_1 = require("../controllers/auth.controller");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = require("../utils/apiError");
const prisma = new client_1.PrismaClient();
jest.mock('../prismaClient', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
describe('signin controller', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };
        mockResponse = {
            cookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should sign in a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'USER',
        };
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcryptjs_1.default.compare.mockResolvedValue(true);
        jsonwebtoken_1.default.sign.mockReturnValue('mockToken');
        yield (0, auth_controller_1.signin)(mockRequest, mockResponse, mockNext);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
        });
        expect(bcryptjs_1.default.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
        expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: 1, role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        expect(mockResponse.cookie).toHaveBeenCalledWith('token', 'mockToken', {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 3600000,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 200,
            data: { token: 'mockToken' },
            message: 'Sign In successful',
        }));
    }));
    it('should throw an error for invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.user.findUnique.mockResolvedValue(null);
        yield expect((0, auth_controller_1.signin)(mockRequest, mockResponse, mockNext)).rejects.toThrow(apiError_1.ApiError);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 401,
            message: 'Invalid email or password',
        }));
    }));
    it('should throw an error for invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword',
            role: 'USER',
        };
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcryptjs_1.default.compare.mockResolvedValue(false);
        yield expect((0, auth_controller_1.signin)(mockRequest, mockResponse, mockNext)).rejects.toThrow(apiError_1.ApiError);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 401,
            message: 'Password invalid',
        }));
    }));
    it('should throw an error for invalid input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.body = { email: 'invalid-email', password: '' };
        yield expect((0, auth_controller_1.signin)(mockRequest, mockResponse, mockNext)).rejects.toThrow(apiError_1.ApiError);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 400,
            message: 'Validation failed',
            errors: expect.arrayContaining([
                expect.objectContaining({
                    path: 'email',
                    message: expect.any(String),
                }),
                expect.objectContaining({
                    path: 'password',
                    message: expect.any(String),
                }),
            ]),
        }));
    }));
});
