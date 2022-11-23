import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class ListPage extends Page {
  public name: string;

  constructor() {
    super();
    this.name = 'Automation name';
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAutomationsMenu();
    LeftMenu.clickAutomationsList();
    cy.wait(3000);
  }

  @logGetter()
  get nameBar() {
    // after the creation of an automation, the loading animation can stay at
    // least 30 seconds
    cy.wait(20000);
    cy.reload();
    return cy.get('.mcs-breadcrumb', { timeout: 60000 });
  }

  @logGetter()
  get table() {
    return cy.get('.ant-table-content');
  }

  @logGetter()
  get userCounter() {
    return cy.get('.mcs-automation-userCounter', { timeout: 60000 });
  }

  @logGetter()
  get pageContent() {
    return cy.get('.mcs-content-container');
  }

  @logFunction()
  clickAutomationsList() {
    LeftMenu.clickAutomationsList();
  }

  @logFunction()
  clickFirtAutomationName() {
    cy.get('.mcs-automation-link').first().click();
  }

  @logFunction()
  clickBtnTest() {
    cy.get('.mcs-gears', { timeout: 60000 }).should('be.visible').click();
  }

  @logFunction()
  edit(name: string = this.name) {
    this.clickDropdown(name);
    cy.get('.mcs-dropdown-actions').contains('Edit').click();
  }

  @logFunction()
  clickDropdown(name: string = this.name) {
    this.table.within($table => {
      this.getLineByName(name).get('.mcs-chevron').first().click();
    });
  }

  @logFunction()
  getLineByName(name: string) {
    return this.table.contains(name);
  }

  @logFunction()
  clickBtnEdit() {
    cy.get('.mcs-automationDashboardPage_editButton').click();
  }

  @logFunction()
  clickStartAutomation() {
    cy.get('.mcs-automationNodeWidget_StartAutomation').parent().click();
  }

  @logFunction()
  clickBtnEditStartAutomation() {
    cy.get('.mcs-automationNodeWidget_booleanMenu--edit').click();
  }

  @logFunction()
  clickBtnEditQuery() {
    cy.get('.mcs-automationNodeWidget_booleanMenu_item_queryEdit').click();
  }

  @logFunction()
  nameBarShouldBeVisible() {
    this.nameBar.should('be.visible');
  }

  @logFunction()
  nameBarshouldContain(str: string) {
    this.nameBar.should('contain', str);
  }
}

export default ListPage;
