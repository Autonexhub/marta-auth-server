import { authHandler } from "../auth-config";

/**
 * Vercel Serverless Function
 *
 * This catch-all route handles all /api/auth/* requests
 * and delegates them to better-auth
 */
export default authHandler;
