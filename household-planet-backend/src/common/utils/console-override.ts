/**
 * Console override to prevent sensitive data logging in production
 */

const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

function sanitizeArgs(args: any[]): any[] {
  return args.map(arg => {
    if (typeof arg === 'string') {
      // Hide base64 data URLs
      if (arg.includes('data:image/')) {
        return arg.replace(/data:image\/[\w\/]+;base64,[A-Za-z0-9+\/=]+/g, 'data:image/[BASE64_HIDDEN]');
      }
      // Hide long base64-like strings
      if (arg.length > 500 && /^[A-Za-z0-9+\/]*={0,2}$/.test(arg)) {
        return `[BASE64_DATA:${arg.length}_chars]`;
      }
    }
    
    if (typeof arg === 'object' && arg !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(arg)) {
        if (key.toLowerCase().includes('buffer') || key.toLowerCase().includes('data')) {
          sanitized[key] = Buffer.isBuffer(value) ? `[BUFFER:${value.length}_bytes]` : '[DATA_HIDDEN]';
        } else if (typeof value === 'string' && value.includes('data:image/')) {
          sanitized[key] = value.replace(/data:image\/[\w\/]+;base64,[A-Za-z0-9+\/=]+/g, 'data:image/[BASE64_HIDDEN]');
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return arg;
  });
}

// Override console methods only in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.SANITIZE_LOGS === 'true') {
  console.log = (...args: any[]) => originalConsole.log(...sanitizeArgs(args));
  console.error = (...args: any[]) => originalConsole.error(...sanitizeArgs(args));
  console.warn = (...args: any[]) => originalConsole.warn(...sanitizeArgs(args));
  console.info = (...args: any[]) => originalConsole.info(...sanitizeArgs(args));
}

export { originalConsole };