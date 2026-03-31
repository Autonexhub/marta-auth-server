/**
 * Debug endpoint to check environment variables
 * DO NOT use in production - this is for debugging only
 */
export default function handler(req: any, res: any) {
  const envCheck = {
    NODE_ENV: !!process.env.NODE_ENV,
    JWT_SECRET: !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
    VERCEL_URL: !!process.env.VERCEL_URL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    PHP_API_URL: !!process.env.PHP_API_URL,
    PHP_AUTH_SECRET: !!process.env.PHP_AUTH_SECRET && process.env.PHP_AUTH_SECRET.length >= 32,
  };

  return res.status(200).json({
    message: 'Environment variables check (true = set, false = missing)',
    env: envCheck,
    vercelUrl: process.env.VERCEL_URL || 'not set',
  });
}
