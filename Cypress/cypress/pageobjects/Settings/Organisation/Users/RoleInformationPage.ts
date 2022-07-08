import Page from '../../../Page';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class RoleInformationPage extends Page {
  constructor() {
    super();
  }

  @logGetter()
  get userSearchField() {
    return cy.get('.ant-form').find('.ant-input').eq(0);
  }

  @logGetter()
  get organisationDropDown() {
    return cy.get('.ant-form').find('.ant-input').eq(1);
  }

  @logGetter()
  get organisationsAvailableMenu() {
    return cy.get('#rc_select_3');
  }

  @logGetter()
  get readerRoleRadioBtn() {
    return cy.get(':nth-child(1) > .ant-radio-wrapper > .ant-radio');
  }

  @logGetter()
  get editorRoleRadioBtn() {
    return cy.get(':nth-child(2) > .ant-radio-wrapper > .ant-radio');
  }

  @logGetter()
  get organisationAdminRoleRadioBtn() {
    return cy.get(':nth-child(3) > .ant-radio-wrapper > .ant-radio');
  }

  @logGetter()
  get communityAdminRoleRadioBtn() {
    return cy.get(':nth-child(4) > .ant-radio-wrapper > .ant-radio');
  }

  @logGetter()
  get btnSave() {
    return cy.get('.ant-form > .ant-btn-primary').contains('Save');
  }

  @logGetter()
  get closeEditBtn() {
    return cy.get('.anticon-close');
  }

  @logFunction()
  typeUserSearch(user: string) {
    this.userSearchField.type(user);
  }

  @logFunction()
  clickOrganisationDropDown() {
    this.organisationDropDown.click();
  }

  @logFunction()
  typeOrganisationWithName(organisation: string) {
    this.organisationsAvailableMenu.type(organisation);
  }

  @logFunction()
  clickBtnSave() {
    this.btnSave.click();
  }

  @logFunction()
  clickCloseEditBtn() {
    this.closeEditBtn.click();
  }

  @logFunction()
  clickBtnEditorRole() {
    this.editorRoleRadioBtn.click();
  }

  @logFunction()
  clickBtnReaderRole() {
    this.readerRoleRadioBtn.click();
  }

  @logFunction()
  clickBtnOrganisationAdminRole() {
    this.organisationAdminRoleRadioBtn.click();
  }

  @logFunction()
  clickCommunityAdminRoleBtn() {
    this.communityAdminRoleRadioBtn.click();
  }

  @logFunction()
  clickOnRole(role: string) {
    switch (role) {
      case 'reader':
        this.clickBtnReaderRole();
        break;
      case 'editor':
        this.clickBtnEditorRole();
        break;
      case 'organisation_admin':
        this.clickBtnOrganisationAdminRole();
        break;
      case 'communityy_admin':
        this.clickCommunityAdminRoleBtn();
        break;

      default:
        break;
    }
  }
}

export default RoleInformationPage;
