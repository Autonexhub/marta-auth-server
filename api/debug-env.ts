/**
 * Debug endpoint to check environment variables
 * DO NOT use in production - this is for debugging only
 */
export default function handler(req: any, res: any) {
  const checks = {
    NODE_ENV: process.env.NODE_ENV ? 'SET' : 'MISSING',
    JWT_SECRET: (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) ? 'SET' : 'MISSING OR TOO SHORT',
    VERCEL_URL: process.env.VERCEL_URL ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    PHP_API_URL: process.env.PHP_API_URL ? 'SET' : 'MISSING',
    PHP_AUTH_SECRET: (process.env.PHP_AUTH_SECRET && process.env.PHP_AUTH_SECRET.length >= 32) ? 'SET' : 'MISSING OR TOO SHORT',
  };

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(checks, null, 2));
}
