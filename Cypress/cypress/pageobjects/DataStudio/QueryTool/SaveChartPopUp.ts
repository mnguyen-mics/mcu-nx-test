import Page from '../../Page';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class SaveChartPopUp extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get popUp() {
    return cy.get('.ant-modal-confirm-body-wrapper');
  }

  @logGetter()
  get chartNameField() {
    return cy.get('.mcs-aggregationRenderer_chart_name');
  }

  @logGetter()
  get btnSubmit() {
    return cy.get('.mcs-aggregationRenderer_charts_submit');
  }

  @logGetter()
  get btnReturn() {
    return cy.get('.mcs-aggregationRenderer_charts_return');
  }

  @logFunction()
  typeChartName(name: string) {
    this.chartNameField.type(name);
  }

  @logFunction()
  clickBtnSubmit() {
    this.btnSubmit.click();
  }

  @logFunction()
  clickBtnReturn() {
    this.btnReturn.click();
  }
}

export default SaveChartPopUp;
