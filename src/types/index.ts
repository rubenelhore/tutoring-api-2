/**
 * Types and Interfaces
 */

// ============ USER TYPES ============

export interface UserRegister {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// ============ SESSION TYPES ============

export interface SessionCreate {
  question: string;
}

export interface SessionResponse {
  id: number;
  user_id: number;
  question: string;
  response: string;
  created_at: Date;
}

// ============ JWT PAYLOAD ============

export interface JWTPayload {
  sub: number;  // user_id
  iat?: number;
  exp?: number;
}

// ============ ERROR RESPONSES ============

export interface ErrorResponse {
  error: string;
  status: number;
}