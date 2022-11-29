import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import RolesPage from '../../../../pageobjects/Settings/Organisation/Users/RolesPage';
import { createSubOrganisationQuery, OrganisationQuery } from '../../../helpers/OrganisationHelper';
import {
  createUserQuery,
  createUserAndLoginWithIt,
  setRoleQuery,
} from '../../../helpers/UserHelper';
import UsersPage from '../../../../pageobjects/Settings/Organisation/Users/UsersPage';

describe('Roles rights test', () => {
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

      await createUserQuery(data.accessToken, subOrg1.id);
      await createUserQuery(data.accessToken, subOrg1.id);
    });
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();

    window.localStorage.setItem('features', '["new-userSettings"]');
    cy.logout();
    cy.visit('/');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should not have access to the users role (READER)', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const usersPage = new UsersPage();
      const rolesPage = new RolesPage();
      await createUserAndLoginWithIt(data.organisationId, 'READER');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      usersPage.goToPage();
      rolesPage.usersPage.should('exist');
      rolesPage.rolesPage.should('not.exist');
    });
  });

  it('Should not have access to the users role (EDITOR)', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const usersPage = new UsersPage();
      const rolesPage = new RolesPage();
      await createUserAndLoginWithIt(data.organisationId, 'EDITOR');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      usersPage.goToPage();
      rolesPage.usersPage.should('exist');
      rolesPage.rolesPage.should('not.exist');
    });
  });

  it('Should have access to the users role (COMMUNITY_ADMIN)', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      await createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      rolesPage.goToPage();
      rolesPage.cardWithId(data.organisationId).should('contain', 'COMMUNITY_ADMIN');
      rolesPage.cardWithId(subOrg1.id).should('exist');
      rolesPage.cardWithId(subOrg1_1.id).should('exist');
      rolesPage.cardWithId(data.organisationId).should('exist');
      rolesPage.cardWithId(subOrg2.id).should('exist');
    });
  });

  it('Should have access to the users roles in its organisation and childs organisations (ORGANISATION_ADMIN)', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      //Create user in parent organisation to check https://mediarithmics.atlassian.net/browse/MICS-13993
      const user = await createUserQuery(data.accessToken, data.organisationId, 'Test');
      await setRoleQuery(data.accessToken, user.id, data.organisationId, 'COMMUNITY_ADMIN');

      await createUserAndLoginWithIt(subOrg1.id, 'ORGANISATION_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(subOrg1.id);
      rolesPage.goToPage();
      rolesPage.cardWithId(subOrg1.id).should('contain', 'ORGANISATION_ADMIN');
      rolesPage.cardWithId(subOrg1.id).should('exist');
      rolesPage.cardWithId(subOrg1_1.id).should('exist');
      rolesPage.cardWithId(data.organisationId).should('not.exist');
      rolesPage.cardWithId(subOrg2.id).should('not.exist');
    });
  });

  it('Community admin can add role to an other user in its childs organisations and edit it', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      addRoleAndEditInOrgOrSubOrg(data.organisationId, subOrg1.id, subOrg1.name);
    });
  });

  it('Community admin can add role to an other user in its organisation and edit it', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      addRoleAndEditInOrgOrSubOrg(data.organisationId, data.organisationId, data.organisationName);
    });
  });

  it('Organisation admin can add role to an other user in its childs organisations and edit it', () => {
    createUserAndLoginWithIt(subOrg1.id, 'ORGANISATION_ADMIN');
    addRoleAndEditInOrgOrSubOrg(subOrg1.id, subOrg1_1.id, subOrg1_1.name);
  });

  it('Organisation admin can add role to an other user in its organisation and edit it', () => {
    createUserAndLoginWithIt(subOrg1.id, 'ORGANISATION_ADMIN');
    addRoleAndEditInOrgOrSubOrg(subOrg1.id, subOrg1.id, subOrg1.name);
  });

  function addRoleAndEditInOrgOrSubOrg(
    orgAdmin_id: string,
    orgUser_id: string,
    orgUser_name: string,
  ) {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const user = await createUserQuery(data.accessToken, orgUser_id);

      HeaderMenu.switchOrgWithCreatedUser(orgAdmin_id);
      rolesPage.goToPage();
      rolesPage.clickBtnAddRole();
      const nameUser = `${user.first_name}` + ' ' + `${user.last_name}`;
      rolesPage.roleInformationPage.typeUserSearch(nameUser);
      rolesPage.roleInformationPage.userSelectionDropDown.contains(nameUser).click();
      rolesPage.roleInformationPage.typeOrganisationWithName(orgUser_name);
      rolesPage.roleInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + orgUser_name + '$', 'g'))
        .click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      rolesPage.roleInformationPage.clickBtnSave();

      cy.wait(1000);
      rolesPage.clickCardToggle(orgUser_id);
      rolesPage.cardWithId(orgUser_id).within(() => {
        cy.contains(user.first_name).parent().should('contain', 'EDITOR');
      });
      rolesPage.clickCardToggle(orgUser_id);
      rolesPage
        .firstNamesColumnInCard(orgUser_id)
        .contains(user.first_name)
        .parent()
        .within(() => {
          rolesPage.clickUserDropDownMenu();
        });
      rolesPage.clickBtnEditRole();
      rolesPage.roleInformationPage.clickBtnReaderRole();
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait(1000);
      rolesPage.clickCardToggle(orgUser_id);
      rolesPage.cardWithId(orgUser_id).within(() => {
        cy.contains(user.first_name).parent().should('contain', 'READER');
      });
    });
  }
});
