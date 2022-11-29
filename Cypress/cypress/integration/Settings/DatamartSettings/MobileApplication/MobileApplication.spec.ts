import faker from 'faker';

before(() => {
  cy.login();
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.switchOrg(data.organisationName);
  });
});

beforeEach(() => {
  cy.restoreLocalStorageCache();
});

afterEach(() => {
  cy.saveLocalStorageCache();
});

it('Should display name, token and creation date list', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Mobile Applications').click();

    // Check columns
    cy.contains('Name');
    cy.contains('Token');
    cy.contains('Creation Date');

    // Check button
    cy.contains('New Mobile Application');

    // Check that there is no mobile application
    cy.get('tbody').within(() => {
      cy.get('tr').should('have.length', 0);
    });
  });
});

it('Should not submit form if missing required fields', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Mobile Applications').click();

    cy.contains('New Mobile Application').click();

    cy.contains(`${data.datamartName}`).click();

    cy.get('form').submit();

    cy.get('[class="ant-form-item-control has-error"]').as('required-items');

    cy.get('@required-items').should('have.length', 2);
    cy.get('@required-items').within(() => {
      cy.contains('required');
    });
    cy.get('[class="mcs-close"]').click();
  });
});

it('Should create a Mobile Application', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Mobile Applications').click();

    cy.contains('New Mobile Application').click();

    cy.contains(`${data.datamartName}`).click();

    const mobileApplicationName = faker.random.words(4);
    const mobileApplicationToken = faker.random.words(2).replace(' ', '-');
    cy.get('[id="mobileapplication.name"]').type(mobileApplicationName);
    cy.get('[id="mobileapplication.token"]').type(mobileApplicationToken);

    cy.get('form').submit();

    cy.contains(mobileApplicationName)
      .parents('tr')
      .within(() => {
        cy.get('td').eq(0).contains(mobileApplicationName);
        cy.get('td').eq(1).contains(mobileApplicationToken);
      });
  });
});

it('Should edit a Mobile Application', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Mobile Applications').click();

    cy.get('[class="mcs-chevron"]').first().click();
    cy.contains('Edit').click();

    const mobileApplicationName = faker.random.words(4);
    cy.get('[id="mobileapplication.name"]').clear().type(mobileApplicationName);
    cy.get('form').submit();
    cy.contains(mobileApplicationName);
  });
});
