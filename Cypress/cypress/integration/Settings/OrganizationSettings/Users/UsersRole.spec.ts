import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import RolesPage from '../../../../pageobjects/Settings/Organisation/Users/RolesPage';
import { createSubOrganisationQuery, OrganisationQuery } from '../../../helpers/OrganisationHelper';
import { createUserQuery } from '../../../helpers/UserHelper';

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
    new RolesPage().goToPage();
    cy.wait(20000);
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should add a user role', () => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const rolesPage = new RolesPage();
      const fn = `fn-${Math.random().toString(36).substring(2, 10)}`;
      const ln = `ln-${Math.random().toString(36).substring(2, 10)}`;
      createUserQuery(data.accessToken, subOrg1.id, fn, ln);
      rolesPage.clickBtnAddRole();
      const nameUser = `${fn}` + ' ' + `${ln}`;
      rolesPage.roleInformationPage.typeUserSearch(nameUser);
      rolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
      const organisationName = `child_1_of_${data.organisationName}`;
      rolesPage.roleInformationPage.typeOrganisationWithName(organisationName);
      rolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      rolesPage.roleInformationPage.clickBtnSave();
    });
  });

  it('Should edit a user role', () => {
    const rolesPage = new RolesPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      const fn = `fn-${Math.random().toString(36).substring(2, 10)}`;
      const ln = `ln-${Math.random().toString(36).substring(2, 10)}`;
      createUserQuery(data.accessToken, subOrg1.id, fn, ln);
      rolesPage.clickBtnAddRole();
      const nameUser = `${fn}` + ' ' + `${ln}`;
      rolesPage.roleInformationPage.typeUserSearch(nameUser);
      rolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
      const organisationName = `child_1_of_${data.organisationName}`;
      rolesPage.roleInformationPage.typeOrganisationWithName(organisationName);
      rolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      rolesPage.roleInformationPage.clickBtnEditorRole();
      rolesPage.roleInformationPage.clickBtnSave();
    });
    cy.wait(20000);
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage.rolesColumnInCard(subOrg1.id).first();

    rolesPage.userDropDownMenu.first().click();
    rolesPage.clickBtnEditRole();

    rolesPage.pageEdit.within(() => {
      rolesPage.roleInformationPage.clickBtnEditorRole();
      rolesPage.roleInformationPage.clickBtnSave();
    });

    rolesPage.rolesColumnInCard(subOrg1.id).first().should('contain', 'EDITOR');
  });

  it('Should delete a user role / verify the inheritance (we cant delete an inherited role in a children organisation, just a edited one or delete it in the parent organisation)', () => {
    const rolesPage = new RolesPage();
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage
      .emailsColumnInCard(subOrg1.id)
      .first()
      .then($email => {
        const email = $email.text();
        rolesPage.userDropDownMenu.first().click();
        rolesPage.clickBtnDeleteRole();
        rolesPage.confirmDeletePopUp.clickBtnOK();
        cy.wait(500);
        rolesPage.confirmDeletePopUp.popUp.should('not.exist');
        rolesPage.emailsColumnInCard(subOrg1.id).contains(email).should('not.exist');
      });
  });

  it('Should verify the inheritance', () => {
    const rolesPage = new RolesPage();
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage
      .rolesColumnInCard(subOrg1.id)
      .first()
      .then($role => {
        const role = $role.text();
        rolesPage.rolesColumnInCard(subOrg1.id).should('contain', role);
        rolesPage.clickCardToggle(subOrg1_1.id);
        rolesPage
          .rolesColumnInCard(subOrg1_1.id)
          .first()
          .then($roleInChild => {
            const roleInChild = $roleInChild.text();

            rolesPage.rolesColumnInCard(subOrg1_1.id).should('contain', roleInChild);
            rolesPage.rolesColumnInCard(subOrg1_1.id).should('contain', role);
            cy.get('.mcs-userRoleList_inherited').contains('Inherited').should('be.visible');
          });
      });
  });

  it('Should not have a lower role in the children organisation than the parent organisation', () => {
    const rolesPage = new RolesPage();
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage
      .rolesColumnInCard(subOrg1.id)
      .first()
      .then($role => {
        const role = $role.text();
        rolesPage.rolesColumnInCard(subOrg1.id).should('contain', role);
        rolesPage.clickCardToggle(subOrg1_1.id);
        rolesPage
          .rolesColumnInCard(subOrg1_1.id)
          .first()
          .then($roleInChild => {
            const roleInChild = $roleInChild.text();
            rolesPage.userDropDownMenu.first().click();
            rolesPage.clickBtnEditRole();
            rolesPage.roleInformationPage.clickBtnEditorRole();
            rolesPage.roleInformationPage.clickBtnSave();
            rolesPage.rolesColumnInCard(subOrg1_1.id).should('contain', roleInChild);
          });
      });
  });

  it('Display inherited role (test the edited role)', () => {
    const rolesPage = new RolesPage();
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage
      .firstNamesColumnInCard(subOrg1.id)
      .first()
      .then($name => {
        const name = $name.text();
        rolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', name);
        rolesPage.clickCardToggle(subOrg1_1.id);
        rolesPage
          .firstNamesColumnInCard(subOrg1_1.id)
          .first()
          .then($nameInChild => {
            const nameInChild = $nameInChild.text();
            rolesPage.firstNamesColumnInCard(subOrg1_1.id).should('contain', nameInChild);
          });
      });

    rolesPage.clickDisplayInheritedRoleToggle();
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage
      .firstNamesColumnInCard(subOrg1.id)
      .first()
      .then($name => {
        const name = $name.text();

        rolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', name);
        rolesPage.clickCardToggle(subOrg1_1.id).should('not.contain', name);
      });
  });

  it('Should verifiy that we can add a Community admin role to user in the parent organisation', () => {
    const rolesPage = new RolesPage();
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
        rolesPage.usersPage.click();
        rolesPage.rolesPage.click();

        rolesPage.clickBtnAddRole();

        const nameUser = `${user.body.data.first_name}` + ' ' + `${user.body.data.last_name}`;
        rolesPage.roleInformationPage.typeUserSearch(nameUser);
        rolesPage.firstElement.contains(new RegExp('^' + nameUser + '$', 'g')).click();
        const organisationName = data.organisationName;
        rolesPage.roleInformationPage.typeOrganisationWithName(organisationName);
        rolesPage.firstElement.contains(new RegExp('^' + organisationName + '$', 'g')).click();
      });
    });

    rolesPage.roleInformationPage.clickCommunityAdminRoleBtn();
    rolesPage.roleInformationPage.clickBtnSave();
  });

  it('Should verifiy that we cant add a Community admin role to user in the children organisation', () => {
    const rolesPage = new RolesPage();
    rolesPage.clickCardToggle(subOrg1.id);
    rolesPage.rolesColumnInCard(subOrg1.id).first();

    rolesPage.userDropDownMenu.first().click();
    rolesPage.clickBtnEditRole();
    rolesPage.roleInformationPage.communityAdminRoleRadioBtn.should('not.exist');
    rolesPage.roleInformationPage.clickCloseEditBtn();
  });

  it('Should verify that the home icon exist the organisation where the user was created', () => {
    const rolesPage = new RolesPage();
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
        rolesPage.clickCardToggle(subOrg1.id);
        rolesPage.homeIconColumnInCard(subOrg1.id);
        rolesPage.homeIcon.should('be.visible');
      });
    });
  });
});
