import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import RolesPage from '../../../../pageobjects/Settings/Organisation/Users/RolesPage';
import faker from 'faker';
import OrganisationMenu from '../../../../pageobjects/Settings/Organisation/OrganisationMenu';
import {
  createOrganisationQuery,
  createSubOrganisationQuery,
  OrganisationQuery,
} from '../../../helpers/OrganisationHelper';
import { createUserQuery, createUserAndLoginWithIt } from '../../../helpers/UserHelper';

describe('Roles rights test', () => {
  let subOrg1: OrganisationQuery;

  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const organisationName1: string = `child_1_of_${data.organisationName}`;

      subOrg1 = await createSubOrganisationQuery(
        data.accessToken,
        organisationName1,
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
      const newOrganisationName: string = faker.random.words(3);
      console.log(newOrganisationName);
      await createOrganisationQuery(data.accessToken, newOrganisationName);

      await createUserAndLoginWithIt(data.organisationId, 'READER');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      HeaderMenu.clickSettingsIcon();
      OrganisationMenu.clickUsers();
      cy.get('.ant-select-selection-item').click();
      cy.get('.ant-select-dropdown-placement-bottomLeft').should('not.contain', 'Roles');
    });
  });

  it('Should not have access to the users role (EDITOR)', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const newOrganisationName: string = faker.random.words(3);
      console.log(newOrganisationName);
      await createOrganisationQuery(data.accessToken, newOrganisationName);

      await createUserAndLoginWithIt(data.organisationId, 'EDITOR');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      HeaderMenu.clickSettingsIcon();
      OrganisationMenu.clickUsers();
      cy.get('.ant-select-selection-item').click();
      cy.get('.ant-select-dropdown-placement-bottomLeft').should('not.contain', 'Roles');
    });
  });

  it('Should have access to the users role (COMMUNITY_ADMIN)', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const newOrganisationName: string = faker.random.words(3);
      console.log(newOrganisationName);
      await createOrganisationQuery(data.accessToken, newOrganisationName);

      await createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      rolesPage.goToPage();
    });
  });

  it('Should have access to the users role (ORGANISATION_ADMIN)', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const newOrganisationName: string = faker.random.words(3);
      console.log(newOrganisationName);
      await createOrganisationQuery(data.accessToken, newOrganisationName);

      await createUserAndLoginWithIt(data.organisationId, 'ORGANISATION_ADMIN');
      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);

      HeaderMenu.clickSettingsIcon();
      OrganisationMenu.clickUsers();
      cy.get('.ant-select-selection-item').click();
      cy.get('.ant-select-dropdown-placement-bottomLeft').should('not.contain', 'Roles');
    });
  });

  it('Community admin can add role to an other user in its childs organisations and edit it', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const fn = `fn-${Math.random().toString(36).substring(2, 10)}`;
      const ln = `ln-${Math.random().toString(36).substring(2, 10)}`;
      await createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      await createUserQuery(data.accessToken, subOrg1.id, fn, ln);

      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);
      rolesPage.goToPage();
      rolesPage.usersPage.click();
      rolesPage.rolesPage.click();
      cy.wait(20000);
      rolesPage.clickBtnAddRole();
      const nameUser = `${fn}` + ' ' + `${ln}`;
      cy.get('#rc_select_1').type(nameUser);
      rolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
      const organisationName = `child_1_of_${data.organisationName}`;
      cy.get('#rc_select_2').type(organisationName);
      rolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait(15000);
      rolesPage.clickCardToggle(subOrg1.id);
      rolesPage.rolesColumnInCard(subOrg1.id).should('contain', 'EDITOR');
      rolesPage.clickCardToggle(subOrg1.id);
      cy.get(
        `#mcs-foldable-card-${subOrg1.id} > .ant-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box > :nth-child(1)`,
      )
        .contains(fn)
        .parent()
        .find('.mcs-chevron')
        .click();
      rolesPage.clickBtnEditRole();
      rolesPage.pageEdit.within(() => {
        rolesPage.roleInformationPage.clickBtnReaderRole();
        rolesPage.roleInformationPage.clickBtnSave();
      });
      cy.wait(15000);
      rolesPage.clickCardToggle(subOrg1.id);
      rolesPage.rolesColumnInCard(subOrg1.id).should('contain', 'READER');
    });
  });

  it('Community admin can add role to an other user in its organisation and edit it', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const fn = `fn-${Math.random().toString(36).substring(2, 10)}`;
      const ln = `ln-${Math.random().toString(36).substring(2, 10)}`;
      await createUserAndLoginWithIt(data.organisationId, 'COMMUNITY_ADMIN');
      await createUserQuery(data.accessToken, data.organisationId, fn, ln);

      HeaderMenu.switchOrgWithCreatedUser(data.organisationId);
      rolesPage.goToPage();
      cy.wait(20000);
      rolesPage.clickBtnAddRole();
      const nameUser = `${fn}` + ' ' + `${ln}`;
      cy.get('#rc_select_1').type(nameUser);
      rolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
      const organisationName = `${data.organisationName}`;
      cy.get('#rc_select_2').type(organisationName);
      rolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait(15000);
      rolesPage.clickCardToggle(data.organisationId);
      rolesPage.rolesColumnInCard(data.organisationId).should('contain', 'EDITOR');
      rolesPage.clickCardToggle(data.organisationId);
      cy.get(
        `#mcs-foldable-card-${data.organisationId} > .ant-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box > :nth-child(1)`,
      )
        .contains(fn)
        .parent()
        .find('.mcs-chevron')
        .click();
      rolesPage.clickBtnEditRole();
      rolesPage.pageEdit.within(() => {
        rolesPage.roleInformationPage.clickBtnReaderRole();
        rolesPage.roleInformationPage.clickBtnSave();
      });
      cy.wait(15000);
      rolesPage.clickCardToggle(data.organisationId);
      rolesPage.rolesColumnInCard(data.organisationId).should('contain', 'READER');
    });
  });
});
