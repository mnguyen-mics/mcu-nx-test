import Page from './Page';
import { logFunction, logGetter } from './log/LoggingDecorator';

class LoginPage extends Page {
  apiPasswordRequirements;

  constructor(accessToken: string) {
    super();
    this.apiPasswordRequirements = this.getApiPasswordRequirements(accessToken);
  }
  // getters

  @logGetter()
  get alertError() {
    return cy.get('.mcs-keycloak_formLogin--alerterror');
  }

  @logGetter()
  get alertSuccess() {
    return cy.get('.mcs-keycloak_formLogin--alertsuccess');
  }

  @logGetter()
  get alertWarning() {
    return cy.get('.mcs-keycloak_formLogin--alertwarning');
  }

  @logGetter()
  get btnContinue() {
    return cy.get('input').contains('Continue');
  }

  @logGetter()
  get btnResetLogin() {
    return cy.get('.mcs-keycloak_formLogin_resetLoginButton');
  }

  @logGetter()
  get btnSignIn() {
    return cy.get('.mcs-keycloak_formLogin_submitButton');
  }

  @logGetter()
  get btnSubmitPassword() {
    return cy.get('.mcs-keycloak_formLogin_submitButton', { timeout: 10000 });
  }

  @logGetter()
  get btnViewPassword() {
    return cy.get('.mcs-keycloak_formLogin_password_eye');
  }

  @logGetter()
  get btnViewPasswordConfirm() {
    return cy.get('.mcs-keycloak_formLogin_passwordConfirm_eye');
  }

  @logGetter()
  get btnViewPasswordNew() {
    return cy.get('.mcs-keycloak_formLogin_passwordNew_eye');
  }

  @logGetter()
  get confirmPasswordField() {
    return cy.get('.mcs-keycloak_formLogin_passwordConfirmField');
  }

  @logGetter()
  get emailField() {
    return cy.get('.mcs-keycloak_formLogin_usernameField');
  }

  @logGetter()
  get errorPassword() {
    return cy.get('.mcs-keycloak_formLogin_passwordField--error');
  }

  @logGetter()
  get errorPasswordConfirm() {
    return cy.get('.mcs-keycloak_formLogin_passwordConfirmField--error');
  }

  @logGetter()
  get errorUsername() {
    return cy.get('.mcs-keycloak_formLogin_usernameField--error');
  }

  @logGetter()
  get forgetPasswordEmailAlert() {
    return cy.get('.alert-success-newlines');
  }

  @logGetter()
  get forgetPasswordLink() {
    return cy.get('.mcs-keycloak_formLogin_forgotPasswordButton');
  }

  @logGetter()
  get formLogin() {
    return cy.get('.mcs-keycloak_formLogin');
  }

  @logGetter()
  get invalidPasswordRequirements() {
    return this.passwordRequirements.find('.invalid');
  }

  @logGetter()
  get newPasswordField() {
    return cy.get('.mcs-keycloak_formLogin_passwordNewField');
  }

  @logGetter()
  get passwordField() {
    return cy.get('.mcs-keycloak_formLogin_passwordField');
  }

  @logGetter()
  get passwordRequirements() {
    return cy.get('#password-requirements');
  }

  @logGetter()
  get validPasswordRequirements() {
    return this.passwordRequirements.find('.valid');
  }

  // helpers

  @logFunction()
  async getApiPasswordRequirements(accessToken: string) {
    const response = await fetch(
      `https://api.mediarithmics.com/v1/communities/technical_name=mics-platform/password_requirements`,
      {
        method: 'GET',
        headers: { Authorization: accessToken, 'Content-type': 'application/json' },
      },
    );
    return response.json();
  }

  @logFunction()
  clickBtnResetLogin() {
    this.btnResetLogin.click();
  }

  @logFunction()
  clickBtnSignIn() {
    this.btnSignIn.click();
  }

  @logFunction()
  clickBtnSubmitPassword() {
    this.btnSubmitPassword.click();
  }

  @logFunction()
  clickBtnViewPassword() {
    this.btnViewPassword.click();
  }

  @logFunction()
  clickBtnViewPasswordConfirm() {
    this.btnViewPasswordConfirm.click();
  }

  @logFunction()
  clickBtnViewPasswordNew() {
    this.btnViewPasswordNew.click();
  }

  @logFunction()
  clickContinue() {
    this.btnContinue.click();
  }

  @logFunction()
  clickLinkForgetPassword() {
    this.forgetPasswordLink.click();
  }

  @logFunction()
  typeConfirmPassword(password: string) {
    this.confirmPasswordField.clear().type(password);
  }

  @logFunction()
  typeEmail(email: string) {
    this.emailField.clear().type(email);
  }

  @logFunction()
  typeNewPassword(password: string) {
    this.newPasswordField.clear().type(password);
  }

  @logFunction()
  typePassword(password: string) {
    this.passwordField.clear().type(password);
  }

  @logFunction()
  login(email: string = Cypress.env('devMail'), password: string = Cypress.env('devPwd')) {
    cy.intercept('**/campaigns?organisation_id=1**').as('load');
    this.typeEmail(email);
    this.clickBtnSignIn();
    this.typePassword(password);
    this.clickBtnSignIn();

    cy.wait('@load');
  }

  @logFunction()
  updatePassword(password: string) {
    this.typeNewPassword(password);
    this.typeConfirmPassword(password);
    this.clickBtnSubmitPassword();
  }

  @logFunction()
  getPasswordRequirements(isValid?: boolean) {
    switch (isValid) {
      case true:
        return this.validPasswordRequirements;
      case false:
        return this.invalidPasswordRequirements;
      default:
        return this.passwordRequirements;
    }
  }
}

export default LoginPage;
