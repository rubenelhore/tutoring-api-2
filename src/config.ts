/**
 * Centralized configuration
 * First we import our libraries, our classes and modules
 */

import dotenv from "dotenv";
import path from "path";

// We instantiate the environment
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  // Database instantiation
  database: {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "tutoring_db"
  },

  // JWT for password and secret token
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "7d" as const
  },

  // OpenAI 
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ""
  },

  // Server
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    env: process.env.NODE_ENV || "development"
  }
};

// Validations
if (!config.openai.apiKey) {
  console.warn("⚠️  OPENAI_API_KEY no configurada");
}