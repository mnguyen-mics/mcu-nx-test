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
    new ProcessingActivitiesPage().goToPage();
  });

  function verifyDataProcessingInformations(
    name: string,
    purpose: string,
    legalBasis: string,
    technicalName?: string,
  ) {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.namesColumn.should('contain', name);
    processingActivitiesPage.purposeColumn.should('contain', purpose);
    processingActivitiesPage.legalBasisColumn.should('contain', legalBasis);
    if (technicalName) {
      processingActivitiesPage.technicalNamesColumn.should('contain', technicalName);
    }
  }

  it('Should create a new data processing and verify the creation', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();

    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    verifyDataProcessingInformations(
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      'CONSENT',
    );

    processingActivitiesPage.namesColumn.should('contain', processingActivitiesPage.name);
    processingActivitiesPage.namesColumn
      .filter((index, elt) => {
        return elt.innerText.includes(processingActivitiesPage.name);
      })
      .then($a => {
        var countBefore = $a.length;
        processingActivitiesPage.clickBtnNewDataProcessing();
        processingActivitiesPage.clickConsent();
        processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
        processingActivitiesPage.namesColumn
          .filter((index, elt) => {
            return elt.innerText.includes(processingActivitiesPage.name);
          })
          .then($a => {
            var countAfter = $a.length;
            expect(countAfter).to.eq(countBefore + 1);
          });
      });

    processingActivitiesPage.purposeColumn.should('contain', processingActivitiesPage.purpose);
    processingActivitiesPage.purposeColumn
      .filter((index, elt) => {
        return elt.innerText.includes(processingActivitiesPage.purpose);
      })
      .then($a => {
        var countBefore = $a.length;
        processingActivitiesPage.clickBtnNewDataProcessing();
        processingActivitiesPage.clickConsent();
        processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
        processingActivitiesPage.purposeColumn
          .filter((index, elt) => {
            return elt.innerText.includes(processingActivitiesPage.purpose);
          })
          .then($a => {
            var countAfter = $a.length;
            expect(countAfter).to.eq(countBefore + 1);
          });
      });

    processingActivitiesPage.legalBasisColumn.should('contain', 'CONSENT');
    processingActivitiesPage.legalBasisColumn
      .filter((index, elt) => {
        return elt.innerText.includes('CONSENT');
      })
      .then($a => {
        var countBefore = $a.length;
        processingActivitiesPage.clickBtnNewDataProcessing();
        processingActivitiesPage.clickConsent();
        processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
        processingActivitiesPage.legalBasisColumn
          .filter((index, elt) => {
            return elt.innerText.includes('CONSENT');
          })
          .then($a => {
            var countAfter = $a.length;
            expect(countAfter).to.eq(countBefore + 1);
          });
      });
  });

  it('Should create a new data processing (Consent) without technicalName', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    verifyDataProcessingInformations(
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      'CONSENT',
    );
  });

  it('Should create a new data processing (Consent) with technicalName', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();

    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.createNewDataProcessingWithTechnicalName();
    verifyDataProcessingInformations(
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      'CONSENT',
      processingActivitiesPage.technicalName,
    );
  });

  it('Should create a new data processing (PublicInterestOrExerciseOfOfficialAuthority) without technicalName', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickPublicInterestOrExerciseOfOfficialAuthority();
    processingActivitiesPage.legalBasisField
      .invoke('attr', 'value')
      .should('eq', 'PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    verifyDataProcessingInformations(
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
      'PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY',
    );
  });

  it('Should create a two new data processing (LegitimateInterest) with the same name and purpose', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickLegalObligation();
    processingActivitiesPage.legalBasisField
      .invoke('attr', 'value')
      .should('eq', 'LEGAL_OBLIGATION');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickLegalObligation();
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName(
      processingActivitiesPage.name,
      processingActivitiesPage.purpose,
    );
    processingActivitiesPage.namesColumn
      .filter((index, elt) => {
        return elt.innerText.includes(processingActivitiesPage.name);
      })
      .should('have.length', 2);
  });

  it('Should edit a data processing', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    const name_ed = `name_ed-${Math.random().toString(36).substring(2, 10)}`;
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    processingActivitiesPage.btnSettingsProcessing.first().click();
    processingActivitiesPage.clickBtnEdit();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.typeProcessingActivitiesName(name_ed);
    processingActivitiesPage.clickBtnSaveProcessing();
    verifyDataProcessingInformations(name_ed, processingActivitiesPage.purpose, 'CONSENT');
  });

  it('Should verify the data processing s token', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    processingActivitiesPage.tokensColumn.eq(0).then($token => {
      const token = $token.text();
      processingActivitiesPage.btnSettingsProcessing.first().click();
      processingActivitiesPage.clickBtnEdit();
      processingActivitiesPage.clickBtnAdvancedInformation();
      processingActivitiesPage.processingActivitiesTokenField
        .invoke('attr', 'value')
        .should('eq', token);
      processingActivitiesPage.processingActivitiesTokenField.should('be.disabled');
    });
  });

  it('Should archive a data processing', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    processingActivitiesPage.idColumn.eq(0).then($id => {
      const id = $id.text();
      processingActivitiesPage.btnSettingsProcessing.first().click();
      processingActivitiesPage.clickBtnArchive();
      cy.contains(id).should('not.exist');
    });
  });

  it('Should delete a data processing', () => {
    const processingActivitiesPage = new ProcessingActivitiesPage();
    processingActivitiesPage.clickBtnNewDataProcessing();
    processingActivitiesPage.clickConsent();
    processingActivitiesPage.legalBasisField.invoke('attr', 'value').should('eq', 'CONSENT');
    processingActivitiesPage.createNewDataProcessingWithoutTechnicalName();
    processingActivitiesPage.tokensColumn.eq(0).then($token => {
      const token = $token.text();
      processingActivitiesPage.btnSettingsProcessing.first().click();
      processingActivitiesPage.clickBtnDelete();
      processingActivitiesPage.clickBtnConfirmDelete();
      processingActivitiesPage.deletePopUp.should('not.be.visible');
      cy.contains(token).should('not.exist');
    });
  });
});
