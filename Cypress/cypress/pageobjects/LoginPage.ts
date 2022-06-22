import Page from './Page';

class LoginPage extends Page {
  constructor(accessToken: string) {
    super();
    this.apiPasswordRequirements = this.getApiPasswordRequirements(accessToken);
  }
  // getters
  get alertError() {
    cy.log('alertError');
    return cy.get('.mcs-keycloak_formLogin--alerterror');
  }
  get alertSuccess() {
    cy.log('alertSuccess');
    return cy.get('.mcs-keycloak_formLogin--alertsuccess');
  }
  get alertWarning() {
    cy.log('alertWarning');
    return cy.get('.mcs-keycloak_formLogin--alertwarning');
  }
  get btnContinue() {
    cy.log('btnContinue');
    return cy.get('input').contains('Continue');
  }
  get btnResetLogin() {
    cy.log('btnResetLogin');
    return cy.get('.mcs-keycloak_formLogin_resetLoginButton');
  }
  get btnSignIn() {
    cy.log('btnSignIn');
    return cy.get('.mcs-keycloak_formLogin_submitButton');
  }
  get btnSubmitPassword() {
    cy.log('btnSubmitPassword');
    return cy.get('.mcs-keycloak_formLogin_submitButton', { timeout: 10000 });
  }
  get btnViewPassword() {
    cy.log('btnViewPassword');
    return cy.get('.mcs-keycloak_formLogin_password_eye');
  }
  get btnViewPasswordConfirm() {
    cy.log('btnViewPasswordConfirm');
    return cy.get('.mcs-keycloak_formLogin_passwordConfirm_eye');
  }
  get btnViewPasswordNew() {
    cy.log('btnViewPasswordNew');
    return cy.get('.mcs-keycloak_formLogin_passwordNew_eye');
  }
  get confirmPasswordField() {
    cy.log('confirmPasswordField');
    return cy.get('.mcs-keycloak_formLogin_passwordConfirmField');
  }
  get emailField() {
    cy.log('emailField');
    return cy.get('.mcs-keycloak_formLogin_usernameField');
  }
  get errorPassword() {
    cy.log('errorPassword');
    return cy.get('.mcs-keycloak_formLogin_passwordField--error');
  }
  get errorPasswordConfirm() {
    cy.log('errorPasswordConfirm');
    return cy.get('.mcs-keycloak_formLogin_passwordConfirmField--error');
  }
  get errorUsername() {
    cy.log('errorUsername');
    return cy.get('.mcs-keycloak_formLogin_usernameField--error');
  }
  get forgetPasswordEmailAlert() {
    return cy.get('.alert-success-newlines');
  }
  get forgetPasswordLink() {
    cy.log('forgetPasswordLink');
    return cy.get('.mcs-keycloak_formLogin_forgotPasswordButton');
  }
  get formLogin() {
    cy.log('formLogin');
    return cy.get('.mcs-keycloak_formLogin');
  }
  get invalidPasswordRequirements() {
    cy.log('invalidPasswordRequirements');
    return this.passwordRequirements.find('.invalid');
  }
  get newPasswordField() {
    cy.log('newPasswordField');
    return cy.get('.mcs-keycloak_formLogin_passwordNewField');
  }
  get passwordField() {
    cy.log('passwordField');
    return cy.get('.mcs-keycloak_formLogin_passwordField');
  }
  get passwordRequirements() {
    cy.log('passwordRequirements');
    return cy.get('#password-requirements');
  }
  get validPasswordRequirements() {
    cy.log('validPasswordRequirements');
    return this.passwordRequirements.find('.valid');
  }

  // helpers
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
  clickBtnResetLogin() {
    cy.log('clickBtnResetLogin');
    this.btnResetLogin.click();
  }
  clickBtnSignIn() {
    cy.log('clickBtnSignIn');
    this.btnSignIn.click();
  }
  clickBtnSubmitPassword() {
    cy.log('clickBtnSubmitPassword');
    this.btnSubmitPassword.click();
  }
  clickBtnViewPassword() {
    cy.log('clickBtnViewPassword');
    this.btnViewPassword.click();
  }
  clickBtnViewPasswordConfirm() {
    cy.log('clickBtnViewPasswordConfirm');
    this.btnViewPasswordConfirm.click();
  }
  clickBtnViewPasswordNew() {
    cy.log('clickBtnViewPasswordNew');
    this.btnViewPasswordNew.click();
  }
  clickContinue() {
    cy.log('clickContinue');
    this.btnContinue.click();
  }
  clickLinkForgetPassword() {
    cy.log('clickLinkForgetPassword');
    this.forgetPasswordLink.click();
  }
  typeConfirmPassword(password: string) {
    cy.log('typeConfirmPassword(' + password + ')');
    this.confirmPasswordField.clear().type(password);
  }
  typeEmail(email: string) {
    cy.log('typeEmail(' + email + ')');
    this.emailField.clear().type(email);
  }
  typeNewPassword(password: string) {
    cy.log('typeNewPassword(' + password + ')');
    this.newPasswordField.clear().type(password);
  }
  typePassword(password: string) {
    cy.log('typePassword');
    this.passwordField.clear().type(password);
  }
  login(email: string = Cypress.env('devMail'), password: string = Cypress.env('devPwd')) {
    cy.log('login(email=' + email + ')');
    this.typeEmail(email);
    this.clickBtnSignIn();
    this.typePassword(password);
    this.clickBtnSignIn();
  }
  updatePassword(password: string) {
    cy.log('updatePassword');
    this.typeNewPassword(password);
    this.typeConfirmPassword(password);
    this.clickBtnSubmitPassword();
  }
  getPasswordRequirements(isValid?: boolean) {
    cy.log('getPasswordRequirements');
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
