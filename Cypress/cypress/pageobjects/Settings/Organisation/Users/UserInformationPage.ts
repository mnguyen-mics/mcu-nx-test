import Page from '../../../Page';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

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

  @logGetter()
  get firstNameField() {
    return cy.get('.mcs-userForm_input').eq(0);
  }

  @logGetter()
  get lastNameField() {
    return cy.get('.mcs-userForm_input').eq(1);
  }

  @logGetter()
  get emailField() {
    return cy.get('.mcs-userForm_input').eq(2);
  }

  @logGetter()
  get organisationField() {
    return cy.get('.mcs-userForm_select').find('input');
  }

  @logGetter()
  get btnOrganisationFieldSearch() {
    return cy.get('.ant-input-search-button');
  }

  @logGetter()
  get btnSaveUser() {
    return cy.get('.mcs-saveButton');
  }

  @logGetter()
  get organisationSelectionDropDown() {
    return cy.get('.ant-select-item-option');
  }

  @logFunction()
  typeFirstName(firstName: string = this.firstName) {
    this.firstNameField.clear().type(firstName);
  }

  @logFunction()
  typeLastName(lastName: string = this.lastName) {
    this.lastNameField.clear().type(lastName);
  }

  @logFunction()
  typeEmail(email: string = this.email) {
    this.emailField.clear().type(email);
  }

  @logFunction()
  clickOrganisationField() {
    this.organisationField.click();
  }

  @logFunction()
  typeOrganisation(organisation: string) {
    this.organisationField.clear().type(organisation);
  }

  @logFunction()
  clickBtnOrganisationFieldSearch() {
    this.btnOrganisationFieldSearch.click();
  }

  @logFunction()
  clickBtnSaveUser() {
    this.btnSaveUser.click();
  }
}

export default UserInformationPage;
