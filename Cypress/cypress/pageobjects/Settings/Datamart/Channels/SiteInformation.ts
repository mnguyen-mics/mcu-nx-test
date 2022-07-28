import Page from '../../../Page';

import { logFunction, logGetter } from '../../../log/LoggingDecorator';
import SelectActivityAnalyserPage from './SelectActivityAnalyserPage';

class SiteInformation extends Page {
  name: string;
  token: string;
  domain: string;
  selectActivityAnalyserPage: SelectActivityAnalyserPage;

  constructor(name: string, token: string, domain: string) {
    super();
    this.name = name;
    this.token = token;
    this.domain = domain;
    this.selectActivityAnalyserPage = new SelectActivityAnalyserPage(this.name);
  }

  @logGetter()
  get nameField() {
    return cy.get('.mcs-generalFormSection_site_name');
  }

  @logGetter()
  get tokenField() {
    return cy.get('.mcs-generalFormSection_site_token');
  }

  @logGetter()
  get domainField() {
    return cy.get('.mcs-generalFormSection_site_domain');
  }

  @logGetter()
  get btnAddActivityAnalyser() {
    return cy.get('.mcs-timelineStepBuilder_addStepBtn');
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-form_saveButton_siteForm');
  }

  @logGetter()
  get errorRecoveryStrategy() {
    return cy.get('.mcs-VisitAnalyzerFormSection_timeline_errorRecoveryStrategy');
  }

  @logFunction()
  errorRecoveryStrategyAtPos(pos: number) {
    return this.errorRecoveryStrategy.eq(pos);
  }

  @logFunction()
  typeName(name: string = this.name) {
    this.nameField.clear().type(name);
  }

  @logFunction()
  typeToken(token: string = this.token) {
    this.tokenField.clear().type(token);
  }

  @logFunction()
  typeDomain(domain: string = this.domain) {
    this.domainField.clear().type(domain);
  }

  @logFunction()
  clickBtnAddActivityAnalyser() {
    this.btnAddActivityAnalyser.click();
  }

  @logFunction()
  clickBtnSave() {
    this.btnSave.click();
  }

  @logFunction()
  scrollIntoViewErrorRecoveryStrategy() {
    this.errorRecoveryStrategy.scrollIntoView();
  }

  @logFunction()
  clickBtnSortTimelineStepBuilderAtPos(pos: number) {
    cy.get('.mcs-timelineStepBuilder_sortBtn').eq(pos).click({ force: true });
  }
}

export default SiteInformation;
