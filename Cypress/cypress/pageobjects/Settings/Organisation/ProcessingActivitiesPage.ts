import HeaderMenu from '../../HeaderMenu';
import Page from './../../Page';
import OrganisationMenu from './OrganisationMenu';

class ProcessingActivitiesPage extends Page {
  name: string;
  purpose: string;
  technicalName: string;

  constructor() {
    super();
    this.name = `name-${Math.random().toString(36).substring(2, 10)}`;
    this.purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    this.technicalName = `technicalName-${Math.random().toString(36).substring(2, 10)}`;
  }

  goToPage() {
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
    return cy.get('.mcs-menu-list').eq(4);
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

  get idColumn() {
    return cy.get('.ant-table-row > :nth-child(1)');
  }

  get namesColumn() {
    return cy.get('.ant-table-row > :nth-child(2)');
  }

  get purposeColumn() {
    return cy.get('.ant-table-row > :nth-child(3)');
  }

  get legalBasisColumn() {
    return cy.get('.ant-table-row > :nth-child(4)');
  }

  get technicalNamesColumn() {
    return cy.get('.ant-table-row > :nth-child(5)');
  }

  get tokensColumn() {
    return cy.get('.ant-table-row > :nth-child(6)');
  }

  get dropdownActions() {
    return cy.get('.mcs-dropdown-actions');
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

  get deletePopUp() {
    return cy.get('.ant-modal-content');
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

  typeProcessingActivitiesName(name: string = this.name) {
    this.name = name;
    this.processingActivitiesNameField.clear().type(name);
  }

  typeProcessingActivitiesPurpose(purpose: string = this.purpose) {
    this.purpose = purpose;
    this.processingActivitiesPurposeField.clear().type(purpose);
  }

  typeProcessingActivitiesTechnicalName(technicalName: string = this.technicalName) {
    this.technicalName = technicalName;
    this.processingActivitiesTechnicalNameField.clear().type(technicalName);
  }

  createNewDataProcessingWithoutTechnicalName(
    name: string = this.name,
    purpose: string = this.purpose,
  ) {
    this.name = name;
    this.purpose = purpose;
    this.typeProcessingActivitiesName(name);
    this.typeProcessingActivitiesPurpose(purpose);
    this.clickBtnSaveProcessing();
  }

  createNewDataProcessingWithTechnicalName(
    name: string = this.name,
    purpose: string = this.purpose,
    technicalName: string = this.technicalName,
  ) {
    this.name = name;
    this.purpose = purpose;
    this.technicalName = technicalName;
    this.typeProcessingActivitiesName(name);
    this.typeProcessingActivitiesPurpose(purpose);
    this.clickBtnAdvancedInformation();
    this.typeProcessingActivitiesTechnicalName(technicalName);
    this.clickBtnSaveProcessing();
  }

  createNewRandomDataProcessingWithoutTechnicalName() {
    this.createNewDataProcessingWithoutTechnicalName();
  }

  createNewRandomDataProcessingWithTechnicalName() {
    this.createNewDataProcessingWithTechnicalName();
  }
}

export default ProcessingActivitiesPage;
