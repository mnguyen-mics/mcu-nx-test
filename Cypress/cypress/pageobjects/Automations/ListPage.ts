import Page from '../Page';
import LeftMenu from '../LeftMenu';
import StartAutomationPopUp from './StartAutomationPopUp';
import { logFunction, logGetter } from '../log/LoggingDecorator';
import AddToSegmentPopUp from './AddToSegmentPopUp';
class ListPage extends Page {
  startAutomationPopUp: StartAutomationPopUp;
  addToSegmentPopUp: AddToSegmentPopUp;

  constructor() {
    super();
    this.startAutomationPopUp = new StartAutomationPopUp();
    this.addToSegmentPopUp = new AddToSegmentPopUp();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAutomationsMenu();
    LeftMenu.clickAutomationsList();
  }

  @logGetter()
  get nameBar() {
    return cy.get('.mcs-breadcrumb');
  }

  @logGetter()
  get userCounter() {
    return cy.get('.mcs-automation-userCounter');
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
    cy.get('.mcs-gears').should('be.visible').click();
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
}

export default ListPage;
