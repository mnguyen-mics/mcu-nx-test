import UsersPage from '../../../../pageobjects/Settings/Organisation/Users/UsersPage';
import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import RolesPage from '../../../../pageobjects/Settings/Organisation/Users/RolesPage';
import {
  createSubOrganisationQuery,
  OrganisationQuery,
  UserQuery,
} from '../../../helpers/OrganisationHelper';
import { createUserQuery, setRoleQuery } from '../../../helpers/UserHelper';

describe('Roles test', () => {
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

      await createUserAndAddRole(data.accessToken, subOrg1.id);
    });
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
    window.localStorage.setItem('features', '["new-userSettings"]');
    cy.logout();
    cy.visit('/');
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      HeaderMenu.switchOrg(data.organisationName);
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  async function createUserAndAddRole(
    accessToken: string,
    orgId: string = subOrg1.id,
  ): Promise<UserQuery> {
    const user = await createUserQuery(accessToken, orgId);
    await setRoleQuery(accessToken, user.id, orgId, 'EDITOR');
    return user;
  }

  it('Should add a user role in the top organisation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const rolesPage = new RolesPage();
      const usersPage = new UsersPage();
      usersPage.goToPage();
      usersPage.addUser(subOrg1.name);
      // Close form then reopen it to check https://mediarithmics.atlassian.net/browse/MICS-13992
      cy.wait(1000);
      rolesPage.roleInformationPage.clickCloseEditBtn();
      rolesPage.clickBtnAddRole();
      const nameUser = `${usersPage.firstName}` + ' ' + `${usersPage.lastName}`;
      rolesPage.roleInformationPage.typeUserSearch(nameUser);
      rolesPage.roleInformationPage.userSelectionDropDown.contains(nameUser).click();
      rolesPage.roleInformationPage.typeOrganisationWithName(data.organisationName);
      rolesPage.roleInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + data.organisationName + '$', 'g'))
        .click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      cy.intercept('**/users**').as('getUsers');
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait('@getUsers');
      rolesPage
        .firstNamesColumnInCard(data.organisationId)
        .contains(usersPage.firstName)
        .parent()
        .should('contain', 'EDITOR');
    });
  });

  it('Should add a user role in a child organisation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const rolesPage = new RolesPage();
      const user = await createUserQuery(data.accessToken, subOrg1.id);
      rolesPage.goToPage();
      rolesPage.clickBtnAddRole();
      const nameUser = `${user.first_name}` + ' ' + `${user.last_name}`;
      rolesPage.roleInformationPage.typeUserSearch(nameUser);
      rolesPage.roleInformationPage.userSelectionDropDown.contains(nameUser).click();
      rolesPage.roleInformationPage.typeOrganisationWithName(subOrg1.name);
      rolesPage.roleInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + subOrg1.name + '$', 'g'))
        .click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      cy.intercept('**/users**').as('getUsers');
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait('@getUsers');
      rolesPage.clickCardToggle(subOrg1.id);
      rolesPage
        .firstNamesColumnInCard(subOrg1.id)
        .contains(user.first_name)
        .parent()
        .should('contain', 'EDITOR');
    });
  });

  it('Should edit a user role', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const user = await createUserAndAddRole(data.accessToken);
      rolesPage.goToPage();
      rolesPage.clickCardToggle(subOrg1.id);
      rolesPage
        .firstNamesColumnInCard(subOrg1.id)
        .contains(user.first_name)
        .parent()
        .within(() => {
          rolesPage.clickUserDropDownMenu();
        });
      rolesPage.clickBtnEditRole();
      rolesPage.roleInformationPage.clickBtnOrganisationAdminRole();
      cy.intercept('**/users**').as('getUsers');
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait('@getUsers');
      rolesPage
        .firstNamesColumnInCard(subOrg1.id)
        .contains(user.first_name)
        .parent()
        .should('contain', 'ORGANISATION_ADMIN');
    });
  });

  it('Should delete a user role : delete it in the parent organisation)', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const user = await createUserAndAddRole(data.accessToken);
      rolesPage.goToPage();
      rolesPage.clickCardToggle(subOrg1.id);
      rolesPage
        .firstNamesColumnInCard(subOrg1.id)
        .contains(user.first_name)
        .parent()
        .within(() => {
          rolesPage.clickUserDropDownMenu();
        });
      rolesPage.clickBtnDeleteRole();
      rolesPage.confirmDeletePopUp.clickBtnOK();
      cy.wait(500);
      rolesPage.emailsColumnInCard(subOrg1.id).contains(user.email).should('not.exist');
    });
  });

  it('Should not delete a user role : we cant delete an inherited role in a children organisation', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const user = await createUserAndAddRole(data.accessToken);
      rolesPage.goToPage();
      rolesPage.clickCardToggle(subOrg1_1.id);
      rolesPage
        .firstNamesColumnInCard(subOrg1_1.id)
        .contains(user.first_name)
        .parent()
        .within(() => {
          rolesPage.clickUserDropDownMenu();
        });
      rolesPage.btnDeleteRole.invoke('attr', 'aria-disabled').should('eq', 'true');
    });
  });

  it('Should delete a user role : delete an edited role', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const user = await createUserAndAddRole(data.accessToken);
      await setRoleQuery(data.accessToken, user.id, subOrg1_1.id, 'ORGANISATION_ADMIN');
      rolesPage.goToPage();
      rolesPage.clickCardToggle(subOrg1_1.id);
      rolesPage
        .firstNamesColumnInCard(subOrg1_1.id)
        .contains(user.first_name)
        .parent()
        .within(() => {
          rolesPage.clickUserDropDownMenu();
        });
      rolesPage.clickBtnDeleteRole();
      rolesPage.confirmDeletePopUp.clickBtnOK();
      cy.wait(500);
      rolesPage
        .emailsColumnInCard(subOrg1_1.id)
        .contains(user.email)
        .parent()
        .should('contain', 'EDITOR')
        .and('contain', 'Inherited');
    });
  });
});
