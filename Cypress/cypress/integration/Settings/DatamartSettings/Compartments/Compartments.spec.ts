import faker from 'faker';
describe('Compartments test', () => {
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

  it('Should display settings/datamart/compartments list', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);

      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.compartments').click();

      // check columns
      cy.get('.mcs-table-view').should('contain', 'Compartment ID');
      cy.get('.mcs-table-view').should('contain', 'Name');
      cy.get('.mcs-table-view').should('contain', 'Token');

      // check buttons
      cy.get('.mcs-card-header').find('.mcs-card-button').should('contain', 'New Compartment');

      // check default compartment existence
      cy.get('.mcs-table-body').should('contain', 'Default');
    });
  });

  it('Should not submit form if missing required fields', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);

      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.compartments').click();

      cy.get('.mcs-card-header').find('.mcs-card-button').click();
      cy.contains(`${data.datamartName}`).click();

      cy.get('.mcs-form_saveButton_compartmentForm').click();
      cy.wait(3000);
      cy.url().should('contain', '/compartments/create');
    });
  });

  it('Should create a compartment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);

      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.compartments').click();

      cy.get('.mcs-card-header').find('.mcs-card-button').click();
      cy.contains(`${data.datamartName}`).click();

      const compartmentName = faker.random.words(6);
      const compartmentToken = faker.random.words(2).replace(' ', '-');
      cy.get('.mcs-compartments_nameField').type(compartmentName);
      cy.get('.mcs-compartments_tokenField').type(compartmentToken);

      cy.get('.mcs-form-container').find('.mcs-button').click();
      cy.get('.mcs-compartments_switchField').click();

      cy.get('.mcs-form_saveButton_compartmentForm').click();

      cy.get('.mcs-compartmentsTable_compartmentId').first().should('contain', 'Default');
      cy.get('.mcs-compartmentsTable_compartmentName').first().should('contain', compartmentName);
      cy.get('.mcs-compartmentsTable_compartmentToken').first().should('contain', compartmentToken);
    });
  });

  it('Should edit a compartment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.goToHome(data.organisationId);

      cy.get('.mcs-navigator-header-actions-settings').click();
      cy.get('.mcs-settingsMainMenu_menu\\.datamart\\.title').click();
      cy.get('.mcs-settingsSideMenu_menu\\.datamart\\.compartments').click();

      cy.get('.mcs-compartmentsTable_dropDownMenu').first().click();
      cy.get('.mcs-compartmentsTable_dropDownMenu--edit').click();

      const compartmentName = faker.random.words(6);
      cy.get('.mcs-compartments_nameField').clear().type(compartmentName);
      cy.get('.mcs-form_saveButton_compartmentForm').click();
      cy.get('.mcs-table-view').should('contain', compartmentName);
    });
  });
});
