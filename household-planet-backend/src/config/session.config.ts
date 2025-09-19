import * as session from 'express-session';

export class SessionConfig {
  static getSessionConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && !process.env.REDIS_URL) {
      console.warn('WARNING: Memory store is not suitable for production!');
      console.warn('Please configure REDIS_URL environment variable for production deployment.');
    }

    return {
      secret: process.env.SESSION_SECRET || 'change-this-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax' | 'none'
      },
      name: 'household-planet.sid'
    };
  }
}
