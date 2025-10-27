import { envOrDefault } from '@task-manager/common';

export const corsOptions = {
  origin: (origin) => {
    const allowedOrigins = [
      envOrDefault('APP_DOMAIN', 'http://localhost:3000'),
      'http://localhost:3000',
      'http://localhost:3001', // For alternative frontend ports
      'https://localhost:3000',
      'https://localhost:3001'
    ];

    if (!origin) return envOrDefault('APP_DOMAIN', 'http://localhost:3000');

    if (allowedOrigins.includes(origin)) {
      return origin;
    }

    if (process.env.NODE_ENV === 'development' || process.env.PLATFORM === 'dev') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return origin;
      }
    }

    return envOrDefault('APP_DOMAIN', 'http://localhost:3000');
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Client-Type',
    'Accept',
    'Origin',
    'User-Agent',
    'DNT',
    'Cache-Control',
    'X-Mx-ReqToken',
    'Keep-Alive',
    'X-Requested-With',
    'If-Modified-Since'
  ],
  exposeHeaders: [
    'X-Response-Time',
    'X-Request-Id',
    'X-Powered-By'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};
