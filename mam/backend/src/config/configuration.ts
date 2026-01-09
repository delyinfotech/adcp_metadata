import { readFileSync, existsSync } from 'fs';

/**
 * Read a secret from Docker secrets or fall back to environment variable
 * Docker secrets are mounted at /run/secrets/<secret_name>
 */
function readSecret(secretName: string, envVar: string, defaultValue: string): string {
  const secretPath = `/run/secrets/${secretName}`;

  // First, try to read from Docker secret file
  if (existsSync(secretPath)) {
    try {
      return readFileSync(secretPath, 'utf8').trim();
    } catch (error) {
      console.warn(`Warning: Could not read secret ${secretName}: ${error.message}`);
    }
  }

  // Fall back to environment variable
  const envValue = process.env[envVar];
  if (envValue) {
    return envValue;
  }

  // In production, fail if no secret is available (except for optional secrets)
  if (process.env.NODE_ENV === 'production' && defaultValue.includes('change')) {
    throw new Error(`Required secret ${secretName} not found. Set ${envVar} or provide Docker secret.`);
  }

  return defaultValue;
}

/**
 * Validate required configuration in production
 */
function validateProductionConfig(config: ReturnType<typeof getConfig>) {
  if (config.nodeEnv !== 'production') return;

  const errors: string[] = [];

  // Check for weak/default secrets
  if (config.jwt.secret.includes('super-secret') || config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET is weak or default. Use a strong random secret.');
  }

  if (config.database.password === 'password' || config.database.password.length < 16) {
    errors.push('DATABASE_PASSWORD is weak or default. Use a strong password.');
  }

  if (config.database.synchronize) {
    errors.push('DATABASE_SYNCHRONIZE=true is dangerous in production. Use migrations.');
  }

  if (config.cors.origin.some(o => o.includes('localhost'))) {
    errors.push('CORS_ORIGIN contains localhost. Update for production domain.');
  }

  if (errors.length > 0) {
    console.error('\n========================================');
    console.error('  PRODUCTION CONFIGURATION ERRORS');
    console.error('========================================');
    errors.forEach(e => console.error(`  ✗ ${e}`));
    console.error('========================================\n');
    throw new Error('Production configuration validation failed');
  }
}

function getConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 4000,
    apiPrefix: process.env.API_PREFIX || 'api/v1',

    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME || 'mediax',
      password: readSecret('database_password', 'DATABASE_PASSWORD', 'password'),
      database: process.env.DATABASE_NAME || 'mediax',
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      logging: process.env.DATABASE_LOGGING === 'true',
      ssl: process.env.DATABASE_SSL === 'true',
      // Connection pool settings for production
      pool: {
        min: parseInt(process.env.DATABASE_POOL_MIN, 10) || 5,
        max: parseInt(process.env.DATABASE_POOL_MAX, 10) || 20,
        idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT, 10) || 30000,
      },
    },

    jwt: {
      secret: readSecret('jwt_secret', 'JWT_SECRET', 'your-super-secret-jwt-key-change-this'),
      expiresIn: process.env.JWT_EXPIRATION || '1d',
      refreshSecret: readSecret('jwt_refresh_secret', 'JWT_REFRESH_SECRET', 'your-super-secret-refresh-key-change-this'),
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: readSecret('redis_password', 'REDIS_PASSWORD', ''),
      db: parseInt(process.env.REDIS_DB, 10) || 0,
    },

    minio: {
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      accessKey: readSecret('minio_access_key', 'MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: readSecret('minio_secret_key', 'MINIO_SECRET_KEY', 'minioadmin'),
      buckets: {
        originals: process.env.MINIO_BUCKET_ORIGINALS || 'content-originals',
        processed: process.env.MINIO_BUCKET_PROCESSED || 'content-processed',
        artifacts: process.env.MINIO_BUCKET_ARTIFACTS || 'extraction-artifacts',
      },
      useSSL: process.env.MINIO_USE_SSL === 'true',
    },

    cdn: {
      baseUrl: process.env.CDN_BASE_URL || 'http://localhost:9000',
    },

    kafka: {
      enabled: process.env.KAFKA_ENABLED === 'true',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      clientId: process.env.KAFKA_CLIENT_ID || 'mediax-ai',
      groupId: process.env.KAFKA_GROUP_ID || 'mediax-consumers',
    },

    metadataApi: {
      url: process.env.METADATA_API_URL || 'http://localhost:3005',
    },

    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5368709120, // 5GB
      allowedTypes: (
        process.env.ALLOWED_FILE_TYPES ||
        'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/flac'
      ).split(','),
    },

    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
      credentials: process.env.CORS_CREDENTIALS !== 'false', // Default to true
    },

    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },

    logging: {
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    },
  };
}

export default () => {
  const config = getConfig();
  validateProductionConfig(config);
  return config;
};
