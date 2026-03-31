import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Root endpoint for the auth server
 * Provides basic information and health check
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Health check endpoint
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      service: 'marta-auth-server',
    });
  }

  // Root endpoint
  return res.status(200).json({
    name: 'Marta Auth Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth/*',
      health: '/health',
      google: '/api/auth/signin/google',
    },
  });
}
