import LoginPage from '../../pageobjects/LoginPage';

describe('Should test keycloak update password', () => {
  before(() => {});

  beforeEach(() => {
    cy.logout();
    window.localStorage.setItem('enable_keycloak', 'true');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Verify that password validity expired', () => {
    cy.visit('/').then(async () => {
      const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
      const email = 'test@mediarithmics.com';
      const bastion = Cypress.env('virtualPlatformName') + '.mics-sandbox.com';
      const ssh_options =
        '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o ProxyCommand="ssh -W %h:%p ' +
        bastion +
        '"';
      const hostname = '10.0.1.8';
      cy.exec(
        'scp ' +
          ssh_options +
          ' cypress/integration/Keycloak/sql_insert_user.sh ' +
          hostname +
          ':~/tmp.sh',
        { timeout: 20000 },
      );
      cy.exec('ssh ' + ssh_options + ' ' + hostname + ' "chmod +x ~/tmp.sh && ~/tmp.sh"', {
        timeout: 20000,
      });

      loginPageKeycloak.login(email);

      // Should check the password rotation of one year
      loginPageKeycloak.alertSuccess.should(
        'contain',
        'You need to change your password to activate your account',
      );
    });
  });

  it('Verify the password policy', () => {
    cy.visit('/').then(async () => {
      //const passwordRequirements = await keycloak.getPasswordRequirements(Cypress.env('apiToken'));
      const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
      const passwordRequirements = await loginPageKeycloak.apiPasswordRequirements;
      const minDigitCount = passwordRequirements.data.min_digit_count;
      const minSpecialCharsCount = passwordRequirements.data.min_special_chars_count;
      const differentLetterCaseNeeded = passwordRequirements.data.different_lettre_case_needed;
      const minLength = passwordRequirements.data.min_length;
      const forbidPopularPasswords = passwordRequirements.data.forbid_popular_passwords;

      const email = 'test@mediarithmics.com';
      const bastion = Cypress.env('virtualPlatformName') + '.mics-sandbox.com';
      const ssh_options =
        '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o ProxyCommand="ssh -W %h:%p ' +
        bastion +
        '"';
      const hostname = '10.0.1.8';
      cy.exec(
        'scp ' +
          ssh_options +
          ' cypress/integration/Keycloak/sql_insert_user.sh ' +
          hostname +
          ':~/tmp.sh',
        { timeout: 20000 },
      );
      cy.exec('ssh ' + ssh_options + ' ' + hostname + ' "chmod +x ~/tmp.sh && ~/tmp.sh"', {
        timeout: 20000,
      });

      loginPageKeycloak.login(email);

      // Should check the password rotation of one year
      loginPageKeycloak.alertSuccess.should(
        'contain',
        'You need to change your password to activate your account',
      );

      // Should show the password requirements
      loginPageKeycloak
        .getPasswordRequirements()
        .should('contain', minLength + ' characters minimum')
        .and('contain', minDigitCount + ' digit(s) minimum')
        .and('contain', minSpecialCharsCount + ' special character(s) minimum');

      // Insert not matching passwords
      loginPageKeycloak.typeNewPassword('12234');
      loginPageKeycloak.typeConfirmPassword('1234');
      loginPageKeycloak
        .getPasswordRequirements(false)
        .should('contain', 'Both passwords should match');
      loginPageKeycloak.btnSubmitPassword.should('be.disabled');

      // Should not accept short and obvious password
      if (forbidPopularPasswords == 'true') {
        loginPageKeycloak.typeNewPassword('1234');
        loginPageKeycloak.typeConfirmPassword('1234');
        loginPageKeycloak
          .getPasswordRequirements(false)
          .should('contain', 'Passwords cannot be too obvious')
          .and('contain', minLength + ' characters minimum');
        loginPageKeycloak.btnSubmitPassword.should('be.disabled');
      }

      // Should not accept password without 1 special character
      loginPageKeycloak.typeNewPassword('qsdfjdsqN7kfeu');
      loginPageKeycloak.typeConfirmPassword('qsdfjdsqN7kfeu');
      loginPageKeycloak
        .getPasswordRequirements(false)
        .should('contain', minSpecialCharsCount + ' special character(s) minimum');
      loginPageKeycloak.btnSubmitPassword.should('be.disabled');

      // Should not accept password without both upper case and lower case
      if (differentLetterCaseNeeded == 'true') {
        loginPageKeycloak.typeNewPassword('qsdfjdsqn@7kfeu');
        loginPageKeycloak.typeConfirmPassword('qsdfjdsqn@7kfeu');
        loginPageKeycloak
          .getPasswordRequirements(false)
          .should('contain', 'One lowercase and one uppercase character');
        loginPageKeycloak.btnSubmitPassword.should('be.disabled');
      }

      // Should not accept password without numbers
      loginPageKeycloak.typeNewPassword('qsdfjdsqN@kfeu');
      loginPageKeycloak.typeConfirmPassword('qsdfjdsqN@kfeu');
      loginPageKeycloak
        .getPasswordRequirements(false)
        .should('contain', minDigitCount + ' digit(s) minimum');
      loginPageKeycloak.btnSubmitPassword.should('be.disabled');
    });
  });

  it.skip('Verify that a expired password can be changed', () => {
    cy.visit('/').then(async () => {
      const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
      const email = 'test@mediarithmics.com';
      const bastion = Cypress.env('virtualPlatformName') + '.mics-sandbox.com';
      const ssh_options =
        '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o ProxyCommand="ssh -W %h:%p ' +
        bastion +
        '"';
      const hostname = '10.0.1.8';

      cy.exec(
        'scp ' +
          ssh_options +
          ' cypress/integration/Keycloak/sql_insert_user.sh ' +
          hostname +
          ':~/tmp.sh',
        { timeout: 20000 },
      );
      cy.exec('ssh ' + ssh_options + ' ' + hostname + ' "chmod +x ~/tmp.sh && ~/tmp.sh"', {
        timeout: 20000,
      });

      loginPageKeycloak.login(email);

      // Should check the password rotation of one year
      loginPageKeycloak.alertSuccess.should(
        'contain',
        'You need to change your password to activate your account',
      );

      // Insert a valid password
      const password = 'qsdfjdsqN7@kfeu';
      loginPageKeycloak.typeNewPassword(password);
      loginPageKeycloak.typeConfirmPassword(password);
      loginPageKeycloak.getPasswordRequirements(false).should('have.length', 0);
      loginPageKeycloak.btnSubmitPassword.should('be.enabled');
      loginPageKeycloak.clickBtnSubmitPassword();

      cy.wait(3000);
      cy.reload();

      cy.url({ timeout: 10000 }).should(
        'contains',
        Cypress.config().baseUrl + '/#/v2/o/1/campaigns',
      );

      // Logout
      cy.logout();

      // Login with old password
      loginPageKeycloak.login(email);
      loginPageKeycloak.errorPassword.should('be.visible').and('contain', 'Invalid password');

      // Login with the new password
      loginPageKeycloak.typePassword(password);
      loginPageKeycloak.clickBtnSignIn();
      cy.url().should('contains', Cypress.config().baseUrl + '/#/v2/o/1/campaigns');
    });
  });

  it('Verify forgot password notification', () => {
    cy.visit('/');
    const loginPageKeycloak = new LoginPage(Cypress.env('apiToken'));
    const email = 'test@mediarithmics.com';
    const bastion = Cypress.env('virtualPlatformName') + '.mics-sandbox.com';
    const ssh_options =
      '-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -o ProxyCommand="ssh -W %h:%p ' +
      bastion +
      '"';
    const db1 = '10.0.1.8';
    const front3 = '10.0.1.15';

    cy.exec(
      'scp ' +
        ssh_options +
        ' cypress/integration/Keycloak/sql_insert_user.sh ' +
        db1 +
        ':~/sql_insert_user.sh',
      { timeout: 20000 },
    );
    cy.exec(
      'scp ' +
        ssh_options +
        ' cypress/integration/Keycloak/check_notification.sh ' +
        front3 +
        ':~/check_notification.sh',
      { timeout: 20000 },
    );
    cy.exec(
      'ssh ' + ssh_options + ' ' + db1 + ' "chmod +x ~/sql_insert_user.sh && ~/sql_insert_user.sh"',
      {
        timeout: 20000,
      },
    );

    loginPageKeycloak.typeEmail(email);
    loginPageKeycloak.clickBtnSignIn();
    loginPageKeycloak.clickLinkForgetPassword();
    loginPageKeycloak.clickContinue();

    cy.exec(
      'ssh ' +
        ssh_options +
        ' ' +
        front3 +
        ' "chmod +x ~/check_notification.sh && ~/check_notification.sh ' +
        email +
        '"',
      {
        timeout: 20000,
      },
    );
  });
});
