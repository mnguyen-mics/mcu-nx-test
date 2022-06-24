import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import RolesPage from '../../../../pageobjects/Settings/Organisation/Users/RolesPage';
import {
  createUserQuery,
  createSubOrganisationQuery,
  OrganisationQuery,
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

      await createUserQuery(data.accessToken, subOrg1.id);
      await createUserQuery(data.accessToken, subOrg1.id);
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
    RolesPage.goToPage();
    cy.wait(20000);
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should add a user role', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const fn = `fn-${Math.random().toString(36).substring(2, 10)}`;
      const ln = `ln-${Math.random().toString(36).substring(2, 10)}`;
      createUserQuery(data.accessToken, subOrg1.id, fn, ln);
      RolesPage.clickBtnAddRole();
      const nameUser = `${fn}` + ' ' + `${ln}`;
      RolesPage.typeUserSearch(nameUser);
      RolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
      const organisationName = `child_1_of_${data.organisationName}`;
      RolesPage.typeOrganisationWithName(organisationName);
      RolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      RolesPage.clickBtnEditorRole();
      RolesPage.clickBtnSave();
    });
  });

  it('Should edit a user role', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const fn = `fn-${Math.random().toString(36).substring(2, 10)}`;
      const ln = `ln-${Math.random().toString(36).substring(2, 10)}`;
      createUserQuery(data.accessToken, subOrg1.id, fn, ln);
      RolesPage.clickBtnAddRole();
      const nameUser = `${fn}` + ' ' + `${ln}`;
      RolesPage.typeUserSearch(nameUser);
      RolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
      const organisationName = `child_1_of_${data.organisationName}`;
      RolesPage.typeOrganisationWithName(organisationName);
      RolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      RolesPage.clickBtnEditorRole();
      RolesPage.clickBtnSave();
    });
    cy.wait(20000);
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.rolesColumnInCard(subOrg1.id).first();

    RolesPage.userDropDownMenu.first().click();
    RolesPage.clickBtnEditRole();

    RolesPage.pageEdit.within(() => {
      RolesPage.clickBtnEditorRole();
      RolesPage.clickBtnSave();
    });

    RolesPage.rolesColumnInCard(subOrg1.id).first().should('contain', 'EDITOR');
  });

  it('Should delete a user role / verify the inheritance (we cant delete an inherited role in a children organisation, just a edited one or delete it in the parent organisation)', () => {
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.emailsColumnInCard(subOrg1.id)
      .first()
      .then($email => {
        const email = $email.text();
        RolesPage.userDropDownMenu.first().click();
        RolesPage.clickBtnDeleteRole();
        RolesPage.clickOKOnComfirmDeletePopUp();
        cy.wait(500);
        RolesPage.confirmDeletePopUp.should('not.exist');
        RolesPage.emailsColumnInCard(subOrg1.id).contains(email).should('not.exist');
      });
  });

  it('Should verify the inheritance', () => {
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.rolesColumnInCard(subOrg1.id)
      .first()
      .then($role => {
        const role = $role.text();
        RolesPage.rolesColumnInCard(subOrg1.id).should('contain', role);
        RolesPage.clickCardToggle(subOrg1_1.id);
        RolesPage.rolesColumnInCard(subOrg1_1.id)
          .first()
          .then($roleInChild => {
            const roleInChild = $roleInChild.text();

            RolesPage.rolesColumnInCard(subOrg1_1.id).should('contain', roleInChild);
            RolesPage.rolesColumnInCard(subOrg1_1.id).should('contain', role);
            cy.get('.mcs-userRoleList_inherited').contains('Inherited').should('be.visible');
          });
      });
  });

  it('Should not have a lower role in the children organisation than the parent organisation', () => {
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.rolesColumnInCard(subOrg1.id)
      .first()
      .then($role => {
        const role = $role.text();
        RolesPage.rolesColumnInCard(subOrg1.id).should('contain', role);
        RolesPage.clickCardToggle(subOrg1_1.id);
        RolesPage.rolesColumnInCard(subOrg1_1.id)
          .first()
          .then($roleInChild => {
            const roleInChild = $roleInChild.text();
            RolesPage.userDropDownMenu.first().click();
            RolesPage.clickBtnEditRole();
            RolesPage.clickBtnEditorRole();
            RolesPage.clickBtnSave();
            RolesPage.rolesColumnInCard(subOrg1_1.id).should('contain', roleInChild);
          });
      });
  });

  it('Display inherited role (test the edited role)', () => {
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.firstNamesColumnInCard(subOrg1.id)
      .first()
      .then($name => {
        const name = $name.text();
        RolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', name);
        RolesPage.clickCardToggle(subOrg1_1.id);
        RolesPage.firstNamesColumnInCard(subOrg1_1.id)
          .first()
          .then($nameInChild => {
            const nameInChild = $nameInChild.text();
            RolesPage.firstNamesColumnInCard(subOrg1_1.id).should('contain', nameInChild);
          });
      });

    RolesPage.clickDisplayInheritedRoleToggle();
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.firstNamesColumnInCard(subOrg1.id)
      .first()
      .then($name => {
        const name = $name.text();

        RolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', name);
        RolesPage.clickCardToggle(subOrg1_1.id).should('not.contain', name);
      });
  });

  it('Should verifiy that we can add a Community admin role to user in the parent organisation', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/users`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          first_name: `fn-${Math.random().toString(36).substring(2, 10)}`,
          last_name: `ln-${Math.random().toString(36).substring(2, 10)}`,
          email: `email.-${Math.random().toString(36).substring(2, 10)}@test.com`,

          organisation_id: data.organisationId,
          community_id: data.organisation_id,
        },
      }).then(user => {
        RolesPage.usersPage.click();
        RolesPage.rolesPage.click();

        RolesPage.clickBtnAddRole();

        const nameUser = `${user.body.data.first_name}` + ' ' + `${user.body.data.last_name}`;
        RolesPage.typeUserSearch(nameUser);
        RolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
        const organisationName = data.organisationName;
        RolesPage.typeOrganisationWithName(organisationName);
        RolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      });
    });

    RolesPage.clickCommunityAdminRoleBtn();
    RolesPage.clickBtnSave();
  });

  it('Should Should verifiy that we cant add a Community admin role to user in the children organisation', () => {
    RolesPage.clickCardToggle(subOrg1.id);
    RolesPage.rolesColumnInCard(subOrg1.id).first();

    RolesPage.userDropDownMenu.first().click();
    RolesPage.clickBtnEditRole();
    RolesPage.communityAdminRoleRadioBtn.should('not.exist');
    RolesPage.clickCloseEditBtn();
  });

  it('Should verify that the home icon exist the organisation where the user was created', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/users`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          first_name: `fn-${Math.random().toString(36).substring(2, 10)}`,
          last_name: `ln-${Math.random().toString(36).substring(2, 10)}`,
          email: `email.-${Math.random().toString(36).substring(2, 10)}@test.com`,
          role: 'ORGANISATION_ADMIN',
          organisation_id: data.organisationId,
          community_id: data.organisation_id,
        },
      }).then(organisationId => {
        RolesPage.clickCardToggle(subOrg1.id);
        RolesPage.homeIconColumnInCard(subOrg1.id);
        RolesPage.homeIcon.should('be.visible');
      });
    });
  });
});
