import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import UsersPage from '../../../../pageobjects/Settings/Organisation/Users/UsersPage';
import faker from 'faker';
import {
  createUserQuery,
  createOrganisationQuery,
  createSubOrganisationQuery,
  OrganisationQuery,
  createUserAndLoginWithIt,
} from '../../../helpers/OrganisationHelper';

describe('Users test', () => {
  let subOrg1: OrganisationQuery;
  let subOrg1_1: OrganisationQuery;
  let subOrg2: OrganisationQuery;

  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const organisationName1: string = `child_1_of_${data.organisationName}`;
      const organisationName2: string = `child_2_of_${data.organisationName}`;
      const organisationName1_1: string = `grandchild_1.1_of_${data.organisationName}`;

      subOrg1 = await createSubOrganisationQuery(
        data.accessToken,
        organisationName1,
        data.organisationId,
      );
      subOrg1_1 = await createSubOrganisationQuery(
        data.accessToken,
        organisationName1_1,
        subOrg1.id,
      );
      subOrg2 = await createSubOrganisationQuery(
        data.accessToken,
        organisationName2,
        data.organisationId,
      );
    });
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
    window.localStorage.setItem('features', '["new-userSettings"]');
    cy.intercept('GET', '**/users').as('getUsers');
    cy.logout();
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should not add a new user in an organisation not in the community', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const newOrganisationName: string = faker.random.words(3);
      console.log(newOrganisationName);
      await createOrganisationQuery(data.accessToken, newOrganisationName);

      await createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      usersPage.goToPage();

      usersPage.clickBtnAddUser();
      usersPage.typeFirstName();
      usersPage.typeLastName();
      usersPage.typeEmail();
      usersPage.clickOrganisationField();
      usersPage.organisationSelectionDropDown.should('have.length', 4);
      usersPage.typeOrganisation(newOrganisationName);
      cy.wait(100);
      usersPage.organisationSelectionDropDown.should('not.contain', newOrganisationName);
    });
  });

  //https://mediarithmics.atlassian.net/browse/MICS-13508?filter=-2
  //Users are nos displayed when connected with a user created in an organisation which is not a community, for instance with a user created in “Test AV 1” or “Test AV 1.1” wih any role (it works with old GUI)
  it.skip('Organisation admin should be able to add a user to its organisation and its childs organisations but not above', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      await createUserAndLoginWithIt(subOrg1.id, 'ORGANISATION_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(subOrg1.id);
      usersPage.goToPage();
      cy.wait('@getUsers');

      usersPage.cardWithId(subOrg1.id);

      usersPage.addUser(subOrg1.name, new UsersPage().email);
      cy.wait('@getUsers');
      usersPage.addUser(subOrg1_1.name, new UsersPage().email);
      cy.wait('@getUsers');
      usersPage.addUser(subOrg2.name, new UsersPage().email);
      usersPage.errorPopUp.should('be.visible');
      usersPage.errorPopUp.should('not.exist');
      usersPage.addUser(data.organisationName, new UsersPage().email);
      usersPage.errorPopUp.should('be.visible');
    });
  });

  //https://mediarithmics.atlassian.net/browse/MICS-13508?filter=-2
  //Users are nos displayed when connected with a user created in an organisation which is not a community, for instance with a user created in “Test AV 1” or “Test AV 1.1” wih any role (it works with old GUI)
  it.skip('Reader should only be able to view users in its organisation branch', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      await createUserQuery(data.accessToken, data.organisationId, 'UserOrg0');
      await createUserQuery(data.accessToken, subOrg1.id, 'UserOrg1');
      await createUserQuery(data.accessToken, subOrg1_1.id, 'UserOrg1_1');

      await createUserAndLoginWithIt(subOrg1.id, 'READER');
      HeaderMenu.switchOrgWithCreatedUser(subOrg1.id);
      usersPage.goToPage();

      usersPage.firstNamesColumnInCard(subOrg1.id).should('contain', 'UserOrg1');

      usersPage.clickCardToggle(data.organisationId);
      usersPage.firstNamesColumnInCard(data.organisationId).should('contain', 'UserOrg0');

      usersPage.clickCardToggle(subOrg1_1.id);
      usersPage.firstNamesColumnInCard(subOrg1_1.id).should('contain', 'UserOrg1_1');

      usersPage.cardWithId(subOrg2.id).should('not.exist');

      usersPage.addUser(subOrg1.id);
      usersPage.errorPopUp.should('contain', 'User is not authorized to perform this operation');
    });
  });
});
