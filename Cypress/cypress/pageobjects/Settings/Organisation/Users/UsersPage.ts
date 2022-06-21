import Page from '../../../Page';
import HeaderMenu from '../../../HeaderMenu';
import OrganisationMenu from '../OrganisationMenu';

class UsersPage extends Page {
  firstName: string;
  lastName: string;
  email: string;

  constructor() {
    super();
    this.firstName = `fn-${Math.random().toString(36).substring(2, 10)}`;
    this.lastName = `ln-${Math.random().toString(36).substring(2, 10)}`;
    this.email = `email.-${Math.random().toString(36).substring(2, 10)}@test.com`;
  }

  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickUsers();
  }

  get btnAddUser() {
    return cy.get('.mcs-userSettings_addAUser');
  }

  get userSelect() {
    return cy.get('.mcs-userSettings_userSelect').first();
  }

  get userFilter() {
    return cy.get('.mcs-userSettings_userFilter').find('.ant-input');
  }

  get firstNameField() {
    return cy.get('.mcs-userForm_input').eq(0);
  }

  get lastNameField() {
    return cy.get('.mcs-userForm_input').eq(1);
  }

  get emailField() {
    return cy.get('.mcs-userForm_input').eq(2);
  }

  get organisationField() {
    return cy.get('.mcs-userForm_select').find('input');
  }

  get btnOrganisationFieldSearch() {
    return cy.get('.ant-input-search-button');
  }

  get btnSaveUser() {
    return cy.get('.mcs-saveButton');
  }

  get organisationSelectionDropDown() {
    return cy.get('.ant-select-item-option');
  }

  get idsColumns() {
    return cy.get('.ant-table-row > :nth-child(1)');
  }

  get firstNamesColumns() {
    return cy.get('.ant-table-row > :nth-child(2)');
  }

  get lastNamesColumns() {
    return cy.get('.ant-table-row > :nth-child(3)');
  }

  get emailsColumns() {
    return cy.get('.ant-table-row > :nth-child(4)');
  }

  get firstNamesHeaders() {
    return cy.get('.ant-table-column-sorters').eq(1);
  }

  get lastNamesHeaders() {
    return cy.get('.ant-table-column-sorters').eq(2);
  }

  get emailsHeaders() {
    return cy.get('.ant-table-column-sorters').eq(3);
  }

  get sortIndicatorUp() {
    return cy.get('.ant-table-column-sorter-up');
  }

  get sortIndicatorDown() {
    return cy.get('.ant-table-column-sorter-down');
  }

  get btnEditUser() {
    return cy.get('.mcs-userRoleList_dropDownMenu--edit');
  }

  get btnDeleteUser() {
    return cy.get('.mcs-userRoleList_dropDownMenu--delete');
  }

  get errorPopUp() {
    return cy.get('.ant-notification-notice-error');
  }

  get confirmDeletePopUp() {
    return cy.get('.ant-modal-confirm-body-wrapper');
  }

  get btnOKConfirmDeletePopUp() {
    return this.confirmDeletePopUp.contains('OK');
  }

  get btnCancelConfirmPopUp() {
    return this.confirmDeletePopUp.contains('Cancel');
  }

  clickBtnAddUser() {
    this.btnAddUser.click();
  }

  typeUserFilter(filter: string) {
    this.userFilter.type(filter);
  }

  cardWithId(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`);
  }

  clickCardToggle(id: string) {
    this.cardWithId(id).find('.ant-collapse-arrow').click();
  }

  cardNbUsers(id: string) {
    return this.cardWithId(id).find('.mcs-userRoleList_cardSubtitle');
  }

  typeFirstName(firstName: string = this.firstName) {
    this.firstNameField.clear().type(firstName);
  }

  typeLastName(lastName: string = this.lastName) {
    this.lastNameField.clear().type(lastName);
  }

  typeEmail(email: string = this.email) {
    this.emailField.clear().type(email);
  }

  clickOrganisationField() {
    this.organisationField.click();
  }

  typeOrganisation(organisation: string) {
    this.organisationField.clear().type(organisation);
  }

  clickBtnOrganisationFieldSearch() {
    this.btnOrganisationFieldSearch.click();
  }

  clickBtnSaveUser() {
    this.btnSaveUser.click();
  }

  idsColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(1)');
  }

  firstNamesColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(2)');
  }

  lastNamesColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(3)');
  }

  emailsColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(4)');
  }

  idsHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(0);
  }

  clickIdsHeaderInCard(id: string) {
    this.idsHeaderInCard(id).click();
  }

  firstNamesHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(1);
  }

  clickFirstNamesHeaderInCard(id: string) {
    this.firstNamesHeaderInCard(id).click();
  }

  lastNamesHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(2);
  }

  clickLastNamesHeaderInCard(id: string) {
    this.lastNamesHeaderInCard(id).click();
  }

  emailsHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(3);
  }

  clickEmailsHeaderInCard(id: string) {
    this.emailsHeaderInCard(id).click();
  }

  userDropDownMenuCard(id: string) {
    return this.cardWithId(id).find('.mcs-userRoleList_dropDownMenu');
  }

  clickFirstUserDropDownMenuCard(id: string) {
    this.userDropDownMenuCard(id).first().click();
  }

  clickBtnEditUser() {
    this.btnEditUser.click();
  }

  clickBtnDeleteUser() {
    this.btnDeleteUser.click();
  }

  clickBtnOKConfirmDeletePopUp() {
    this.btnOKConfirmDeletePopUp.click();
  }

  clickBtnCancelConfirmPopUp() {
    this.btnCancelConfirmPopUp.click();
  }

  addUser(
    org: string,
    email: string = this.email,
    firstName: string = this.firstName,
    lastName: string = this.lastName,
  ) {
    this.clickBtnAddUser();
    this.typeFirstName(firstName);
    this.typeLastName(lastName);
    this.typeEmail(email);
    this.typeOrganisation(org);
    this.organisationSelectionDropDown.contains(new RegExp('^' + org + '$', 'g')).click();
    this.clickBtnSaveUser();
  }
}

export default UsersPage;
