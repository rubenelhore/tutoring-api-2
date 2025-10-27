/**
 * Middleware of auth in JWT
 * Equivalent to: def get_current_user(token: str = Depends(oauth2_scheme)): ... in FastAPI
 * 
 * First we import libraries, classes, and modules
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import pool from "../database";
import { UserResponse } from "../types";

// Extend express to add users
declare global {
  namespace Express {
    interface Request {
      user?: UserResponse;
    }
  }
}

/**
 * Middleware that verifies JWT and add user to the request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtain HEADER part of token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    // Extract token in format: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Invalid authorization header format" });
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Obtain user db
    const result = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [payload.sub]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Add user to request object
    req.user = result.rows[0];

    // Continue with next middleware
    next();
  } catch (error: any) {
    res.status(500).json({ error: "Authentication error" });
  }
};

/**
 * Middleware optional: only log if login exists
 * Specially useful por public routes
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);

      if (payload) {
        const result = await pool.query(
          "SELECT id, email, name, created_at FROM users WHERE id = $1",
          [payload.sub]
        );

        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }
      }
    }

    next();
  } catch (error) {
    // If error, continue without user
    next();
  }
};