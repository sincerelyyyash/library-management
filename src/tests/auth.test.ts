
import { Request, Response } from 'express';
import { signin } from '../controllers/auth.controller';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';

const prisma = new PrismaClient();

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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

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

  it('should sign in a user successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mockToken');

    await signin(mockRequest as Request, mockResponse as Response, mockNext);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, role: 'USER' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith('token', 'mockToken', {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 3600000,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 200,
        data: { token: 'mockToken' },
        message: 'Sign In successful',
      })
    );
  });

  it('should throw an error for invalid email', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(signin(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(ApiError);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid email or password',
      })
    );
  });

  it('should throw an error for invalid password', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'USER',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(signin(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(ApiError);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Password invalid',
      })
    );
  });

  it('should throw an error for invalid input', async () => {
    mockRequest.body = { email: 'invalid-email', password: '' };

    await expect(signin(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(ApiError);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
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
      })
    );
  });
});
