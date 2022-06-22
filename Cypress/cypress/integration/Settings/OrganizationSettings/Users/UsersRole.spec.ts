import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import RolesPage from '../../../../pageobjects/Settings/Organisation/Users/RolesPage';
import {
  createUserQuery,
  createOrganisationQuery,
  createSubOrganisationQuery,
  OrganisationQuery,
  setRoleQuery,
} from '../../../helpers/OrganisationHelper';

describe('Users test', () => {
  // before(() => {
  //   cy.readFile('cypress/fixtures/init_infos.json').then(data => {
  //     const childOrganisationName1: string = `child_1_of_${data.organisationName}`;
  //     const chilsOragnisationName2: string = `child_2_of_${data.organisationName}`;
  //     const grandchildOrganisationName1: string = `grandchild_1.1_of_${data.organisationName}`;

  //     cy.request({
  //       url: `${Cypress.env('apiDomain')}/v1/users`,
  //       method: 'POST',
  //       headers: { Authorization: data.accessToken },
  //       body: {
  //         first_name: `fn-${Math.random().toString(36).substring(2, 10)}`,
  //         last_name: `ln-${Math.random().toString(36).substring(2, 10)}`,
  //         email: `email.-${Math.random().toString(36).substring(2, 10)}@test.com`,
  //         role: `READER`,
  //         organisation_id: data.organisationId,
  //         community_id: data.organisation_id,
  //       },
  //     });

  //     cy.request({
  //       url: `${Cypress.env('apiDomain')}/v1/organisations`,
  //       method: 'POST',
  //       headers: { Authorization: data.accessToken },
  //       body: {
  //         name: `${childOrganisationName1}`,
  //         // Using faker here isn't such a good idea because of the constraints on the technical name
  //         technical_name: `${
  //           Math.random().toString(36).substring(2, 10) +
  //           Math.random().toString(36).substring(2, 10)
  //         }`,
  //         market_id: '1',
  //         administrator_id: `${data.organisationId}`,
  //       },
  //     }).then(orgResponse => {
  //       const organisationId2 = orgResponse.body.data.id;
  //       cy.request({
  //         url: `${Cypress.env('apiDomain')}/v1/organisations`,
  //         method: 'POST',
  //         headers: { Authorization: data.accessToken },
  //         body: {
  //           name: `${grandchildOrganisationName1}`,
  //           technical_name: `${
  //             Math.random().toString(36).substring(2, 10) +
  //             Math.random().toString(36).substring(2, 10)
  //           }`,
  //           market_id: '1',
  //           administrator_id: `${organisationId2}`,
  //         },
  //       });
  //     });

  //     cy.request({
  //       url: `${Cypress.env('apiDomain')}/v1/organisations`,
  //       method: 'POST',
  //       headers: { Authorization: data.accessToken },
  //       body: {
  //         name: `${chilsOragnisationName2}`,
  //         technical_name: `${
  //           Math.random().toString(36).substring(2, 10) +
  //           Math.random().toString(36).substring(2, 10)
  //         }`,
  //         market_id: '1',
  //         administrator_id: `${data.organisationId}`,
  //       },
  //     });
  //   });
  // });
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
    RolesPage.goToRolesPage();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it.only('Should edit a user role', () => {
    RolesPage.rolesColumnInCard(subOrg1.id).first();

    RolesPage.userDropDownMenu.first().click();
    RolesPage.clickBtnEditRole();

    cy.get('.ant-drawer-body').within(() => {
      cy.wait(5000);
      RolesPage.clickBtnEditorRole();
      cy.get('.mcs-saveButton')
        .contains('Save')
        .should('be.visible')
        .trigger('mouseover')
        .wait(1000)
        .click()
        .click({ force: true });
    });

    // RolesPage.clickBtnSave();
    RolesPage.rolesColumnInCard(subOrg1.id).first().should('contain', 'EDITOR');
  });

  it('Should delete a user role / verify the inheritance (we cant delete an inherited role in a children organisation, just a edited one or delete it in the parent organisation)', () => {
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

  it.skip('Should add a user role', () => {
    RolesPage.clickBtnAddRole();

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
        const nameUser = `${user.body.data.first_name}` + ' ' + `${user.body.data.last_name}`;
        RolesPage.typeUserSearch(nameUser);
        cy.get('.rc-virtual-list-holder-inner').contains(nameUser).click();
        const organisationName = data.organisationName;
        RolesPage.typeOrganisationWithName(organisationName);
        cy.get('.rc-virtual-list-holder-inner').contains(organisationName).click();
      });
    });

    RolesPage.clickBtnEditorRole();
    RolesPage.clickBtnSave();
  });

  it.skip('Should verify the inheritance', () => {
    RolesPage.rolesColumnInCard(subOrg1.id)
      .first()
      .then($role => {
        const role = $role.text();
        RolesPage.rolesColumnInCard(subOrg1.id).should('contain', role);
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

  it.skip('Should not have a lower role in the children organisation than the parent organisation', () => {
    RolesPage.rolesColumnInCard(subOrg1.id)
      .first()
      .then($role => {
        const role = $role.text();
        RolesPage.rolesColumnInCard(subOrg1.id).should('contain', role);
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
    RolesPage.firstNamesColumnInCard(subOrg1.id)
      .first()
      .then($name => {
        const name = $name.text();
        RolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', name);
        RolesPage.firstNamesColumnInCard(subOrg1_1.id)
          .first()
          .then($nameInChild => {
            const nameInChild = $nameInChild.text();
            RolesPage.firstNamesColumnInCard(subOrg1_1.id).should('contain', nameInChild);
          });
      });

    RolesPage.clickDisplayInheritedRoleToggle();

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
      });
    });
    //RolesPage.rolesColumnInCard(subOrg1.id).first();
    RolesPage.userDropDownMenu.first().click();
    RolesPage.clickCommunityAdminRoleBtn();
    RolesPage.clickBtnSave();
  });

  it('Should Should verifiy that we cant add a Community admin role to user in the children organisation', () => {
    RolesPage.rolesColumnInCard(subOrg1.id).first();

    RolesPage.userDropDownMenu.first().click();
    RolesPage.clickBtnEditRole();
    RolesPage.communityAdminRoleRadioBtn.should('not.exist');
    RolesPage.clickCloseEditBtn();
  });

  it('For a user in the children organisation, try to modify his role in the parent organisation', () => {});

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
        RolesPage.homeIconColumnInCard(data.organisationId);
        RolesPage.homeIcon.should('be.visible');
      });
    });
  });
});

function createUserAndLoginWithIt(organisationId: string, role: string) {
  cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
    const user = await createUserQuery(data.accessToken, organisationId);

    cy.exec(
      `ssh -o StrictHostKeyChecking=no -l ${Cypress.env('userName')} ${Cypress.env(
        'virtualPlatformName',
      )}.mics-sandbox.com <<eof
      curl -k -H \'Authorization: annie lennox\' -H \'Content-Type: application/json\' -X GET http://10.0.1.3:9110/private/v1/users/${
        user.id
      }/password_tokens
eof`,
    ).then(async result => {
      let jsonData = result.stdout.split(/\r?\n/);
      let json = JSON.parse(jsonData[jsonData.length - 1]);
      let token = json.data[0].token;
      console.log(token);

      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/authentication/set_password`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          email: user.email,
          token: token,
          password: 'test-P455',
        },
      });

      await setRoleQuery(data.accessToken, user.id, organisationId, role);

      cy.login(user.email, 'test-P455');
    });
  });
}
