import HeaderMenu from '../../HeaderMenu';
import Page from './../../Page';
import OrganisationMenu from './OrganisationMenu';

class ProcessingActivitiesPage extends Page {
  goToProcessingActivitiesPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickProcessingActivities();
  }

  get processingActivitiesPage() {
    return cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.processings');
  }

  get btnNewDataProcessing() {
    return cy.get('.mcs-card-button');
  }

  get consent() {
    return cy.get('.mcs-menu-list').eq(0);
  }

  get contractualPerformance() {
    return cy.get('.mcs-menu-list').eq(1);
  }

  get legalObligation() {
    return cy.get('.mcs-menu-list').eq(2);
  }

  get publicInterestOrExerciseOfOfficialAuthority() {
    return cy.get('.mcs-menu-list').eq(3);
  }

  get legitimateInterest() {
    return cy.get('mcs-menu-list').eq(4);
  }

  get legalBasisField() {
    return cy.get('#legal_basis');
  }

  get processingActivitiesNameField() {
    return cy.get('.mcs-processingActivities_nameField');
  }

  get processingActivitiesPurposeField() {
    return cy.get('.mcs-processingActivities_purposeField');
  }

  get btnAdvancedInformation() {
    return cy.get('.mcs-settings');
  }

  get processingActivitiesTechnicalNameField() {
    return cy.get('.mcs-processingActivities_technicalNameField');
  }

  get processingActivitiesTokenField() {
    return cy.get('#token');
  }

  get btnSaveProcessing() {
    return cy.get('.mcs-form_saveButton_processingForm');
  }

  get btnSettingsProcessing() {
    return cy.get('.ant-dropdown-trigger > .mcs-icon > .mcs-chevron');
  }

  get processingActivitiesTable() {
    return cy.get('.mcs-table-body');
  }

  get dropdownActions() {
    return cy.get('mcs-dropdown-actions');
  }

  get btnEdit() {
    return cy.contains('Edit');
  }

  get btnArchive() {
    return cy.contains('Archive');
  }

  get btnDelete() {
    return cy.contains('Delete');
  }

  clickBtnNewDataProcessing() {
    this.btnNewDataProcessing.click();
  }

  clickConsent() {
    this.consent.click();
  }

  clickLegalObligation() {
    this.legalObligation.click();
  }

  clickPublicInterestOrExerciseOfOfficialAuthority() {
    this.publicInterestOrExerciseOfOfficialAuthority.click();
  }

  clickLegitimateInterest() {
    this.legitimateInterest.click();
  }

  typeProcessingActivitiesName(name: string) {
    this.processingActivitiesNameField.clear().type(name);
  }

  typeProcessingActivitiesPurpose(purpose: string) {
    this.processingActivitiesPurposeField.clear().type(purpose);
  }

  typeProcessingActivitiesTechnicalName(technicalName: string) {
    this.processingActivitiesTechnicalNameField.clear().type(technicalName);
  }

  clickBtnSaveProcessing() {
    this.btnSaveProcessing.click();
  }

  clickBtnAdvancedInformation() {
    this.btnAdvancedInformation.click();
  }

  clickBtnSettingsProcessing() {
    this.btnSettingsProcessing.click();
  }

  clickBtnEdit() {
    this.btnEdit.click();
  }

  clickBtnArchive() {
    this.btnArchive.click();
  }

  clickBtnDelete() {
    this.btnDelete.click();
  }

  clickBtnConfirmDelete() {
    cy.contains('OK').click();
  }

  clickBtnCancelDelete() {
    cy.contains('Cancel').click();
  }
}

export default new ProcessingActivitiesPage();
