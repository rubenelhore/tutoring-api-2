/**
 * Tests with Jest
 * Equivalent to: pytest in FastAPI
 */

import request from "supertest";
import app from "../src/index";
import pool from "../src/database";

// Run before all tests
beforeAll(async () => {
  // Clean test database
  try {
    await pool.query("TRUNCATE TABLE tutoring_sessions CASCADE");
    await pool.query("TRUNCATE TABLE users CASCADE");
  } catch (error) {
    console.error("Error cleaning up test database:", error);
  }
});

// Run after all tests
afterAll(async () => {
  // Close connections
  await pool.end();
});

describe("Auth Routes", () => {

  // ============ TEST REGISTER ============

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "newuser@example.com",
        password: "securepassword123",
        name: "New User"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("newuser@example.com");
  });

  it("should reject registration with short password", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "short",  // < 8 characters
        name: "Test"
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("at least 8 characters");
  });

  it("should reject duplicate email", async () => {
    // First registration
    await request(app)
      .post("/auth/register")
      .send({
        email: "duplicate@example.com",
        password: "password123",
        name: "First"
      });

    // Attempt duplicate
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "duplicate@example.com",
        password: "password456",
        name: "Second"
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("already exists");
  });

  // ============ TEST LOGIN ============

  it("should login and return access token", async () => {
    // Register first
    const registerRes = await request(app)
      .post("/auth/register")
      .send({
        email: "login@example.com",
        password: "password123",
        name: "Login Test"
      });

    // Then login
    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: "login@example.com",
        password: "password123"
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("access_token");
    expect(loginRes.body).toHaveProperty("token_type");
    expect(loginRes.body.token_type).toBe("bearer");
    expect(loginRes.body).toHaveProperty("user");
  });

  it("should reject login with wrong password", async () => {
    // Register
    await request(app)
      .post("/auth/register")
      .send({
        email: "wrongpwd@example.com",
        password: "correctpassword123",
        name: "Wrong Password Test"
      });

    // Attempt with wrong password
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "wrongpwd@example.com",
        password: "wrongpassword123"
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Invalid credentials");
  });

  it("should reject login with non-existent email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "anypassword"
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Invalid credentials");
  });
});

describe("Protected Routes", () => {
  let token: string;

  beforeEach(async () => {
    // Register and get token for each test
    const email = `testuser${Date.now()}@example.com`;

    await request(app)
      .post("/auth/register")
      .send({
        email: email,
        password: "password123",
        name: "Test User"
      });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: email,
        password: "password123"
      });

    token = loginRes.body.access_token;
  });

  it("should access protected route with valid token", async () => {
    const response = await request(app)
      .get("/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("sessions");
  });

  it("should reject request without token", async () => {
    const response = await request(app)
      .get("/sessions");

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("Missing authorization");
  });

  it("should reject request with invalid token", async () => {
    const response = await request(app)
      .get("/sessions")
      .set("Authorization", "Bearer invalid.token.here");

    expect(response.status).toBe(401);
  });
});
