import DatamartMenu from './DatamartMenu';
import DatamartsPage from './DatamartsPage';
import Page from '../../Page';
import faker from 'faker';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class CompartmentsPage extends Page {
  public name: string;
  public token: string;
  public debug: boolean;

  constructor() {
    super();
    this.name = faker.random.words(6);
    this.token = faker.random.words(2).replace(' ', '-');
    this.debug = false;
  }

  @logGetter()
  get table() {
    return cy.get('.mcs-table-view');
  }

  @logGetter()
  get idColumn() {
    return cy.get('.mcs-compartmentsTable_compartmentId');
  }

  @logGetter()
  get nameColumn() {
    return cy.get('.mcs-compartmentsTable_compartmentName');
  }

  @logGetter()
  get tokenColumn() {
    return cy.get('.mcs-compartmentsTable_compartmentToken');
  }

  @logGetter()
  get newButton() {
    return cy.get('.mcs-compartmentsListPage_newCompartmentButton');
  }

  @logGetter()
  get saveButton() {
    return cy.get('.mcs-form_saveButton_compartmentForm');
  }
  @logGetter()
  get btnSave() {
    return this.saveButton;
  }

  @logFunction()
  chooseDatamart(datamartName: string) {
    cy.contains(datamartName).click();
  }

  @logFunction()
  clickAdvanced() {
    cy.get('.mcs-form-container').find('.mcs-button').click();
  }

  @logFunction()
  clickDefaultSwitch() {
    cy.get('.mcs-compartments_switchField').click();
  }

  @logFunction()
  clickClose() {
    cy.get('.mcs-close').click();
  }

  @logFunction()
  clickNew() {
    this.newButton.click();
  }
  @logFunction()
  clickBtnNewCompartments() {
    this.clickNew();
  }

  @logFunction()
  clickSave() {
    this.saveButton.click();
    cy.wait(3000);
  }

  @logFunction()
  clickDropdown(name: string = this.name) {
    this.table.within($table => {
      this.getLineByName(name).get('.mcs-chevron').first().click();
    });
  }

  @logFunction()
  edit(name: string = this.name) {
    this.clickDropdown(name);
    cy.get('.mcs-dropdown-actions').contains('Edit').click();
  }

  @logFunction()
  columnShouldExist(columnName: string) {
    this.table.should('contain', columnName);
  }

  @logFunction()
  idShouldContain(value: string) {
    this.idColumn.first().should('contain', value);
  }

  @logFunction()
  nameShouldContain(value: string) {
    this.nameColumn.first().should('contain', value);
  }

  @logFunction()
  nameShouldBeCorrect() {
    this.nameShouldContain(this.name);
  }

  @logFunction()
  tokenShouldContain(value: string) {
    this.tokenColumn.first().should('contain', value);
  }

  @logFunction()
  tokenShouldBeCorrect() {
    this.tokenShouldContain(this.token);
  }

  @logFunction()
  tableShouldContain(value: string) {
    this.table.should('contain', value);
  }

  @logFunction()
  defaultCompartmentShouldExist() {
    this.tableShouldContain('Default');
  }

  @logFunction()
  goToPage() {
    const datamartsPage = new DatamartsPage();
    datamartsPage.goToPage();
    DatamartMenu.clickCompartments();
  }

  @logFunction()
  setName(name: string = this.name) {
    this.name = name;
    cy.get('.mcs-compartments_nameField').clear().type(name);
  }

  @logFunction()
  setToken(token: string = this.token) {
    this.token = token;
    cy.get('.mcs-compartments_tokenField').type(token);
  }

  @logFunction()
  getLineByName(name: string) {
    return this.nameColumn.contains(name);
  }
}

export default CompartmentsPage;
