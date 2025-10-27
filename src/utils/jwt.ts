/**
 * Auxiliar functions for JWT
 */

import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config";
import { JWTPayload } from "../types";

// ============ JWT UTILITIES ============

/**
 * Generate JWT Token
 */
export const generateToken = (userId: number): string => {
  const payload: JWTPayload = {
    sub: userId
  };

  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Verify and decode token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Validate that decoded is an object and has the sub property
    if (typeof decoded === 'object' && decoded !== null && 'sub' in decoded) {
      return {
        sub: typeof decoded.sub === 'number' ? decoded.sub : Number(decoded.sub),
        iat: decoded.iat,
        exp: decoded.exp
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

// ============ PASSWORD UTILITIES ============

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};