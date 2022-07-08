import { Logger } from './Logger';

export class CypressLogger implements Logger {
  public log(message: string): void {
    //log in Cypress interface
    cy.log(message);
  }
}
