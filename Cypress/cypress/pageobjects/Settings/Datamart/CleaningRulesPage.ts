import Page from '../../Page';
import SettingsMenu from '../SettingsMenu';
import DatamartMenu from '../Datamart/DatamartMenu';
import HeaderMenu from '../../HeaderMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class CleaningRulesPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickCleaningRules();
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-form_saveButton_cleaningRuleForm');
  }

  @logFunction()
  clickBtnNewCleaningRules() {
    cy.get('.mcs-cleaningRules_creation_button').last().click();
  }

  @logFunction()
  clickEventBasedCleaningRules() {
    cy.get('.mcs-cleaningRuleEditPage_breadcrumbLink').click();
  }

  @logFunction()
  clickProfileBasedCleaningRules() {
    cy.get('.mcs-cleaningRulesDashboardPage_userProfileCleaningRuleTab').click();
  }
}

export default CleaningRulesPage;
