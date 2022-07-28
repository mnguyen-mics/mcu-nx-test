import Page from '../../../Page';
import { logFunction } from '../../../log/LoggingDecorator';

class ActivityAnalyserTypePage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  getActivityAnalyserTypeWithName(name: string) {
    return cy.get('.mcs-menu-list-content-title').contains(name);
  }

  @logFunction()
  clickActivityAnalyserTypeWithName(name: string) {
    this.getActivityAnalyserTypeWithName(name).click();
  }

  @logFunction()
  clickDefaultActivityAnalyser() {
    this.clickActivityAnalyserTypeWithName('default');
  }
}

export default ActivityAnalyserTypePage;
