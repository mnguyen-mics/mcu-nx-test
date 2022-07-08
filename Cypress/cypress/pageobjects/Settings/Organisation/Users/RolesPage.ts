import HeaderMenu from '../../../HeaderMenu';
import Page from '../../../Page';
import OrganisationMenu from '../OrganisationMenu';
import RoleInformationPage from './RoleInformationPage';
import ConfirmDeletePopUp from './ConfirmDeletePopUp';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class RolesPage extends Page {
  roleInformationPage: RoleInformationPage;
  confirmDeletePopUp: ConfirmDeletePopUp;

  constructor() {
    super();
    this.roleInformationPage = new RoleInformationPage();
    this.confirmDeletePopUp = new ConfirmDeletePopUp();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickUsers();
    this.rolesPage.click();
  }

  @logGetter()
  get rolesPage() {
    cy.get('.ant-select-selection-item').click();
    return cy.get('.ant-select-dropdown-placement-bottomLeft').contains('Roles');
  }

  @logGetter()
  get usersPage() {
    cy.get('.ant-select-selection-item').click();
    return cy.get('.ant-select-dropdown-placement-bottomLeft').contains('Users');
  }

  @logGetter()
  get btnAddRole() {
    return cy.get('.mcs-userSettings_addAUser');
  }

  @logGetter()
  get userDropDownMenu() {
    return cy.get('.mcs-userRoleList_dropDownMenu');
  }

  @logGetter()
  get bntEditRole() {
    return cy.get('.mcs-userRoleList_dropDownMenu--edit');
  }

  @logGetter()
  get btnDeleteRole() {
    return cy.get('.mcs-userRoleList_dropDownMenu--delete');
  }

  @logGetter()
  get firstNamesColumn() {
    return cy.get('.ant-table-row > :nth-child(2)');
  }

  @logGetter()
  get lastNamesColumn() {
    return cy.get('.ant-table-row > :nth-child(3)');
  }

  @logGetter()
  get emailsColumn() {
    return cy.get('.ant-table-row > :nth-child(4)');
  }

  @logGetter()
  get rolesColumn() {
    return cy.get('.ant-table-row > :nth-child(5)');
  }

  @logGetter()
  get homeIcon() {
    return cy.get('.mcs-userRoleList_homeUserCell');
  }

  @logGetter()
  get homeIconHeader() {
    return cy.get('.mcs-userRoleList_homeUserCell').eq(0);
  }

  @logGetter()
  get firstNameHeader() {
    return cy.get('.ant-table-row > :nth-child(2)').eq(0);
  }

  @logGetter()
  get lastNameHeader() {
    return cy.get('.ant-table-row > :nth-child(3)').eq(0);
  }

  @logGetter()
  get emailHeader() {
    return cy.get('.ant-table-row > :nth-child(4)').eq(0);
  }

  @logGetter()
  get cards() {
    return cy.get('.mcs-userRoleList_cardSubtitle');
  }

  @logGetter()
  get toggleCardIcon() {
    return cy.get(
      '#mcs-foldable-card-1 > .ant-collapse > .ant-collapse-item > .ant-collapse-header > .anticon > svg',
    );
  }

  @logGetter()
  get cardTitle() {
    return cy.get(
      '#mcs-foldable-card-1 > .ant-collapse > .ant-collapse-item > .ant-collapse-header > :nth-child(2)',
    );
  }

  @logGetter()
  get filterField() {
    return cy.get('.mcs-userSettings_userFilter');
  }

  @logGetter()
  get displayInheritedRoleToggle() {
    return cy.get('.mcs-userSettings_switch');
  }

  @logGetter()
  get errorPopUp() {
    return cy.get('.ant-notification-notice-error');
  }

  @logGetter()
  get firstElement() {
    return cy.get('.rc-virtual-list-holder-inner');
  }

  @logGetter()
  get pageEdit() {
    return cy.get('.ant-drawer-body');
  }

  @logFunction()
  clickBtnAddRole() {
    return this.btnAddRole.click();
  }

  @logFunction()
  clickUserDropDownMenu() {
    return this.userDropDownMenu.click();
  }

  @logFunction()
  clickBtnEditRole() {
    this.bntEditRole.click();
  }

  @logFunction()
  clickBtnDeleteRole() {
    this.btnDeleteRole.click();
  }

  @logFunction()
  cardToggle(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`);
  }

  @logFunction()
  cardWithId(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`);
  }

  @logFunction()
  clickCardToggle(id: string) {
    return cy.get(`#mcs-foldable-card-${id}`).click();
  }

  @logFunction()
  homeIconColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(1)');
  }

  @logFunction()
  firstNamesColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(2)');
  }

  @logFunction()
  lastNamesColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(3)');
  }

  @logFunction()
  emailsColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(4)');
  }

  @logFunction()
  rolesColumnInCard(id: string) {
    return this.cardToggle(id).find('.ant-table-row > :nth-child(5)');
  }

  @logFunction()
  typeFilter(filter: string) {
    this.filterField.type(filter);
  }

  @logFunction()
  clickDisplayInheritedRoleToggle() {
    this.displayInheritedRoleToggle.click();
  }
}

export default RolesPage;
