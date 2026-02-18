// Frontend Logger - simple console wrapper with levels
class Logger {
  constructor(prefix = 'D-Lite') {
    this.prefix = prefix;
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatLog(level, message, data = {}) {
    return {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...data
    };
  }

  error(message, data = {}) {
    const log = this.formatLog('ERROR', message, data);
    console.error(`[${this.prefix}]`, log);
  }

  warn(message, data = {}) {
    const log = this.formatLog('WARN', message, data);
    console.warn(`[${this.prefix}]`, log);
  }

  info(message, data = {}) {
    const log = this.formatLog('INFO', message, data);
    console.log(`[${this.prefix}]`, log);
  }

  debug(message, data = {}) {
    if (import.meta.env.DEV) {
      const log = this.formatLog('DEBUG', message, data);
      console.log(`[${this.prefix}]`, log);
    }
  }
}

export default new Logger('D-Lite');
