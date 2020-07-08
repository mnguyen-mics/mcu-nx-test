class LoginPage {
  visit() {
    cy.visit('/');
  }

  fillEmail(value) {
    const field = cy.get('#email.ant-input.login-input');
    field.type(value);
    
    return this;
  }

  fillPassword(value) {
    const field = cy.get('#password.ant-input.login-input');
    field.type(value);
    
    return this;
  }
  
  submit() {
    const button = cy.get('.login-form-button');
    button.click();
  }
}

export default LoginPage;