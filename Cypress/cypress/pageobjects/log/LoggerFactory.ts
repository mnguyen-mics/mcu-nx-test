import { Logger } from './Logger';
import { CypressLogger } from './CypressLogger';

let logger: Logger;

export class LoggerFactory {
  public static getInstance(): Logger {
    if (!logger) {
      logger = new CypressLogger();
    }
    return logger;
  }
}
