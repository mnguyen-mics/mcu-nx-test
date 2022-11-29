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

it('Should display name/token/creation date list', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Sites').click();

    // check columns
    cy.contains('Name');
    cy.contains('Token');
    cy.contains('Creation Date');

    // check buttons
    cy.contains('New Site');

    // check default compartment existence
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
    cy.contains('Sites').click();

    cy.contains('New Site').click();

    cy.get('form').submit();

    cy.get('[class="ant-form-item-control has-error"]').as('required-items');

    cy.get('@required-items').should('have.length', 3);
    cy.get('@required-items').within(() => {
      cy.contains('required');
    });
    cy.get('[class="mcs-close"]').click();
  });
});

it('Should create a site', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Sites').click();

    cy.contains('New Site').click();

    const compartmentName = faker.random.words(6);
    const compartmentToken = faker.random.words(2).replace(' ', '-');
    cy.get('[id="site.name"]').type(compartmentName);
    cy.get('[id="site.token"]').type(compartmentToken);
    cy.get('[id="site.domain"]').type(`www.mediarithmics.com`);

    cy.get('form').submit();

    cy.contains(compartmentName)
      .parents('tr')
      .within(() => {
        cy.get('td').eq(0).contains(compartmentName);
        cy.get('td').eq(1).contains(compartmentToken);
      });
  });
});

it('Should edit a site', () => {
  cy.readFile('cypress/fixtures/init_infos.json').then(data => {
    cy.goToHome(data.organisationId);

    cy.get('[class="mcs-options"]').click();
    cy.contains('Datamart').click();
    cy.contains('Sites').click();

    cy.get('[class="mcs-chevron"]').first().click();
    cy.contains('Edit').click();

    const compartmentName = faker.random.words(6);
    cy.get('[id="site.name"]').clear().type(compartmentName);
    cy.get('form').submit();
    cy.contains(compartmentName);
  });
});
