import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

// Generate JWT token
export const generateToken = (payload, expiresIn = null) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const options = {
      expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'metrobotz.com',
      audience: 'metrobotz-users'
    };
    
    return jwt.sign(payload, secret, options);
  } catch (error) {
    logger.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const options = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'metrobotz.com',
      audience: 'metrobotz-refresh'
    };
    
    return jwt.sign(payload, secret, options);
  } catch (error) {
    logger.error('Refresh token generation error:', error);
    throw new Error('Failed to generate refresh token');
  }
};

// Verify JWT token
export const verifyToken = (token, audience = 'metrobotz-users') => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const options = {
      issuer: 'metrobotz.com',
      audience
    };
    
    return jwt.verify(token, secret, options);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      logger.error('Token verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};

// Extract token from request headers
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Generate token pair (access + refresh)
export const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    subscription: user.subscription.type,
    isVerified: user.security.isVerified
  };
  
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ userId: user._id });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  };
};

// Decode token without verification (for debugging)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode error:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const payload = {
      userId,
      type: 'password-reset'
    };
    
    const options = {
      expiresIn: '1h', // Password reset tokens expire in 1 hour
      issuer: 'metrobotz.com',
      audience: 'metrobotz-password-reset'
    };
    
    return jwt.sign(payload, secret, options);
  } catch (error) {
    logger.error('Password reset token generation error:', error);
    throw new Error('Failed to generate password reset token');
  }
};

// Verify password reset token
export const verifyPasswordResetToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const options = {
      issuer: 'metrobotz.com',
      audience: 'metrobotz-password-reset'
    };
    
    const decoded = jwt.verify(token, secret, options);
    
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid password reset token');
    } else {
      logger.error('Password reset token verification error:', error);
      throw new Error('Password reset token verification failed');
    }
  }
};

// Generate email verification token
export const generateEmailVerificationToken = (userId, email) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const payload = {
      userId,
      email,
      type: 'email-verification'
    };
    
    const options = {
      expiresIn: '24h', // Email verification tokens expire in 24 hours
      issuer: 'metrobotz.com',
      audience: 'metrobotz-email-verification'
    };
    
    return jwt.sign(payload, secret, options);
  } catch (error) {
    logger.error('Email verification token generation error:', error);
    throw new Error('Failed to generate email verification token');
  }
};

// Verify email verification token
export const verifyEmailVerificationToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const options = {
      issuer: 'metrobotz.com',
      audience: 'metrobotz-email-verification'
    };
    
    const decoded = jwt.verify(token, secret, options);
    
    if (decoded.type !== 'email-verification') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Email verification token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid email verification token');
    } else {
      logger.error('Email verification token verification error:', error);
      throw new Error('Email verification token verification failed');
    }
  }
};
