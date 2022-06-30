import HeaderMenu from '../../../HeaderMenu';
import Page from '../../../Page';
import OrganisationMenu from '../OrganisationMenu';
import RoleInformationPage from './RoleInformationPage';
import ConfirmDeletePopUp from './ConfirmDeletePopUp';

class RolesPage extends Page {
  roleInformationPage: RoleInformationPage;
  confirmDeletePopUp: ConfirmDeletePopUp;

  constructor() {
    super();
    this.roleInformationPage = new RoleInformationPage();
    this.confirmDeletePopUp = new ConfirmDeletePopUp();
  }

  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickUsers();
    this.rolesPage.click();
  }

  get rolesPage() {
    cy.get('.ant-select-selection-item').click();
    return cy.get('.ant-select-dropdown-placement-bottomLeft').contains('Roles');
  }

  get usersPage() {
    cy.get('.ant-select-selection-item').click();
    return cy.get('.ant-select-dropdown-placement-bottomLeft').contains('Users');
  }

  get btnAddRole() {
    return cy.get('.mcs-userSettings_addAUser');
  }

  get userDropDownMenu() {
    return cy.get('.mcs-userRoleList_dropDownMenu');
  }

  get bntEditRole() {
    return cy.get('.mcs-userRoleList_dropDownMenu--edit');
  }

  get btnDeleteRole() {
    return cy.get('.mcs-userRoleList_dropDownMenu--delete');
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

  get filterField() {
    return cy.get('.mcs-userSettings_userFilter');
  }

  get displayInheritedRoleToggle() {
    return cy.get('.mcs-userSettings_switch');
  }

  get errorPopUp() {
    return cy.get('.ant-notification-notice-error');
  }

  get firstElement() {
    return cy.get('.rc-virtual-list-holder-inner');
  }

  get pageEdit() {
    return cy.get('.ant-drawer-body');
  }

  clickBtnAddRole() {
    return this.btnAddRole.click();
  }

  clickUserDropDownMenu() {
    return this.userDropDownMenu.click();
  }

  clickBtnEditRole() {
    this.bntEditRole.click();
  }

  clickBtnDeleteRole() {
    this.btnDeleteRole.click();
  }

  cardToggle(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`);
  }

  cardWithId(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`);
  }

  clickCardToggle(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`).click();
  }

  homeIconColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(1)');
  }

  firstNamesColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(2)');
  }

  lastNamesColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(3)');
  }

  emailsColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(4)');
  }

  rolesColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(5)');
  }

  typeFilter(filter: string) {
    this.filterField.type(filter);
  }

  clickDisplayInheritedRoleToggle() {
    this.displayInheritedRoleToggle.click();
  }
}

export default RolesPage;
