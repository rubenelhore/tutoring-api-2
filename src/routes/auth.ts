/**
 * Authentication routes
 * Equivalent to: routers/auth.py in FastAPI
 *
 * Endpoints:
 * - POST /auth/register
 * - POST /auth/login
 */

import { Router, Request, Response } from "express";
import pool from "../database";
import { hashPassword, comparePassword, generateToken } from "../utils/jwt";
import { UserRegister, LoginRequest, UserResponse } from "../types";

const router = Router();

// ============ REGISTER ============

/**
 * POST /auth/register
 * Register new user
 *
 * FastAPI equivalent:
 * @app.post("/auth/register")
 * async def register(user_data: UserRegister):
 *     hashed_password = pwd_context.hash(user_data.password)
 *     new_user = User(email=..., password=..., name=...)
 *     db.add(new_user)
 *     await db.commit()
 *     return {"message": "User created"}
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as UserRegister;

    // Basic validation
    if (!email || !password || !name) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at",
      [email, hashedPassword, name]
    );

    const user: UserResponse = result.rows[0];

    res.status(200).json({
      message: "User registered successfully",
      user
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ LOGIN ============

/**
 * POST /auth/login
 * Generate JWT token
 *
 * FastAPI equivalent:
 * @app.post("/auth/login")
 * async def login(credentials: LoginRequest):
 *     user = await db.query(User).filter(User.email == credentials.email).first()
 *     if not user or not pwd_context.verify(credentials.password, user.password):
 *         raise HTTPException(status_code=401)
 *     token = jwt.encode({"sub": str(user.id)}, SECRET_KEY)
 *     return {"access_token": token}
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    // Find user
    const result = await pool.query(
      "SELECT id, email, password, name, created_at FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await comparePassword(password, user.password);

    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    // Don't send password in response
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };

    res.json({
      access_token: token,
      token_type: "bearer",
      user: userResponse
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;