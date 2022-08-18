import Page from '../Page';
import LeftMenu from '../LeftMenu';
import StartAutomationPopUp from './StartAutomationPopUp';
import { logFunction, logGetter } from '../log/LoggingDecorator';
import AddToSegmentPopUp from './AddToSegmentPopUp';

class BuilderPage extends Page {
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
    LeftMenu.clickAutomationsBuilder();
  }

  @logGetter()
  get automationTypeSelector() {
    return cy.get('.mcs-automationTemplateSelector');
  }

  @logGetter()
  get componentAddToSegment() {
    return cy.get('.mcs-availableNode-AddtoSegment');
  }

  @logGetter()
  get componentsArea() {
    return cy.get('.mcs-dropNodeWidget_area_node');
  }

  @logGetter()
  get actionBar() {
    return cy.get('.mcs-actionbar');
  }

  @logGetter()
  get componentDeleteFromSegment() {
    return cy.get('.mcs-availableNode-DeletefromSegment');
  }

  @logFunction()
  selectOnSegmentEntryType() {
    cy.get('.mcs-menu-list-onSegmentEntry').click();
  }

  @logFunction()
  selectReactToEventType() {
    cy.get('.mcs-menu-list-reactToEvent').click();
  }

  @logFunction()
  clickBtnSaveAutomation() {
    cy.get('.mcs-actionbar').find('.mcs-primary').click();
  }

  @logFunction()
  clickBtnSaveAutomationName() {
    cy.get('.mcs-form-modal-container').find('.mcs-primary').click();
  }

  @logFunction()
  typeAutomationName(automationName: string) {
    cy.get('.mcs-form-modal-container').find('.mcs-automationName').type(automationName);
  }

  @logFunction()
  clickAnalystHandcrafted() {
    cy.get('.mcs-user-list').click();
  }

  @logFunction()
  clickBtnViewNodeConfig() {
    cy.get('.mcs-automationNodeWidget_booleanMenu--view-node-config').click();
  }
}

export default BuilderPage;
