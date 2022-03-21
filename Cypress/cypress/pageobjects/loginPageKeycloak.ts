import Page from './page';

class LoginPageKeycloak extends Page {
  get emailField() {
    return cy.get('.mcs-keycloak_formLogin_usernameField');
  }

  get passwordField() {
    return cy.get('.mcs-keycloak_formLogin_passwordField');
  }

  get btnSignIn() {
    return cy.get('.mcs-keycloak_formLogin_submitButton');
  }

  get btnResetLogin() {
    return cy.get('.mcs-keycloak_formLogin_resetLoginButton');
  }

  get errorUsername() {
    return cy.get('.mcs-keycloak_formLogin_usernameField--error');
  }

  get errorPassword() {
    return cy.get('.mcs-keycloak_formLogin_passwordField--error');
  }

  get errorPasswordConfirm() {
    return cy.get('.mcs-keycloak_formLogin_passwordConfirmField--error');
  }

  get alertError() {
    return cy.get('.mcs-keycloak_formLogin--alerterror');
  }

  get alertWarning() {
    return cy.get('.mcs-keycloak_formLogin--alertwarning');
  }

  get newPasswordField() {
    return cy.get('.mcs-keycloak_formLogin_passwordNewField');
  }

  get confirmPasswordField() {
    return cy.get('.mcs-keycloak_formLogin_passwordConfirmField');
  }

  get btnSubmitPassword() {
    return cy.get('.mcs-keycloak_formLogin_submitButton');
  }

  get btnViewPassword() {
    return cy.get('.mcs-keycloak_formLogin_password_eye');
  }

  get btnViewPasswordNew() {
    return cy.get('.mcs-keycloak_formLogin_passwordNew_eye');
  }

  get btnViewPasswordConfirm() {
    return cy.get('.mcs-keycloak_formLogin_passwordConfirm_eye');
  }

  typeEmail(email: string) {
    this.emailField.clear().type(email);
  }

  typePassword(password: string) {
    this.passwordField.clear().type(password);
  }

  typeNewPassword(password: string) {
    this.newPasswordField.clear().type(password);
  }

  typeConfirmPassword(password: string) {
    this.confirmPasswordField.clear().type(password);
  }

  clickBtnSignIn() {
    this.btnSignIn.click();
  }

  clickBtnResetLogin() {
    this.btnResetLogin.click();
  }

  clickBtnSubmitPassword() {
    this.btnSubmitPassword.click();
  }

  clickBtnViewPassword() {
    this.btnViewPassword.click();
  }

  clickBtnViewPasswordNew() {
    this.btnViewPasswordNew.click();
  }

  clickBtnViewPasswordConfirm() {
    this.btnViewPasswordConfirm.click();
  }

  login(email: string = Cypress.env('devMail'), password: string = Cypress.env('devPwd')) {
    this.typeEmail(email);
    this.clickBtnSignIn();
    this.typePassword(password);
    this.clickBtnSignIn();
  }

  updatePassword(password: string) {
    this.typeNewPassword(password);
    this.typeConfirmPassword(password);
    this.clickBtnSubmitPassword();
  }
}

export default new LoginPageKeycloak();
