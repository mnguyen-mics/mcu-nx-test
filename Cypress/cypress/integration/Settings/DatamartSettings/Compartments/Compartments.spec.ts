import Compartments from '../../../../pageobjects/Settings/Datamart/CompartmentsPage';
import faker from 'faker';
describe('Compartments test', () => {
  before(() => {});

  beforeEach(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
    });
  });

  it('Should display settings/datamart/compartments list', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const compartments = new Compartments();
      compartments.goToPage();
      compartments.columnShouldExist('Compartment ID');
      compartments.columnShouldExist('Name');
      compartments.columnShouldExist('Token');
      compartments.defaultCompartmentShouldExist();
    });
  });

  it('Should not submit form if missing required fields', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const compartments = new Compartments();
      compartments.goToPage();

      compartments.clickNew();
      compartments.chooseDatamart(`${data.datamartName}`);
      compartments.clickSave();

      cy.url().should('contain', '/compartments/create');
      compartments.clickClose();
    });
  });

  it('Should create a compartment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const compartments = new Compartments();
      compartments.goToPage();

      compartments.clickNew();
      compartments.chooseDatamart(`${data.datamartName}`);

      compartments.setName();
      compartments.setToken();

      compartments.clickAdvanced();
      compartments.clickDefaultSwitch();
      compartments.clickSave();

      compartments.idShouldContain('Default');
      compartments.nameShouldBeCorrect();
      compartments.tokenShouldBeCorrect();
    });
  });

  it('Should edit a compartment', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const compartments = new Compartments();
      compartments.goToPage();

      compartments.clickNew();
      compartments.chooseDatamart(`${data.datamartName}`);

      compartments.setName();
      compartments.setToken();

      compartments.clickAdvanced();
      compartments.clickDefaultSwitch();
      compartments.clickSave();

      compartments.edit(compartments.name);
      compartments.setName('after edition');
      compartments.clickSave();
      compartments.tableShouldContain(compartments.name);
    });
  });
});
