import Page from '../../../Page';
import SettingsMenu from '../../SettingsMenu';
import DatamartMenu from '../DatamartMenu';
import SelectDatamartPage from './SelectDatamartPage';
import SiteInformation from './SiteInformation';
import { logFunction, logGetter } from '../../../log/LoggingDecorator';
import faker from 'faker';

class ChannelsPage extends Page {
  name: string;
  token: string;
  domain: string;
  selectDatamartPage: SelectDatamartPage;
  siteInformation: SiteInformation;

  constructor() {
    super();
    this.name = faker.random.word();
    this.token = faker.random.word();
    this.domain = `${faker.lorem.word()}.com`;
    this.selectDatamartPage = new SelectDatamartPage();
    this.siteInformation = new SiteInformation(this.name, this.token, this.domain);
  }

  @logFunction()
  goToPage() {
    SettingsMenu.clickDatamart();
    DatamartMenu.clickChannels();
  }

  @logGetter()
  get btnSaveMobileApplication() {
    return cy.get('.mcs-form_saveButton_mobileApplicationForm');
  }

  @logGetter()
  get searchChannelsField() {
    return cy.get('.mcs-channelsTable_search_bar');
  }

  @logGetter()
  get btnSave() {
    return cy.get('.mcs-form_saveButton_siteForm');
  }

  @logFunction()
  clickBtnNewChannel() {
    cy.get('.mcs-channelListPage_newChannelButton').click();
  }

  @logFunction()
  clickBtnNewMobileApplication() {
    cy.get('.mcs-channelsListPage_NewMobileApplicationButton').click();
  }

  @logFunction()
  clickBtnNewSite() {
    cy.get('.mcs-channelsListPage_new_site_button').click();
  }

  @logFunction()
  typeSearchChannels(token: string = this.token) {
    this.searchChannelsField.clear().type(token);
  }

  @logFunction()
  clickOnName(name: string = this.name) {
    cy.contains(name).click();
  }
}

export default ChannelsPage;
