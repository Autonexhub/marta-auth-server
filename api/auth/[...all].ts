import { authHandler } from "../../src/auth";

/**
 * Vercel Serverless Function
 *
 * This catch-all route handles all /api/auth/* requests
 * and delegates them to better-auth
 */
export default authHandler;
