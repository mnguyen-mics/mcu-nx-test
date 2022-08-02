import Page from '../../../Page';
import HeaderMenu from '../../../HeaderMenu';
import OrganisationMenu from '../OrganisationMenu';
import UserInformationPage from './UserInformationPage';
import ConfirmDeletePopUp from './ConfirmDeletePopUp';
import RolesPage from './RolesPage';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class UsersPage extends Page {
  firstName: string;
  lastName: string;
  email: string;
  userInformationPage: UserInformationPage;
  confirmDeletePopUp: ConfirmDeletePopUp;

  constructor() {
    super();
    this.firstName = `fn-${Math.random().toString(36).substring(2, 10)}`;
    this.lastName = `ln-${Math.random().toString(36).substring(2, 10)}`;
    this.email = `email.-${Math.random().toString(36).substring(2, 10)}@test.com`;
    this.userInformationPage = new UserInformationPage(this.firstName, this.lastName, this.email);
    this.confirmDeletePopUp = new ConfirmDeletePopUp();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickUsers();
  }

  @logGetter()
  get btnAddUser() {
    return cy.get('.mcs-userSettings_addAUser');
  }

  @logGetter()
  get userSelect() {
    return cy.get('.mcs-userSettings_userSelect').first();
  }

  @logGetter()
  get userFilter() {
    return cy.get('.mcs-userSettings_userFilter').find('.ant-input');
  }

  @logGetter()
  get idsColumns() {
    return cy.get('.ant-table-row > :nth-child(1)');
  }

  @logGetter()
  get firstNamesColumns() {
    return cy.get('.ant-table-row > :nth-child(2)');
  }

  @logGetter()
  get lastNamesColumns() {
    return cy.get('.ant-table-row > :nth-child(3)');
  }

  @logGetter()
  get emailsColumns() {
    return cy.get('.ant-table-row > :nth-child(4)');
  }

  @logGetter()
  get firstNamesHeaders() {
    return cy.get('.ant-table-column-sorters').eq(1);
  }

  @logGetter()
  get lastNamesHeaders() {
    return cy.get('.ant-table-column-sorters').eq(2);
  }

  @logGetter()
  get emailsHeaders() {
    return cy.get('.ant-table-column-sorters').eq(3);
  }

  @logGetter()
  get sortIndicatorUp() {
    return cy.get('.ant-table-column-sorter-up');
  }

  @logGetter()
  get sortIndicatorDown() {
    return cy.get('.ant-table-column-sorter-down');
  }

  @logGetter()
  get btnEditUser() {
    return cy.get('.mcs-userRoleList_dropDownMenu--edit');
  }

  @logGetter()
  get btnDeleteUser() {
    return cy.get('.mcs-userRoleList_dropDownMenu--delete');
  }

  @logGetter()
  get errorPopUp() {
    return cy.get('.ant-notification-notice-error');
  }

  @logFunction()
  clickBtnAddUser() {
    this.btnAddUser.click();
  }

  @logFunction()
  typeUserFilter(filter: string) {
    this.userFilter.type(filter);
  }

  @logFunction()
  cardWithId(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`);
  }

  @logFunction()
  clickCardToggle(id: string) {
    this.cardWithId(id).find('.ant-collapse-arrow').click();
  }

  @logFunction()
  cardNbUsers(id: string) {
    return this.cardWithId(id).find('.mcs-userRoleList_cardSubtitle');
  }

  @logFunction()
  idsColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(1)');
  }

  @logFunction()
  firstNamesColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(2)');
  }

  @logFunction()
  lastNamesColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(3)');
  }

  @logFunction()
  emailsColumnInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-row > :nth-child(4)');
  }

  @logFunction()
  idsHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(0);
  }

  @logFunction()
  clickIdsHeaderInCard(id: string) {
    this.idsHeaderInCard(id).click();
  }

  @logFunction()
  firstNamesHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(1);
  }

  @logFunction()
  clickFirstNamesHeaderInCard(id: string) {
    this.firstNamesHeaderInCard(id).click();
  }

  @logFunction()
  lastNamesHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(2);
  }

  @logFunction()
  clickLastNamesHeaderInCard(id: string) {
    this.lastNamesHeaderInCard(id).click();
  }

  @logFunction()
  emailsHeaderInCard(id: string) {
    return this.cardWithId(id).find('.ant-table-column-sorters').eq(3);
  }

  @logFunction()
  clickEmailsHeaderInCard(id: string) {
    this.emailsHeaderInCard(id).click();
  }

  @logFunction()
  userDropDownMenuCard(id: string) {
    return this.cardWithId(id).find('.mcs-userRoleList_dropDownMenu');
  }

  @logFunction()
  clickFirstUserDropDownMenuCard(id: string) {
    this.userDropDownMenuCard(id).first().click();
  }

  @logFunction()
  clickBtnEditUser() {
    this.btnEditUser.click();
  }

  @logFunction()
  clickBtnDeleteUser() {
    this.btnDeleteUser.click();
  }

  @logFunction()
  addUser(
    org: string,
    email: string = this.email,
    firstName: string = this.firstName,
    lastName: string = this.lastName,
  ) {
    this.clickBtnAddUser();
    this.userInformationPage.typeFirstName(firstName);
    this.userInformationPage.typeLastName(lastName);
    this.userInformationPage.typeEmail(email);
    this.userInformationPage.typeOrganisation(org);
    this.userInformationPage.organisationSelectionDropDown
      .contains(new RegExp('^' + org + '$', 'g'))
      .click();
    this.userInformationPage.clickBtnSaveUser();
  }

  @logFunction()
  addUserAndItsRole(
    org: string,
    role: string = 'reader',
    email: string = this.email,
    firstName: string = this.firstName,
    lastName: string = this.lastName,
  ) {
    const rolesPage = new RolesPage();
    this.addUser(org, email, firstName, lastName);
    cy.wait(500);
    rolesPage.roleInformationPage.clickOnRole(role);
    rolesPage.roleInformationPage.clickBtnSave();
    cy.wait(5000);
    rolesPage.usersPage.click();
  }
}

export default UsersPage;
