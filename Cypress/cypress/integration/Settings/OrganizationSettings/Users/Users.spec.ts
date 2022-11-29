import faker from 'faker';
import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import UsersPage from '../../../../pageobjects/Settings/Organisation/Users/UsersPage';
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
      await createUserQuery(data.accessToken, data.organisationId);
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
      cy.intercept('GET', `**/communities/${data.organisationId}/users**`).as('getUsers');
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should add a new user in the top organisation', () => {
    const usersPage = new UsersPage();
    const rolesPage = new RolesPage();
    usersPage.goToPage();
    cy.wait('@getUsers');

    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      usersPage.clickBtnAddUser();
      usersPage.userInformationPage.typeFirstName();
      usersPage.userInformationPage.typeLastName();
      usersPage.userInformationPage.typeEmail();
      usersPage.userInformationPage.typeOrganisation(data.organisationName);
      usersPage.userInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + data.organisationName + '$', 'g'))
        .click();
      usersPage.userInformationPage.clickBtnSaveUser();
      cy.wait('@getUsers');

      cy.wait('@getUsers');
      rolesPage.roleInformationPage.userSearchField
        .should('be.disabled')
        .and('have.value', `${usersPage.firstName} ${usersPage.lastName}`);
      rolesPage.roleInformationPage.organisationDropDown.should(
        'have.value',
        data.organisationName,
      );
      rolesPage.roleInformationPage.readerRoleRadioBtn.find('input').should('be.checked');
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait('@getUsers');
      rolesPage.firstNamesColumnInCard(data.organisationId).should('contain', usersPage.firstName);
      rolesPage
        .firstNamesColumnInCard(data.organisationId)
        .contains(usersPage.firstName)
        .parent()
        .should('contain', usersPage.lastName)
        .and('contain', usersPage.email)
        .and('contain', 'READER');

      rolesPage.usersPage.click();
      cy.wait('@getUsers');

      usersPage.idsHeaderInCard(data.organisationId).click();

      usersPage
        .firstNamesColumnInCard(data.organisationId)
        .last()
        .should('contain', usersPage.firstName);
      usersPage
        .lastNamesColumnInCard(data.organisationId)
        .last()
        .should('contain', usersPage.lastName);
      usersPage.emailsColumnInCard(data.organisationId).last().should('contain', usersPage.email);
    });
  });

  it('Should add a new user in the top organisation and role in sub organisation', () => {
    const usersPage = new UsersPage();
    const rolesPage = new RolesPage();
    usersPage.goToPage();
    cy.wait('@getUsers');

    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      usersPage.clickBtnAddUser();
      usersPage.userInformationPage.typeFirstName();
      usersPage.userInformationPage.typeLastName();
      usersPage.userInformationPage.typeEmail();
      usersPage.userInformationPage.typeOrganisation(data.organisationName);
      usersPage.userInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + data.organisationName + '$', 'g'))
        .click();
      usersPage.userInformationPage.clickBtnSaveUser();
      cy.wait('@getUsers');

      cy.wait('@getUsers');
      rolesPage.roleInformationPage.userSearchField
        .should('be.disabled')
        .and('have.value', `${usersPage.firstName} ${usersPage.lastName}`);
      rolesPage.roleInformationPage.organisationDropDown.should(
        'have.value',
        data.organisationName,
      );
      usersPage.userInformationPage.typeOrganisation(subOrg1.name);
      usersPage.userInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + subOrg1.name + '$', 'g'))
        .click();
      rolesPage.roleInformationPage.readerRoleRadioBtn.find('input').should('be.checked');
      rolesPage.roleInformationPage.clickBtnSave();
      cy.wait('@getUsers');
      rolesPage.cardWithId(data.organisationId).should('not.contain', usersPage.firstName);
      rolesPage.clickCardToggle(subOrg1.id);
      rolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', usersPage.firstName);
      rolesPage
        .firstNamesColumnInCard(subOrg1.id)
        .contains(usersPage.firstName)
        .parent()
        .should('contain', usersPage.lastName)
        .and('contain', usersPage.email)
        .and('contain', 'READER');

      rolesPage.usersPage.click();
      cy.wait('@getUsers');

      usersPage.idsHeaderInCard(data.organisationId).click();

      usersPage
        .firstNamesColumnInCard(data.organisationId)
        .last()
        .should('contain', usersPage.firstName);
      usersPage
        .lastNamesColumnInCard(data.organisationId)
        .last()
        .should('contain', usersPage.lastName);
      usersPage.emailsColumnInCard(data.organisationId).last().should('contain', usersPage.email);
      usersPage.clickCardToggle(subOrg1.id);
      usersPage.cardWithId(subOrg1.id).should('not.contain', usersPage.firstName);
    });
  });

  it('Should add a new user in a child organisation', () => {
    const usersPage = new UsersPage();
    const rolesPage = new RolesPage();
    usersPage.goToPage();
    cy.wait('@getUsers');

    usersPage.clickBtnAddUser();
    usersPage.userInformationPage.typeFirstName();
    usersPage.userInformationPage.typeLastName();
    usersPage.userInformationPage.typeEmail();
    usersPage.userInformationPage.typeOrganisation(subOrg1.name);
    usersPage.userInformationPage.organisationSelectionDropDown
      .contains(new RegExp('^' + subOrg1.name + '$', 'g'))
      .click();
    usersPage.userInformationPage.clickBtnSaveUser();
    cy.wait('@getUsers');

    cy.wait('@getUsers');
    rolesPage.roleInformationPage.userSearchField
      .should('be.disabled')
      .and('have.value', `${usersPage.firstName} ${usersPage.lastName}`);
    rolesPage.roleInformationPage.organisationDropDown.should('have.value', subOrg1.name);
    rolesPage.roleInformationPage.readerRoleRadioBtn.find('input').should('be.checked');
    rolesPage.roleInformationPage.clickBtnEditorRole();
    rolesPage.roleInformationPage.clickBtnSave();
    cy.wait('@getUsers');
    rolesPage.firstNamesColumnInCard(subOrg1.id).should('contain', usersPage.firstName);
    rolesPage
      .firstNamesColumnInCard(subOrg1.id)
      .contains(usersPage.firstName)
      .parent()
      .should('contain', usersPage.lastName)
      .and('contain', usersPage.email)
      .and('contain', 'EDITOR');
    rolesPage.usersPage.click();
    cy.wait('@getUsers');

    usersPage.clickCardToggle(subOrg1.id);
    usersPage.idsHeaderInCard(subOrg1.id).click();

    usersPage.firstNamesColumnInCard(subOrg1.id).last().should('contain', usersPage.firstName);
    usersPage.lastNamesColumnInCard(subOrg1.id).last().should('contain', usersPage.lastName);
    usersPage.emailsColumnInCard(subOrg1.id).last().should('contain', usersPage.email);
  });

  it('Should not add the new user (email not valid)', () => {
    const usersPage = new UsersPage();
    usersPage.goToPage();

    const email = 'email-not-valid';

    usersPage.clickBtnAddUser();
    usersPage.userInformationPage.typeFirstName();
    usersPage.userInformationPage.typeLastName();
    usersPage.userInformationPage.typeEmail(email);
    usersPage.userInformationPage.typeOrganisation(subOrg1.name);
    usersPage.userInformationPage.organisationSelectionDropDown
      .contains(new RegExp('^' + subOrg1.name + '$', 'g'))
      .click();
    usersPage.userInformationPage.clickBtnSaveUser();

    usersPage.errorPopUp.should('contain', 'Email is invalid');
  });

  it('Should not add the new user (email already exists)', () => {
    const usersPage = new UsersPage();
    usersPage.goToPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      usersPage.clickCardToggle(subOrg1.id);

      usersPage
        .emailsColumnInCard(subOrg1.id)
        .first()
        .then($cellEmail => {
          const email = $cellEmail.text();

          usersPage.clickBtnAddUser();
          usersPage.userInformationPage.typeFirstName();
          usersPage.userInformationPage.typeLastName();
          usersPage.userInformationPage.typeEmail(email);

          usersPage.userInformationPage.typeOrganisation(data.organisationName);
          usersPage.userInformationPage.organisationSelectionDropDown
            .contains(new RegExp('^' + subOrg1.name + '$', 'g'))
            .click();
          usersPage.userInformationPage.clickBtnSaveUser();
          usersPage.errorPopUp.should('contain', 'Email already exists');

          usersPage.errorPopUp.should('not.exist');
          usersPage.userInformationPage.typeOrganisation(data.organisationName);
          usersPage.userInformationPage.organisationSelectionDropDown
            .contains(new RegExp('^' + subOrg2.name + '$', 'g'))
            .click();
          usersPage.userInformationPage.clickBtnSaveUser();
          usersPage.errorPopUp.should('contain', 'Email already exists');
        });
    });
  });

  it('Should edit a user (edit first name, last name)', () => {
    const usersPage = new UsersPage();
    usersPage.goToPage();
    cy.wait('@getUsers');

    usersPage.clickCardToggle(subOrg1.id);
    usersPage.clickIdsHeaderInCard(subOrg1.id);

    usersPage
      .firstNamesColumnInCard(subOrg1.id)
      .first()
      .then($cellFN => {
        usersPage
          .lastNamesColumnInCard(subOrg1.id)
          .first()
          .then($cellLN => {
            const oldFirstName = $cellFN.text();
            const oldLastName = $cellLN.text();

            usersPage.clickFirstUserDropDownMenuCard(subOrg1.id);
            usersPage.clickBtnEditUser();

            usersPage.userInformationPage.typeFirstName();
            usersPage.userInformationPage.typeLastName();
            usersPage.userInformationPage.clickBtnSaveUser();
            cy.wait('@getUsers');
            usersPage.clickIdsHeaderInCard(subOrg1.id);

            usersPage
              .firstNamesColumnInCard(subOrg1.id)
              .first()
              .should('not.contain', oldFirstName);
            usersPage.lastNamesColumnInCard(subOrg1.id).first().should('not.contain', oldLastName);
            usersPage
              .firstNamesColumnInCard(subOrg1.id)
              .first()
              .should('contain', usersPage.firstName);
            usersPage
              .lastNamesColumnInCard(subOrg1.id)
              .first()
              .should('contain', usersPage.lastName);
          });
      });
  });

  it('Should not edit the user (edit email)', () => {
    const usersPage = new UsersPage();
    usersPage.goToPage();

    usersPage.clickCardToggle(subOrg1.id);

    usersPage.clickFirstUserDropDownMenuCard(subOrg1.id);
    usersPage.btnEditUser.click();

    usersPage.userInformationPage.typeEmail();
    usersPage.userInformationPage.btnSaveUser.click();

    usersPage.errorPopUp.should(
      'contain',
      "Can't update the email address, process not implemented yet.",
    );
  });

  it('Should not edit the user (edit organisation)', () => {
    const usersPage = new UsersPage();
    usersPage.goToPage();

    usersPage.clickCardToggle(subOrg1.id);

    usersPage.clickFirstUserDropDownMenuCard(subOrg1.id);
    usersPage.clickBtnEditUser();

    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      usersPage.userInformationPage.typeOrganisation(subOrg1_1.name);
      usersPage.userInformationPage.organisationSelectionDropDown
        .contains(new RegExp('^' + subOrg1_1.name + '$', 'g'))
        .click();
    });

    usersPage.userInformationPage.clickBtnSaveUser();

    usersPage.errorPopUp.should('contain', 'Organisation id and user id are not compatible');
  });

  it('Should delete a User', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      await createUserQuery(data.accessToken, data.organisationId);

      usersPage.goToPage();
      cy.wait('@getUsers');

      usersPage
        .firstNamesColumnInCard(data.organisationId)
        .first()
        .then($cellFN => {
          usersPage
            .lastNamesColumnInCard(data.organisationId)
            .first()
            .then($cellLN => {
              const oldFirstName = $cellFN.text();
              const oldLastName = $cellLN.text();

              usersPage.clickFirstUserDropDownMenuCard(data.organisationId);
              usersPage.clickBtnDeleteUser();
              usersPage.confirmDeletePopUp.clickBtnOK();
              cy.wait('@getUsers');

              usersPage
                .firstNamesColumnInCard(data.organisationId)
                .should('not.contain', oldFirstName);
              usersPage
                .lastNamesColumnInCard(data.organisationId)
                .should('not.contain', oldLastName);
            });
        });
    });
  });

  it('Should filter users', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const fn1 = 'Filter1-' + usersPage.firstName;
      const ln2 = usersPage.lastName + '-Filter2';
      const email3 = 'TestFilter3' + usersPage.email;
      const fn4 = 'filter4-' + usersPage.firstName;

      const user1 = await createUserQuery(data.accessToken, subOrg1.id, fn1);
      const user2 = await createUserQuery(data.accessToken, subOrg2.id, undefined, ln2);
      const user3 = await createUserQuery(
        data.accessToken,
        subOrg1_1.id,
        undefined,
        undefined,
        email3,
      );
      const user4 = await createUserQuery(data.accessToken, data.organisationId, fn4);
      const user5 = await createUserQuery(data.accessToken, subOrg2.id);

      usersPage.goToPage();
      cy.wait('@getUsers');

      usersPage.typeUserFilter('filter');
      cy.wait('@getUsers');

      usersPage.clickCardToggle(subOrg1.id);
      usersPage.clickCardToggle(subOrg1_1.id);
      usersPage.clickCardToggle(subOrg2.id);

      usersPage.firstNamesColumns
        .should('contain', user1.first_name)
        .and('contain', user2.first_name)
        .and('contain', user3.first_name)
        .and('contain', user4.first_name);
      usersPage.firstNamesColumns.should('not.contain', user5.first_name);

      usersPage.userFilter.clear();
      cy.wait('@getUsers');

      usersPage.clickCardToggle(subOrg1.id);
      usersPage.clickCardToggle(subOrg1_1.id);
      usersPage.clickCardToggle(subOrg2.id);

      usersPage.firstNamesColumns
        .should('contain', user1.first_name)
        .and('contain', user2.first_name)
        .and('contain', user3.first_name)
        .and('contain', user4.first_name);
      usersPage.firstNamesColumns.should('contain', user5.first_name);

      usersPage.typeUserFilter('Filter');
      cy.wait('@getUsers');

      usersPage.clickCardToggle(subOrg1.id);
      usersPage.clickCardToggle(subOrg1_1.id);
      usersPage.clickCardToggle(subOrg2.id);

      usersPage.firstNamesColumns
        .should('contain', user1.first_name)
        .and('contain', user2.first_name)
        .and('contain', user3.first_name)
        .and('contain', user4.first_name);
      usersPage.firstNamesColumns.should('not.contain', user5.first_name);
    });
  });

  it('Should sort users', () => {
    const usersPage = new UsersPage();

    cy.readFile('cypress/fixtures/init_infos.json').then(async data => {
      const newOrganisationName: string = faker.random.words(3);
      const newOrg = await createSubOrganisationQuery(
        data.accessToken,
        newOrganisationName,
        data.organisationId,
      );
      await createUserQuery(
        data.accessToken,
        newOrg.id,
        usersPage.firstName.toUpperCase(),
        usersPage.lastName.toUpperCase(),
      );
      await createUserQuery(
        data.accessToken,
        newOrg.id,
        new UsersPage().firstName.toLowerCase(),
        new UsersPage().lastName.toLowerCase(),
      );
      for (let i = 0; i < 3; i++) {
        await createUserQuery(data.accessToken, newOrg.id);
      }

      usersPage.goToPage();
      cy.wait('@getUsers');
      usersPage.clickCardToggle(newOrg.id);

      usersPage.clickIdsHeaderInCard(newOrg.id);
      verifySorting(usersPage.idsColumnInCard(newOrg.id));
      usersPage.clickIdsHeaderInCard(newOrg.id);
      verifySortingReverse(usersPage.idsColumnInCard(newOrg.id));

      usersPage.clickFirstNamesHeaderInCard(newOrg.id);
      verifySorting(usersPage.firstNamesColumnInCard(newOrg.id));
      usersPage.clickFirstNamesHeaderInCard(newOrg.id);
      verifySortingReverse(usersPage.firstNamesColumnInCard(newOrg.id));

      usersPage.clickLastNamesHeaderInCard(newOrg.id);
      verifySorting(usersPage.lastNamesColumnInCard(newOrg.id));
      usersPage.clickLastNamesHeaderInCard(newOrg.id);
      verifySortingReverse(usersPage.lastNamesColumnInCard(newOrg.id));

      usersPage.clickEmailsHeaderInCard(newOrg.id);
      verifySorting(usersPage.emailsColumnInCard(newOrg.id));
      usersPage.clickEmailsHeaderInCard(newOrg.id);
      verifySortingReverse(usersPage.emailsColumnInCard(newOrg.id));
    });
  });

  function verifySorting(column: Cypress.Chainable<JQuery<HTMLElement>>) {
    column.then(items => {
      const users = items.map((index, html) => Cypress.$(html).text().toLowerCase()).get();
      const sortedUsers = users.slice().sort();
      expect(users).to.deep.equal(sortedUsers);
    });
  }

  function verifySortingReverse(column: Cypress.Chainable<JQuery<HTMLElement>>) {
    column.then(items => {
      const users = items.map((index, html) => Cypress.$(html).text().toLowerCase()).get();
      const sortedUsers = users.slice().sort().reverse();
      expect(users).to.deep.equal(sortedUsers);
    });
  }
});
