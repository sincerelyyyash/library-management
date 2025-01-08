import { PrismaClient } from '@prisma/client';
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";

const prisma = new PrismaClient();
const JWT_TOKEN = process.env.JWT_TOKEN || "secret-key-here";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError({
      statusCode: 401,
      message: "Access Denied",
    });
  }

  try {
    jwt.verify(token, JWT_TOKEN);
    next();
  } catch (error) {
    throw new ApiError({
      statusCode: 401,
      message: "Invalid token",
    });
  }
};



  export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError({
        statusCode: 401,
        message: "Authentication required",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_TOKEN) as { id: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { role: true },
      });

      if (!user || user.role !== 'admin') {
        throw new ApiError({
          statusCode: 403,
          message: "Access denied. Admin role required.",
        });
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError({
          statusCode: 401,
          message: "Invalid token",
        });
      }
      next(error);
    }
  };


  export const isUser = (req: Request, res: Response, next: NextFunction) => {
    verifyJWT(req, res, next);
  };

