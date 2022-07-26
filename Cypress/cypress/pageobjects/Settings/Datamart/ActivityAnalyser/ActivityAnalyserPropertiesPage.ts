import Page from '../../../Page';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';

class ActivityAnalyserPropertiesPage extends Page {
  visitAnalyserName: string;

  constructor(visitAnalyserName: string) {
    super();
    this.visitAnalyserName = visitAnalyserName;
  }

  @logGetter()
  get nameField() {
    return cy.get('.mcs-PluginEditForm_name_field');
  }

  @logGetter()
  get errorRecoveryStrategySelect() {
    return cy.get('.mcs-VisitAnalyzerPage_error_recovery_strategy');
  }

  @logGetter()
  get errorRecoveryStrategy_Drop() {
    return cy.get('.mcs-select_itemOption--drop');
  }

  @logGetter()
  get errorRecoveryStrategy_StoreWithErrorId() {
    return cy.get('.mcs-select_itemOption--store-with-error-id');
  }

  @logGetter()
  get errorRecoveryStrategy_StoreWithErrorIdAndSkipUpcomingAnalysers() {
    return cy.get('.mcs-select_itemOption--store-with-error-id-and-skip-upcoming-analyzers');
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-form_saveButton_pluginForm');
  }

  @logGetter()
  get checkboxDebug() {
    return cy.get('.ant-checkbox-input');
  }

  @logGetter()
  get topicPropertiesField() {
    return cy.get('.mcs-pluginFormField_topic_properties');
  }

  @logGetter()
  get informationIcon() {
    return cy.get('.mcs-icon > .mcs-info');
  }

  @logFunction()
  typeName(name: string = this.visitAnalyserName) {
    this.nameField.clear().type(name);
  }

  @logFunction()
  clickErrorRecoveryStrategySelect() {
    this.errorRecoveryStrategySelect.click();
  }

  @logFunction()
  clickErrorRecoveryStrategy_Drop() {
    this.errorRecoveryStrategy_Drop.click();
  }

  @logFunction()
  clickErrorRecoveryStrategy_StoreWithErrorId() {
    this.errorRecoveryStrategy_StoreWithErrorId.click();
  }

  @logFunction()
  clickErrorRecoveryStrategy_StoreWithErrorIdAndSkipUpcomingAnalysers() {
    this.errorRecoveryStrategy_StoreWithErrorIdAndSkipUpcomingAnalysers.click();
  }

  @logFunction()
  clickBtnSave() {
    this.btnSave.click();
  }

  @logFunction()
  clickCheckboxDebug() {
    this.checkboxDebug.click();
  }

  @logFunction()
  typeTopicProperties(properties: string) {
    this.topicPropertiesField.clear().type(properties);
  }
  @logFunction()
  clickInformationIcon() {
    this.informationIcon.click();
  }
}

export default ActivityAnalyserPropertiesPage;
