import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import UsersPage from '../../../../pageobjects/Settings/Organisation/Users/UsersPage';
import faker from 'faker';
import {
  createOrganisationQuery,
  createSubOrganisationQuery,
  OrganisationQuery,
} from '../../../helpers/OrganisationHelper';
import { createUserQuery, createUserAndLoginWithIt } from '../../../helpers/UserHelper';

describe('Users Rights test', () => {
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
    cy.intercept('GET', '**/users**').as('getUsers');
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
      usersPage.userInformationPage.typeFirstName();
      usersPage.userInformationPage.typeLastName();
      usersPage.userInformationPage.typeEmail();
      usersPage.userInformationPage.clickOrganisationField();
      usersPage.userInformationPage.organisationSelectionDropDown.should('have.length', 4);
      usersPage.userInformationPage.typeOrganisation(newOrganisationName);
      cy.wait(100);
      usersPage.userInformationPage.organisationSelectionDropDown.should(
        'not.contain',
        newOrganisationName,
      );
    });
  });

  it('Organisation admin should be able to add a user to its organisation and its childs organisations but not above', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      await createUserAndLoginWithIt(subOrg1.id, 'ORGANISATION_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(subOrg1.id);
      usersPage.goToPage();
      cy.wait('@getUsers', { timeout: 120000 });

      usersPage.cardWithId(subOrg1.id).should('exist');

      usersPage.addUserAndItsRole(subOrg1.name, undefined, new UsersPage().email);
      cy.wait('@getUsers', { timeout: 120000 });
      usersPage.addUserAndItsRole(subOrg1_1.name, undefined, new UsersPage().email);
      cy.wait('@getUsers', { timeout: 120000 });

      usersPage.clickBtnAddUser();
      usersPage.userInformationPage.clickOrganisationField();
      usersPage.userInformationPage.organisationSelectionDropDown
        .should('not.contain', new RegExp('^' + subOrg2.name + '$', 'g'))
        .and('not.contain', new RegExp('^' + data.organisationName + '$', 'g'));
    });
  });

  it('Reader should only be able to view users in its organisation branch', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      await createUserQuery(data.accessToken, data.organisationId, 'UserOrg0');
      await createUserQuery(data.accessToken, subOrg1.id, 'UserOrg1');
      await createUserQuery(data.accessToken, subOrg1_1.id, 'UserOrg1_1');

      await createUserAndLoginWithIt(subOrg1.id, 'READER');
      HeaderMenu.switchOrgWithCreatedUser(subOrg1.id);
      usersPage.goToPage();

      usersPage.firstNamesColumnInCard(subOrg1.id).should('contain', 'UserOrg1');

      usersPage.clickCardToggle(subOrg1_1.id);
      usersPage.firstNamesColumnInCard(subOrg1_1.id).should('contain', 'UserOrg1_1');

      usersPage.cardWithId(data.organisationId).should('not.exist');
      usersPage.cardWithId(subOrg2.id).should('not.exist');

      usersPage.addUser(subOrg1.name);
      usersPage.errorPopUp.should('contain', 'User is not authorized to perform this operation');
    });
  });
});
