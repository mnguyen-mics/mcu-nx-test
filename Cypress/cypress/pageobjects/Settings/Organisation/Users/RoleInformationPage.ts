import Page from '../../../Page';

class RoleInformationPage extends Page {
  constructor() {
    super();
  }

  get userSearchField() {
    return cy.get('.ant-form').find('.ant-input').eq(0);
  }

  get organisationDropDown() {
    return cy.get('.ant-form').find('.ant-input').eq(1);
  }

  get organisationsAvailableMenu() {
    return cy.get('#rc_select_3');
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

  get btnSave() {
    return cy.get('.ant-form > .ant-btn-primary').contains('Save');
  }

  get closeEditBtn() {
    return cy.get('.anticon-close');
  }

  typeUserSearch(user: string) {
    this.userSearchField.type(user);
  }

  clickOrganisationDropDown() {
    this.organisationDropDown.click();
  }

  typeOrganisationWithName(organisation: string) {
    this.organisationsAvailableMenu.type(organisation);
  }

  clickBtnSave() {
    this.btnSave.click();
  }

  clickCloseEditBtn() {
    this.closeEditBtn.click();
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
