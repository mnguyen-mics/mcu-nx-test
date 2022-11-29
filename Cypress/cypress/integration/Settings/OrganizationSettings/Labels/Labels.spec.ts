import HeaderMenu from '../../../../pageobjects/HeaderMenu';
import LabelsPage from '../../../../pageobjects/Settings/Organisation/LabelsPage';

describe('Labels test', () => {
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.visit('/');
    cy.login();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.intercept('GET', `**/labels?organisation_id=${data.organisationId}**`).as('getLabels');
      HeaderMenu.switchOrg(data.organisationName);
    });
    new LabelsPage().goToPage();
    cy.wait('@getLabels');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  const getDate = () => {
    const day = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const formattedDay = day >= 10 ? day : `0${day}`;
    const formattedMonth = month >= 10 ? month : `0${month}`;
    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  it('Should create a new Label', () => {
    const labelsPage = new LabelsPage();
    const dateNow = getDate();
    labelsPage.clickBtnNewLabel();
    labelsPage.typeNewLabelField();
    labelsPage.clickBtnSave();
    cy.wait('@getLabels');
    labelsPage.labelsTableRows.should('contain', labelsPage.label).and('contain', dateNow);
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
    cy.wait('@getLabels');
    cy.wait(100);
    labelsPage.clickDropDownArrowLabel(labelsPage.label);
    labelsPage.clickBtnEdit();
    labelsPage.typeNewLabelField(editedLabel);
    labelsPage.clickBtnSave();
    cy.wait('@getLabels');
    cy.get('.ant-spin-dot-spin')
      .should('not.exist')
      .then(() => {
        labelsPage.labelsTable.should('not.contain', labelsPage.label);
        labelsPage.labelsTable.should('contain', editedLabel);
      });
  });

  it('Should archive a Label', () => {
    const labelsPage = new LabelsPage();
    labelsPage.addNewLabel();
    cy.wait('@getLabels');
    cy.wait(100);
    labelsPage.clickDropDownArrowLabel(labelsPage.label);
    labelsPage.clickBtnArchive();
    labelsPage.clickBtnOKConfirmPopUp();
    cy.wait('@getLabels');
    cy.get('.ant-spin-dot-spin')
      .should('not.exist')
      .then(() => {
        labelsPage.labelsTable.should('not.contain', labelsPage.label);
      });
  });
});
