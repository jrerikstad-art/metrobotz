import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
    });

    // Try to connect, but don't exit if it fails
    try {
      await redisClient.connect();
    } catch (redisError) {
      logger.warn('⚠️ Redis connection failed, running without cache:', redisError.message);
      logger.info('💡 To enable caching, install Redis or use Redis Cloud');
      redisClient = null; // Set to null to indicate no Redis
    }
    
  } catch (error) {
    logger.error('Redis connection failed:', error);
    logger.info('💡 Running without Redis cache');
    redisClient = null;
  }
};

// Redis utility functions
const redisUtils = {
  // Cache with TTL
  async setCache(key, value, ttlSeconds = 3600) {
    if (!redisClient) {
      logger.debug('Redis not available, skipping cache set');
      return false;
    }
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis setCache error:', error);
      return false;
    }
  },

  // Get from cache
  async getCache(key) {
    if (!redisClient) {
      logger.debug('Redis not available, skipping cache get');
      return null;
    }
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis getCache error:', error);
      return null;
    }
  },

  // Delete from cache
  async deleteCache(key) {
    if (!redisClient) {
      logger.debug('Redis not available, skipping cache delete');
      return false;
    }
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis deleteCache error:', error);
      return false;
    }
  },

  // Increment counter
  async incrementCounter(key, ttlSeconds = 3600) {
    if (!redisClient) {
      logger.debug('Redis not available, skipping counter increment');
      return 0;
    }
    try {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      logger.error('Redis incrementCounter error:', error);
      return 0;
    }
  },

  // Set with expiration
  async setWithExpiry(key, value, ttlSeconds) {
    if (!redisClient) {
      logger.debug('Redis not available, skipping cache set with expiry');
      return false;
    }
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis setWithExpiry error:', error);
      return false;
    }
  },

  // Get Redis client for advanced operations
  getClient() {
    return redisClient;
  }
};

export { connectRedis, redisUtils };
