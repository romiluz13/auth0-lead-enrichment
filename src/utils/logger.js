export class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  static currentLevel = Logger.levels.INFO;

  static setLevel(level) {
    this.currentLevel = level;
  }

  static formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextString = Object.keys(context).length 
      ? `\nContext: ${JSON.stringify(context, null, 2)}`
      : '';
    
    return `[${timestamp}] ${level}: ${message}${contextString}`;
  }

  static debug(message, context = {}) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  static info(message, context = {}) {
    if (this.currentLevel <= this.levels.INFO) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  static warn(message, context = {}) {
    if (this.currentLevel <= this.levels.WARN) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  static error(message, error = null, context = {}) {
    if (this.currentLevel <= this.levels.ERROR) {
      if (error) {
        context.error = {
          message: error.message,
          stack: error.stack
        };
      }
      console.error(this.formatMessage('ERROR', message, context));
    }
  }

  static startOperation(operation) {
    this.info(`Starting operation: ${operation}`);
    return new Date().getTime();
  }

  static endOperation(operation, startTime) {
    const duration = new Date().getTime() - startTime;
    this.info(`Completed operation: ${operation}`, { durationMs: duration });
  }
}