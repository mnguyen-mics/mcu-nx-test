import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import LabelsPage from '../../../../pageobjects/Settings/Organisation/LabelsPage';

describe('Labels test', () => {
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.login();
    cy.visit('/');
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      HeaderMenu.switchOrg(data.organisationName);
    });
    new LabelsPage().goToPage();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should create a new Label', () => {
    const labelsPage = new LabelsPage();
    const dateNow = new Date().toLocaleDateString();

    labelsPage.clickBtnNewLabel();
    labelsPage.typeNewLabelField();
    labelsPage.clickBtnSave();
    cy.wait(200);
    labelsPage.labelsTable.last().should('contain', labelsPage.label).and('contain', dateNow);
  });

  it('Should not be able to create a new Label with an already existing name', () => {
    const labelsPage = new LabelsPage();
    labelsPage.clickBtnNewLabel();
    labelsPage.typeNewLabelField();
    labelsPage.alertMessage.should('not.exist');
    labelsPage.clickBtnSave();
    labelsPage.clickBtnNewLabel();
    labelsPage.typeNewLabelField(labelsPage.label);
    labelsPage.alertMessage.should('be.visible');
    labelsPage.btnSaveAddPopUp.should('be.disabled');
  });

  it('Should edit a Label', () => {
    const labelsPage = new LabelsPage();
    const editedLabel = `label-${Math.random().toString(36).substring(2, 10)}`;
    labelsPage.addNewLabel();
    cy.wait(200);
    labelsPage.clickLastArrowDropDownMenu();
    labelsPage.clickBtnEdit();
    labelsPage.typeNewLabelField(editedLabel);
    labelsPage.clickBtnSave();
    cy.wait(200);
    labelsPage.labelsTable.last().should('not.contain', labelsPage.label);
    labelsPage.labelsTable.last().should('contain', editedLabel);
  });

  it('Should archive a Label', () => {
    const labelsPage = new LabelsPage();
    labelsPage.addNewLabel();
    cy.wait(200);
    labelsPage.clickLastArrowDropDownMenu();
    labelsPage.clickBtnArchive();
    labelsPage.clickBtnOKConfirmPopUp();
    cy.wait(200);
    labelsPage.labelsTable.should('not.contain', labelsPage.label);
  });
});
