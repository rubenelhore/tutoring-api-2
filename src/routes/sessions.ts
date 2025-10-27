/**
 * Tutoring session routes
 * Equivalent to: routers/sessions.py in FastAPI
 *
 * Endpoints:
 * - POST /sessions (create session + call OpenAI)
 * - GET /sessions (get my sessions)
 * - GET /sessions/:id (get specific session)
 */

import { Router, Request, Response } from "express";
import pool from "../database";
import { authMiddleware } from "../middlewares/auth";
import { SessionCreate, SessionResponse } from "../types";
import { OpenAI } from "openai";

const router = Router();

// Initialize OpenAI client only if API key is provided
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-key-here'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ============ CREATE SESSION ============

/**
 * POST /sessions
 * Create new tutoring session + call OpenAI
 *
 * FastAPI equivalent:
 * @app.post("/sessions")
 * async def create_session(session_data: SessionCreate, current_user: User = Depends(get_current_user)):
 *     response = client.chat.completions.create(
 *         model="gpt-4",
 *         messages=[{"role": "user", "content": session_data.question}]
 *     )
 *     new_session = TutoringSession(user_id=..., question=..., response=...)
 *     db.add(new_session)
 *     await db.commit()
 *     return new_session
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;  // ! because authMiddleware guarantees it exists
    const { question } = req.body as SessionCreate;

    if (!question) {
      res.status(400).json({ error: "Question is required" });
      return;
    }

    // Call OpenAI (or use mock response if no API key)
    let tutorResponse: string;

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",  // Change to "gpt-4" if you have access
          messages: [
            {
              role: "system",
              content: "You are a helpful tutoring assistant. Explain concepts clearly and provide examples."
            },
            {
              role: "user",
              content: question
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        tutorResponse = response.choices[0].message.content || "";
      } catch (error: any) {
        if (error.status === 401) {
          throw new Error("OpenAI API key is invalid. Please set a valid OPENAI_API_KEY in your .env file.");
        }
        throw error;
      }
    } else {
      // Mock response for development without OpenAI API key
      tutorResponse = `This is a simulated AI response to: "${question}"\n\n` +
        `To enable real AI responses:\n` +
        `1. Get an API key from https://platform.openai.com/api-keys\n` +
        `2. Add it to your .env file: OPENAI_API_KEY=sk-your-key\n` +
        `3. Restart the server\n\n` +
        `For now, this app will work with mock responses so you can test all other features!`;
    }

    // Save to database
    const result = await pool.query(
      `INSERT INTO tutoring_sessions (user_id, question, response)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, question, response, created_at`,
      [currentUser.id, question, tutorResponse]
    );

    const session: SessionResponse = result.rows[0];

    res.status(200).json({
      message: "Session created successfully",
      session
    });
  } catch (error: any) {
    console.error("Create session error:", error);

    // Specific error handling for OpenAI
    if (error.status === 401) {
      res.status(500).json({ error: "OpenAI API key invalid" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// ============ GET ALL USER SESSIONS ============

/**
 * GET /sessions
 * Get all my sessions
 *
 * FastAPI equivalent:
 * @app.get("/sessions")
 * async def get_user_sessions(current_user: User = Depends(get_current_user)):
 *     sessions = await db.query(TutoringSession).filter(...).all()
 *     return sessions
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // Get sessions with pagination
    const result = await pool.query(
      `SELECT id, user_id, question, response, created_at
       FROM tutoring_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [currentUser.id, limit, offset]
    );

    // Get total count for pagination
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM tutoring_sessions WHERE user_id = $1",
      [currentUser.id]
    );

    const sessions: SessionResponse[] = result.rows;
    const total = parseInt(countResult.rows[0].count);

    res.json({
      sessions,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (error: any) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SINGLE SESSION ============

/**
 * GET /sessions/:id
 * Get specific session
 */
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const sessionId = parseInt(req.params.id);

    const result = await pool.query(
      `SELECT id, user_id, question, response, created_at
       FROM tutoring_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, currentUser.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const session: SessionResponse = result.rows[0];
    res.json(session);
  } catch (error: any) {
    console.error("Get session error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
