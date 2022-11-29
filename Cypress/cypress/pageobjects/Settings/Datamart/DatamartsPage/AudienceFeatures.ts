import Page from '../../../Page';
import DatamartsPage from '../DatamartsPage';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class AudienceFeatures extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    const datamartsPage = new DatamartsPage();
    datamartsPage.goToPage();
    datamartsPage.clickOnAudienceFeaturesTab();
  }

  @logGetter()
  get name() {
    return cy.get('.mcs-audienceFeatureName');
  }

  @logFunction()
  clickCloseEditQuery() {
    cy.get('.mcs-close').click({ multiple: true });
  }

  @logFunction()
  clickOnFirstChevron() {
    cy.get('.mcs-audienceFeature_table').within($table => {
      cy.wait(1000);
      cy.get('.mcs-chevron').first().click();
    });
  }

  @logFunction()
  clickSave() {
    cy.get('.mcs-form_saveButton_audienceFeatureForm').click();
    cy.wait(3000);
  }

  @logFunction()
  clickCreate() {
    cy.get('.mcs-audienceFeature_creation_button').click();
  }

  @logFunction()
  create(name: string, desc: string, otql: string) {
    this.clickCreate();
    this.setName(name);
    this.setDescription(desc);
    this.setQuery(otql);
    this.clickSave();
  }

  @logFunction()
  deleteTheFirstOne() {
    this.clickOnFirstChevron();
    cy.get('.mcs-dropdown-actions').contains('Delete').click();
    cy.get('.mcs-audienceFeatureDeletePopUp_ok_button').click();
  }

  @logFunction()
  editTheFirstOne() {
    this.clickOnFirstChevron();
    cy.get('.mcs-dropdown-actions').contains('Edit').click();
  }

  @logFunction()
  getQuery() {
    return cy.get('.ace_editor');
  }

  @logFunction()
  queryShouldContains(text: string) {
    this.getQuery().should('contain', text);
  }

  @logFunction()
  setDescription(desc: string) {
    cy.get('.mcs-audienceFeatureDescription').type('{selectall}{backspace}' + desc);
  }

  @logFunction()
  setName(name: string) {
    this.name.type('{selectall}{backspace}' + name);
  }

  @logFunction()
  setQuery(otql: string) {
    cy.get('.mcs-audienceFeature_edit_query_button').click();
    cy.wait(5000);
    // clean up the area field
    cy.get('.mcs-otqlInputEditor_otqlConsole > textarea').type(
      '{selectall}{backspace}{backspace}',
      {
        force: true,
      },
    );
    cy.wait(1000);
    cy.get('.mcs-OTQLConsoleContainer_tabs').should('contain', 'Query to save');
    cy.get('.mcs-otqlInputEditor_otqlConsole > textarea').type(otql, {
      force: true,
      parseSpecialCharSequences: false,
    });
    cy.get('.mcs-audienceFeature_update_query').click();
    cy.wait(5000);
  }

  @logFunction()
  shouldContain(text: string) {
    cy.get('.mcs-audienceFeature_table').should('contain', text);
  }

  @logFunction()
  shouldNotContain(text: string) {
    cy.get('.mcs-audienceFeature_table').should('not.contain', text);
  }
}

export default AudienceFeatures;
