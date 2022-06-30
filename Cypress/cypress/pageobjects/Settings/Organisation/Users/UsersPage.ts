import Page from '../../../Page';
import HeaderMenu from '../../../HeaderMenu';
import OrganisationMenu from '../OrganisationMenu';
import UserInformationPage from './UserInformationPage';
import ConfirmDeletePopUp from './ConfirmDeletePopUp';

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
}

export default UsersPage;
