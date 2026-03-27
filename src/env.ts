import { z } from "zod";

/**
 * Environment variable schema validation
 */
const envSchema = z.object({
  // Core configuration
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  VERCEL_URL: z.string().url().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // PHP Backend Integration
  PHP_API_URL: z.string().url("PHP_API_URL must be a valid URL"),
  PHP_AUTH_SECRET: z.string().min(32, "PHP_AUTH_SECRET must be at least 32 characters"),
});

/**
 * Parse and validate environment variables
 */
function parseEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV || "development",
    JWT_SECRET: process.env.JWT_SECRET,
    VERCEL_URL: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    PHP_API_URL: process.env.PHP_API_URL,
    PHP_AUTH_SECRET: process.env.PHP_AUTH_SECRET,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

/**
 * Validated environment variables
 * Use this throughout the application
 */
export const env = parseEnv();

/**
 * Get base URL for the application
 */
export function getBaseUrl(): string {
  if (env.VERCEL_URL) {
    return env.VERCEL_URL.startsWith("http")
      ? env.VERCEL_URL
      : `https://${env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
