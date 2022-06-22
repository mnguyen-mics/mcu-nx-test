import HeaderMenu from '../../../HeaderMenu';
import Page from '../../../Page';
import OrganisationMenu from '../OrganisationMenu';

class RolesPage extends Page {
  goToRolesPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickUsers();
    this.rolesPage.click();
  }

  get rolesPage() {
    cy.get('.ant-select-selection-item').click();
    return cy.get('.ant-select-dropdown-placement-bottomLeft').contains('Roles');
  }

  get btnAddRole() {
    return cy.get('.mcs-userSettings_addAUser');
  }

  get userDropDownMenu() {
    return cy.get('.mcs-userRoleList_dropDownMenu');
  }

  clickBtnAddRole() {
    return this.btnAddRole.click();
  }

  clickUserDropDownMenu() {
    return this.userDropDownMenu.click();
  }

  get bntEditRole() {
    return cy.get('.mcs-userRoleList_dropDownMenu--edit');
  }

  get btnDeleteRole() {
    return cy.get('.mcs-userRoleList_dropDownMenu--delete');
  }

  clickBtnEditRole() {
    this.bntEditRole.click();
  }

  clickBtnDeleteRole() {
    this.btnDeleteRole.click();
  }

  get firstNamesColumn() {
    return cy.get('.ant-table-row > :nth-child(2)');
  }

  get lastNamesColumn() {
    return cy.get('.ant-table-row > :nth-child(3)');
  }

  get emailsColumn() {
    return cy.get('.ant-table-row > :nth-child(4)');
  }

  get rolesColumn() {
    return cy.get('.ant-table-row > :nth-child(5)');
  }

  get homeIcon() {
    return cy.get('.mcs-userRoleList_homeUserCell');
  }

  get homeIconHeader() {
    return cy.get('.mcs-userRoleList_homeUserCell').eq(0);
  }

  get firstNameHeader() {
    return cy.get('.ant-table-row > :nth-child(2)').eq(0);
  }

  get lastNameHeader() {
    return cy.get('.ant-table-row > :nth-child(3)').eq(0);
  }

  get emailHeader() {
    return cy.get('.ant-table-row > :nth-child(4)').eq(0);
  }

  get cards() {
    return cy.get('.mcs-userRoleList_cardSubtitle');
  }

  get toggleCardIcon() {
    return cy.get(
      '#mcs-foldable-card-1 > .ant-collapse > .ant-collapse-item > .ant-collapse-header > .anticon > svg',
    );
  }

  get cardTitle() {
    return cy.get(
      '#mcs-foldable-card-1 > .ant-collapse > .ant-collapse-item > .ant-collapse-header > :nth-child(2)',
    );
  }

  clickCardToggle(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`).click();
  }

  homeIconColumnInCard(id: string) {
    return this.clickCardToggle(id).find('.ant-table-row > :nth-child(1)');
  }

  firstNamesColumnInCard(id: string) {
    return this.clickCardToggle(id).find('.ant-table-row > :nth-child(2)');
  }

  lastNamesColumnInCard(id: string) {
    return this.clickCardToggle(id).find('.ant-table-row > :nth-child(3)');
  }

  emailsColumnInCard(id: string) {
    return this.clickCardToggle(id).find('.ant-table-row > :nth-child(4)');
  }

  rolesColumnInCard(id: string) {
    return this.clickCardToggle(id).find('.ant-table-row > :nth-child(5)');
  }

  get filterField() {
    return cy.get('.mcs-userSettings_userFilter');
  }

  typeFilter(filter: string) {
    this.filterField.type(filter);
  }

  get displayInheritedRoleToggle() {
    return cy.get('.mcs-userSettings_switch');
  }

  clickDisplayInheritedRoleToggle() {
    this.displayInheritedRoleToggle.click();
  }

  get confirmDeletePopUp() {
    return cy.get('.ant-modal-body');
  }

  clickCancelOnComfirmDeletePopUp() {
    cy.contains('Cancel').click();
  }

  clickOKOnComfirmDeletePopUp() {
    cy.contains('OK').click();
  }

  get userSearchField() {
    return cy.get('#rc_select_2');
  }

  typeUserSearch(user: string) {
    this.userSearchField.type(user);
  }

  get organisationDropDown() {
    return cy.get('#rc_select_3');
  }

  clickOrganisationDropDown() {
    this.organisationDropDown.click();
  }

  get organisationsAvailableMenu() {
    return cy.get('#rc_select_3');
  }

  typeOrganisationWithName(organisation: string) {
    this.organisationsAvailableMenu.type(organisation);
  }

  get readerRoleRadioBtn() {
    return cy.get(':nth-child(1) > .ant-radio-wrapper > .ant-radio');
  }

  get editorRoleRadioBtn() {
    return cy.get(':nth-child(2) > .ant-radio-wrapper > .ant-radio');
  }

  get organisationAdminRoleRadioBtn() {
    return cy.get(':nth-child(3) > .ant-radio-wrapper > .ant-radio');
  }

  get communityAdminRoleRadioBtn() {
    return cy.get(':nth-child(4) > .ant-radio-wrapper > .ant-radio');
  }

  clickBtnEditorRole() {
    this.editorRoleRadioBtn.click();
  }

  clickBtnReaderRole() {
    this.readerRoleRadioBtn.click();
  }

  clickBtnOrganisationAdminRole() {
    this.organisationAdminRoleRadioBtn.click();
  }

  clickCommunityAdminRoleBtn() {
    this.communityAdminRoleRadioBtn.click();
  }

  get btnSave() {
    return cy.get('.ant-form > .ant-btn-primary').contains('Save');
  }

  clickBtnSave() {
    this.btnSave.click();
  }

  get closeEditBtn() {
    return cy.get('.anticon-close');
  }

  clickCloseEditBtn() {
    this.closeEditBtn.click();
  }
}

export default new RolesPage();
