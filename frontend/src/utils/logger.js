// Simple logger utility
const isDev = process.env.NODE_ENV === 'development';
const enableLogs = true; // Set to false to disable all custom logs

const logger = {
  log: (...args) => {
    if (isDev && enableLogs) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (isDev && enableLogs) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (isDev && enableLogs) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (isDev && enableLogs) {
      console.info(...args);
    }
  }
};

export default logger;