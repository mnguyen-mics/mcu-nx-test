import { logFunction } from './log/LoggingDecorator';

class Page {
  @logFunction()
  visit(url: string) {
    cy.visit(url);
  }
}

export default Page;
