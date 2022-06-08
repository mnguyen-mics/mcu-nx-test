import HeaderMenu from '../../../pageobjects/HeaderMenu';
import LabelsPage from '../../../pageobjects/Settings/Organisation/LabelsPage';

describe('Labels test', () => {
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.login();
    cy.visit('/');
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      HeaderMenu.switchOrg(data.organisationName);
    });
    LabelsPage.goToLabelsPage();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should create a new Label', () => {
    const dateNow = new Date().toLocaleDateString();

    LabelsPage.clickBtnNewLabel();
    LabelsPage.typeNewLabelField('Added Label');
    LabelsPage.clickBtnSave();
    LabelsPage.labelsTable.should('contain', 'Added Label').and('contain', dateNow);
  });

  it('Should not be able to create a new Label with an already existing name', () => {
    LabelsPage.clickBtnNewLabel();
    LabelsPage.typeNewLabelField('Already added Label');
    LabelsPage.alertMessage.should('not.exist');
    LabelsPage.clickBtnSave();
    LabelsPage.clickBtnNewLabel();
    LabelsPage.typeNewLabelField('Already added Label');
    LabelsPage.alertMessage.should('be.visible');
    LabelsPage.btnSave.should('be.disabled');
  });

  it('Should edit a Label', () => {
    LabelsPage.clickBtnNewLabel();
    LabelsPage.typeNewLabelField('Label to edit');
    LabelsPage.clickBtnSave();
    cy.wait(1000);
    LabelsPage.arrowDropDownMenu.last().click();
    LabelsPage.clickBtnEdit();
    LabelsPage.typeNewLabelField('Edited Label');
    LabelsPage.clickBtnSave();
    LabelsPage.labelsTable.should('not.contain', 'Label to edit');
    LabelsPage.labelsTable.should('contain', 'Edited Label');
  });

  it('Should archive a Label', () => {
    LabelsPage.clickBtnNewLabel();
    LabelsPage.typeNewLabelField('Label to archive');
    LabelsPage.clickBtnSave();
    cy.wait(500);
    LabelsPage.arrowDropDownMenu.last().click();
    LabelsPage.clickBtnArchive();
    LabelsPage.clickBtnOKConfirmPopUp();
    LabelsPage.labelsTable.should('not.contain', 'Label to archive');
  });
});
