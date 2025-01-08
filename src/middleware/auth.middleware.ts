import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { ApiError } from '../utils/apiError';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError({
        statusCode: 401,
        message: "Access Denied",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string };
    console.log("Decoded token:", decoded); // For debugging

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid token",
      });
    }
    next(error);
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyJWT(req, res, () => { });

    if (req.user?.role !== 'admin') {
      throw new ApiError({
        statusCode: 403,
        message: "Access denied. Admin role required.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isUser = (req: Request, res: Response, next: NextFunction) => {
  verifyJWT(req, res, next);
};

