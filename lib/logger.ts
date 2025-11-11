type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace("T", " ").slice(0, -5);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.formatTimestamp();
    const levelUpper = `[${level.toUpperCase()}]`;
    const baseMessage = `[${timestamp}] ${levelUpper} ${message}`;

    if (data !== undefined) {
      return `${baseMessage}\n${JSON.stringify(data, null, 2)}`;
    }

    return baseMessage;
  }

  private shouldLog(): boolean {
    return this.isDevelopment;
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.log(this.formatMessage("info", message, data));
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.warn(this.formatMessage("warn", message, data));
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.error(this.formatMessage("error", message, data));
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.log(this.formatMessage("debug", message, data));
  }

  success(message: string, data?: any): void {
    if (!this.shouldLog()) return;
    console.log(this.formatMessage("info", message, data));
  }

  time(label: string): void {
    if (!this.shouldLog()) return;
    console.time(`[${this.formatTimestamp()}] ${label}`);
  }

  timeEnd(label: string): void {
    if (!this.shouldLog()) return;
    console.timeEnd(`[${this.formatTimestamp()}] ${label}`);
  }

  request(
    method: string,
    url: string,
    statusCode?: number,
    duration?: number
  ): void {
    if (!this.shouldLog()) return;

    let message = `${method} ${url}`;
    if (statusCode) {
      message += ` - ${statusCode}`;
    }
    if (duration) {
      message += ` (${duration}ms)`;
    }

    this.info(message);
  }

  database(operation: string, table: string, details?: any): void {
    if (!this.shouldLog()) return;
    this.debug(`Database: ${operation} on ${table}`, details);
  }

  apiResponse(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ): void {
    if (!this.shouldLog()) return;
    this.info(
      `API Response: ${method} ${endpoint} - ${statusCode} (${duration}ms)`
    );
  }

  webhook(eventType: string, eventId: string, processed: boolean): void {
    if (!this.shouldLog()) return;
    this.info(
      `Webhook: ${eventType} (${eventId}) - ${
        processed ? "Processed" : "Failed"
      }`
    );
  }
}

export const logger = new Logger();

export { Logger };
export type { LogLevel, LogEntry };
