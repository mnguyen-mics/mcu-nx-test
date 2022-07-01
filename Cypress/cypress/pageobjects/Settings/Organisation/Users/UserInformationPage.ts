import Page from '../../../Page';

class UserInformationPage extends Page {
  firstName: string;
  lastName: string;
  email: string;

  constructor(firstName: string, lastName: string, email: string) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
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
}

export default UserInformationPage;
