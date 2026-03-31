/**
 * Test endpoint to debug auth initialization
 */
export default async function handler(req: any, res: any) {
  try {
    // Try to import the auth module
    const { auth } = await import('./auth-config');

    return res.status(200).json({
      status: 'success',
      message: 'Auth module loaded successfully',
      hasHandler: !!auth.handler,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Unknown error',
      stack: error.stack?.split('\n').slice(0, 5) || [],
    });
  }
}
