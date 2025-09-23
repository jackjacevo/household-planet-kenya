// Console filter to hide base64 image data
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const filterBase64 = (args: any[]) => {
  return args.map(arg => {
    if (typeof arg === 'string' && arg.includes('data:image/')) {
      const base64Match = arg.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        return arg.replace(base64Match[1], '[BASE64_DATA_HIDDEN]');
      }
    }
    if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg, (key, value) => {
        if (typeof value === 'string' && value.includes('data:image/')) {
          const base64Match = value.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (base64Match) {
            return value.replace(base64Match[1], '[BASE64_DATA_HIDDEN]');
          }
        }
        return value;
      });
    }
    return arg;
  });
};

console.log = (...args: any[]) => {
  originalConsoleLog(...filterBase64(args));
};

console.error = (...args: any[]) => {
  originalConsoleError(...filterBase64(args));
};

console.warn = (...args: any[]) => {
  originalConsoleWarn(...filterBase64(args));
};

export {};