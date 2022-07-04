import { Logger } from './Logger';
import { ConsoleLogger } from './ConsoleLogger';

let logger: Logger;

export class LoggerFactory {
  public static getInstance(): Logger {
    if (!logger) {
      logger = new ConsoleLogger();
    }
    return logger;
  }
}
