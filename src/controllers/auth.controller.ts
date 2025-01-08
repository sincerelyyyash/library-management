
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { registerSchema, signinSchema } from '../validationSchema/auth.schema';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = registerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { email, password } = parsedBody.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError({ statusCode: 400, message: "Email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'member'
    }
  });

  const response = new ApiResponse({
    statusCode: 201,
    data: user,
    message: "User registered successfully"
  });

  return res.status(response.statusCode).json(response);
});


export const signin = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = signinSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.errors.map(err => ({
      path: err.path[0],
      message: err.message,
    }));
    throw new ApiError({ statusCode: 400, message: "Validation failed", errors });
  }

  const { email, password } = parsedBody.data;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid email or password"
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError({
      statusCode: 401,
      message: "Password invalid"
    });
  }

  const token = jwt.sign({
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

  const response = new ApiResponse({
    statusCode: 200,
    data: { token },
    message: "Sign In successful"
  });

  return res.status(response.statusCode).json(response);
});

