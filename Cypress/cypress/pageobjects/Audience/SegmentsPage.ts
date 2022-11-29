import Page from '../Page';
import LeftMenu from '../LeftMenu';
import { logFunction, logGetter } from '../log/LoggingDecorator';

class SegmentsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    LeftMenu.clickAudienceMenu();
    LeftMenu.clickAudienceSegments();
  }

  @logGetter()
  get segmentTypeSelector() {
    return cy.get('.mcs-segmentTypeSelector');
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-saveQueryAsActionBar_button');
  }

  @logGetter()
  get segmentNameInTable() {
    return cy.get('.mcs-campaigns-link');
  }

  @logGetter()
  get searchBar() {
    return cy.get('.mcs-audienceSegmentsTable_search_bar');
  }

  @logGetter()
  get filterField() {
    return cy.get('.mcs-audienceSegmentTable-typeFilter');
  }

  @logGetter()
  get segmentsTable() {
    return cy.get('.mcs-audienceSegmentTable');
  }

  @logGetter()
  get dropDownMenu() {
    return cy.get('.mcs-audienceSegmentTable_dropDownMenu');
  }

  @logGetter()
  get deletePopUp() {
    return cy.get('.mcs-audienceSegmentDeletePopup');
  }

  @logFunction()
  clickBtnNewSegment() {
    cy.get('.mcs-segmentsActionBar_createNewSemgmentButton').click();
  }

  @logFunction()
  clickUserList() {
    cy.get('.mcs-user-list').click();
  }

  @logFunction()
  clickUserExpertQuery() {
    cy.get('.mcs-segmentTypeSelector_UserExpertQuery').click();
  }

  @logFunction()
  clickUserPixel() {
    cy.get('.mcs-segmentTypeSelector_UserPixel').click();
  }

  @logFunction()
  clickBtnSaveNewSegment() {
    cy.get('.mcs-form_saveButton_audienceSegmentForm').click();
  }

  @logFunction()
  clickUserQueryFilter() {
    cy.get('.mcs-audienceSegmentTable-typeFilter').click();
    cy.get('.mcs-audienceSegmentTable-typeFilter_userQuery').click();
  }

  @logFunction()
  clickUserListFilter() {
    cy.get('.mcs-audienceSegmentTable-typeFilter').click();
    cy.get('.mcs-audienceSegmentTable-typeFilter_userList').click();
  }

  @logFunction()
  pickCreatedSegment(segmentName: string) {
    this.searchBar.type(segmentName + '{enter}');
  }

  @logFunction()
  clickBtnEdit() {
    cy.get('.mcs-actionbar').find('.mcs-pen').click();
  }

  @logFunction()
  clickBtnIsPersisted() {
    cy.get('.mcs-audienceSegmentsTable_is_persisted').click();
  }

  @logFunction()
  clickBtnDelete() {
    cy.get('.mcs-audienceSegmentTable_dropDownMenu--delete').click();
  }

  @logFunction()
  clickBtnOkDeletePopUp() {
    cy.get('.mcs-audienceSegmentDeletePopup_ok_button').click();
  }

  @logFunction()
  typeSegmentName(segmentName: string) {
    cy.get('[id="audienceSegment.name"]').type(segmentName);
  }

  @logFunction()
  typeSegmentDescription(segmentDescription: string) {
    cy.get('[id="audienceSegment.short_description"]').type(segmentDescription);
  }

  @logFunction()
  clickBtnAdvanced() {
    cy.get('[class="mcs-button optional-section-title"]').click();
  }

  @logFunction()
  typeSegmentTechName(segmentTechName: string) {
    cy.get('[id="audienceSegment.technical_name"]').type(segmentTechName);
  }

  @logFunction()
  typeDefaultLifetime(defaultLifetime: string) {
    cy.get('[id="defaultLifetime"]').type(defaultLifetime);
  }

  @logFunction()
  selectDayslifeTime() {
    cy.get('[class ="mcs-addonSelect"]').click();
    cy.contains('Days').click();
  }
}

export default SegmentsPage;
