import Page from '../../../Page';
import HeaderMenu from '../../../HeaderMenu';
import ActivityAnalyserTypePage from './ActivityAnalyserTypePage';
import ActivityAnalyserPropertiesPage from './ActivityAnalyserPropertiesPage';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';
import faker from 'faker';
import ConfirmArchivePopUp from './ConfirmArchivePopUp';
import DatamartMenu from '../DatamartMenu';
import SettingsMenu from '../../SettingsMenu';

class ActivityAnalyserPage extends Page {
  visitAnalyserName: string;
  activityAnalyserTypePage: ActivityAnalyserTypePage;
  activityAnalyserPropertiesPage: ActivityAnalyserPropertiesPage;
  confirmArchivePopUp: ConfirmArchivePopUp;

  constructor() {
    super();
    this.visitAnalyserName = faker.random.words(2);
    this.activityAnalyserTypePage = new ActivityAnalyserTypePage();
    this.activityAnalyserPropertiesPage = new ActivityAnalyserPropertiesPage(
      this.visitAnalyserName,
    );
    this.confirmArchivePopUp = new ConfirmArchivePopUp();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickActivityAnalyser();
  }

  @logGetter()
  get btnNewActivityAnalyser() {
    return cy.get('.mcs-VisitAnalyzersList_creation_button');
  }

  @logGetter()
  get activityAnalysersTableRows() {
    return cy.get('.ant-table-row');
  }

  @logGetter()
  get arrowDropDownMenu() {
    return cy.get('.ant-dropdown-trigger > .mcs-icon > .mcs-chevron');
  }

  @logGetter()
  get btnEdit() {
    return cy.get('.ant-dropdown-menu-item').contains('Edit');
  }

  @logGetter()
  get btnArchive() {
    return cy.get('.ant-dropdown-menu-item').contains('Archive');
  }

  @logFunction()
  clickBtnNewActivityAnalyser() {
    this.btnNewActivityAnalyser.click();
  }

  @logFunction()
  clickOnName(name: string) {
    cy.get('.mcs-campaigns-link').contains(name).click();
  }

  @logFunction()
  clickDropDownArrowActivityAnalyser(name: string = this.visitAnalyserName) {
    return this.activityAnalysersTableRows
      .contains(name)
      .parent()
      .parent()
      .find('.mcs-chevron')
      .click();
  }

  @logFunction()
  clickBtnEdit() {
    this.btnEdit.click();
  }

  @logFunction()
  clickBtnArchive() {
    this.btnArchive.click();
  }

  @logFunction()
  createActivityAnalyser(
    name: string = this.visitAnalyserName,
    errorRecoveryStrategy: string = 'drop',
  ) {
    this.clickBtnNewActivityAnalyser();
    this.activityAnalyserTypePage.clickDefaultActivityAnalyser();
    this.activityAnalyserPropertiesPage.typeName(name);
    this.activityAnalyserPropertiesPage.clickErrorRecoveryStrategySelect();
    switch (errorRecoveryStrategy) {
      case 'drop':
        this.activityAnalyserPropertiesPage.clickErrorRecoveryStrategy_Drop();
        break;
      case 'storeWithErrorId':
        this.activityAnalyserPropertiesPage.clickErrorRecoveryStrategy_StoreWithErrorId();
        break;
      case 'storeWithErrorIdAndSkipUpcomingAnalysers':
        this.activityAnalyserPropertiesPage.clickErrorRecoveryStrategy_StoreWithErrorIdAndSkipUpcomingAnalysers();
        break;

      default:
        break;
    }
    this.activityAnalyserPropertiesPage.clickBtnSave();
  }
}

export default ActivityAnalyserPage;
