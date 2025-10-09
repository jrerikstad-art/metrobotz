// MetroBotz Health Check API Route for Vercel
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'MetroBotz Backend is running on Vercel!',
    timestamp: new Date().toISOString(),
    version: 'vercel-1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
}