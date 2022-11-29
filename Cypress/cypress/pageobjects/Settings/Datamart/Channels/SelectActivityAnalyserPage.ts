import Page from '../../../Page';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class SelectActivityAnalyserPage extends Page {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  @logGetter()
  get btnAdd() {
    return cy.get('.mcs-addButton');
  }

  @logFunction()
  clickOnActivityAnalyser(name: string = this.name) {
    cy.get('.ant-table-row').contains(name).click();
  }

  @logFunction()
  clickBtnAdd() {
    this.btnAdd.click();
  }
}

export default SelectActivityAnalyserPage;
