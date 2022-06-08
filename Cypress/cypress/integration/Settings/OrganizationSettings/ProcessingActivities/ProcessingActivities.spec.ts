import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import ProcessingActivitiesPage from '../../../../pageobjects/Settings/Organisation/ProcessingActivitiesPage';

describe('This test should test the settingsMainMenu functions', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/');
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      HeaderMenu.switchOrg(data.organisationName);
    });

    ProcessingActivitiesPage.goToProcessingActivitiesPage();
  });

  it('Should create a new data processing (Consent) without technicalName', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickConsent();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.contains(name);
    cy.contains(purpose);
    cy.contains('CONSENT');
  });

  it('Should create a new data processing (Consent) with technicalName', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    const technichalName = `technichalName-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickConsent();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnAdvancedInformation();
    ProcessingActivitiesPage.typeProcessingActivitiesTechnicalName(technichalName);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.contains(name);
    cy.contains(purpose);
    cy.contains('CONSENT');
    cy.contains(technichalName);
  });

  it('Should create a new data processing (PublicInterestOrExerciseOfOfficialAuthority) without technicalName', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickPublicInterestOrExerciseOfOfficialAuthority();
    ProcessingActivitiesPage.legalBasisField
      .invoke('attr', 'value')
      .should('eq', 'PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.contains(name);
    cy.contains(purpose);
    cy.contains('PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY');
  });

  it('Should create a two new data processing (LegitimateInterest) with the same name and purpose', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickLegalObligation();
    ProcessingActivitiesPage.legalBasisField
      .invoke('attr', 'value')
      .should('eq', 'LEGAL_OBLIGATION');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickLegalObligation();
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.get('.ant-table-row > :nth-child(2)')
      .filter((index, elt) => {
        return elt.innerText.includes(name);
      })
      .should('have.length', 2);
    // cy.get('.ant-table-row > :nth-child(2)').eq(-2).then(($txt1) => {
    //   const txt1 = $txt1.text();
    //   cy.get('.ant-table-row > :nth-child(2)').eq(-1).invoke('text').should('eq', txt1);
    // })
  });

  it('Should edit a data processing', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    const name_ed = `name_ed-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickConsent();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    ProcessingActivitiesPage.btnSettingsProcessing.first().click();
    ProcessingActivitiesPage.clickBtnEdit();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name_ed);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.contains(name_ed);
    cy.contains(purpose);
    cy.contains('CONSENT');
  });

  it('Should verify the data processing s token', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickConsent();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.get('.ant-table-row > :nth-child(6)')
      .eq(0)
      .then($token => {
        const token = $token.text();
        ProcessingActivitiesPage.btnSettingsProcessing.first().click();
        ProcessingActivitiesPage.clickBtnEdit();
        ProcessingActivitiesPage.clickBtnAdvancedInformation();
        ProcessingActivitiesPage.processingActivitiesTokenField
          .invoke('attr', 'value')
          .should('eq', token);
        ProcessingActivitiesPage.processingActivitiesTokenField.should('be.disabled');
      });
  });

  it('Should archive a data processing', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickConsent();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.get('.ant-table-row > :nth-child(1)')
      .eq(0)
      .then($id => {
        const id = $id.text();
        ProcessingActivitiesPage.btnSettingsProcessing.first().click();
        ProcessingActivitiesPage.clickBtnArchive();
        cy.contains(id).should('not.exist');
      });
  });

  it('Should delete a data processing', () => {
    const name = `name-${Math.random().toString(36).substring(2, 10)}`;
    const purpose = `purpose-${Math.random().toString(36).substring(2, 10)}`;
    ProcessingActivitiesPage.clickBtnNewDataProcessing();
    ProcessingActivitiesPage.clickConsent();
    ProcessingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    ProcessingActivitiesPage.typeProcessingActivitiesName(name);
    ProcessingActivitiesPage.typeProcessingActivitiesPurpose(purpose);
    ProcessingActivitiesPage.clickBtnSaveProcessing();
    cy.get('.ant-table-row > :nth-child(6)')
      .eq(0)
      .then($token => {
        const token = $token.text();
        ProcessingActivitiesPage.btnSettingsProcessing.first().click();
        ProcessingActivitiesPage.clickBtnDelete();
        ProcessingActivitiesPage.clickBtnConfirmDelete();
        cy.get('.ant-modal-content').should('not.be.visible');
        cy.contains(token).should('not.exist');
      });
  });
});
