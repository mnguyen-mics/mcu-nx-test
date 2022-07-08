import HeaderMenu from '../../HeaderMenu';
import Page from './../../Page';
import OrganisationMenu from './OrganisationMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

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

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickProcessingActivities();
  }

  @logGetter()
  get processingActivitiesPage() {
    return cy.get('.mcs-settingsSideMenu_menu\\.organisation\\.processings');
  }

  @logGetter()
  get btnNewDataProcessing() {
    return cy.get('.mcs-card-button');
  }

  @logGetter()
  get consent() {
    return cy.get('.mcs-menu-list').eq(0);
  }

  @logGetter()
  get contractualPerformance() {
    return cy.get('.mcs-menu-list').eq(1);
  }

  @logGetter()
  get legalObligation() {
    return cy.get('.mcs-menu-list').eq(2);
  }

  @logGetter()
  get publicInterestOrExerciseOfOfficialAuthority() {
    return cy.get('.mcs-menu-list').eq(3);
  }

  @logGetter()
  get legitimateInterest() {
    return cy.get('.mcs-menu-list').eq(4);
  }

  @logGetter()
  get legalBasisField() {
    return cy.get('#legal_basis');
  }

  @logGetter()
  get processingActivitiesNameField() {
    return cy.get('.mcs-processingActivities_nameField');
  }

  @logGetter()
  get processingActivitiesPurposeField() {
    return cy.get('.mcs-processingActivities_purposeField');
  }

  @logGetter()
  get btnAdvancedInformation() {
    return cy.get('.mcs-settings');
  }

  @logGetter()
  get processingActivitiesTechnicalNameField() {
    return cy.get('.mcs-processingActivities_technicalNameField');
  }

  @logGetter()
  get processingActivitiesTokenField() {
    return cy.get('#token');
  }

  @logGetter()
  get btnSaveProcessing() {
    return cy.get('.mcs-form_saveButton_processingForm');
  }

  @logGetter()
  get btnSettingsProcessing() {
    return cy.get('.ant-dropdown-trigger > .mcs-icon > .mcs-chevron');
  }

  @logGetter()
  get processingActivitiesTable() {
    return cy.get('.mcs-table-body');
  }

  @logGetter()
  get idColumn() {
    return cy.get('.ant-table-row > :nth-child(1)');
  }

  @logGetter()
  get namesColumn() {
    return cy.get('.ant-table-row > :nth-child(2)');
  }

  @logGetter()
  get purposeColumn() {
    return cy.get('.ant-table-row > :nth-child(3)');
  }

  @logGetter()
  get legalBasisColumn() {
    return cy.get('.ant-table-row > :nth-child(4)');
  }

  @logGetter()
  get technicalNamesColumn() {
    return cy.get('.ant-table-row > :nth-child(5)');
  }

  @logGetter()
  get tokensColumn() {
    return cy.get('.ant-table-row > :nth-child(6)');
  }

  @logGetter()
  get dropdownActions() {
    return cy.get('.mcs-dropdown-actions');
  }

  @logGetter()
  get btnEdit() {
    return cy.contains('Edit');
  }

  @logGetter()
  get btnArchive() {
    return cy.contains('Archive');
  }

  @logGetter()
  get btnDelete() {
    return cy.contains('Delete');
  }

  @logGetter()
  get deletePopUp() {
    return cy.get('.ant-modal-content');
  }

  @logFunction()
  clickBtnNewDataProcessing() {
    this.btnNewDataProcessing.click();
  }

  @logFunction()
  clickConsent() {
    this.consent.click();
  }

  @logFunction()
  clickLegalObligation() {
    this.legalObligation.click();
  }

  @logFunction()
  clickPublicInterestOrExerciseOfOfficialAuthority() {
    this.publicInterestOrExerciseOfOfficialAuthority.click();
  }

  @logFunction()
  clickLegitimateInterest() {
    this.legitimateInterest.click();
  }

  @logFunction()
  clickBtnSaveProcessing() {
    this.btnSaveProcessing.click();
  }

  @logFunction()
  clickBtnAdvancedInformation() {
    this.btnAdvancedInformation.click();
  }

  @logFunction()
  clickBtnSettingsProcessing() {
    this.btnSettingsProcessing.click();
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
  clickBtnDelete() {
    this.btnDelete.click();
  }

  @logFunction()
  clickBtnConfirmDelete() {
    cy.contains('OK').click();
  }

  @logFunction()
  clickBtnCancelDelete() {
    cy.contains('Cancel').click();
  }

  @logFunction()
  typeProcessingActivitiesName(name: string = this.name) {
    this.name = name;
    this.processingActivitiesNameField.clear().type(name);
  }

  @logFunction()
  typeProcessingActivitiesPurpose(purpose: string = this.purpose) {
    this.purpose = purpose;
    this.processingActivitiesPurposeField.clear().type(purpose);
  }

  @logFunction()
  typeProcessingActivitiesTechnicalName(technicalName: string = this.technicalName) {
    this.technicalName = technicalName;
    this.processingActivitiesTechnicalNameField.clear().type(technicalName);
  }

  @logFunction()
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

  @logFunction()
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

  @logFunction()
  createNewRandomDataProcessingWithoutTechnicalName() {
    this.createNewDataProcessingWithoutTechnicalName();
  }

  @logFunction()
  createNewRandomDataProcessingWithTechnicalName() {
    this.createNewDataProcessingWithTechnicalName();
  }
}

export default ProcessingActivitiesPage;
