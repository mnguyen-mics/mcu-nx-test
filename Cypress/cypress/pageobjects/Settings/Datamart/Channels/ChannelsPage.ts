import Page from '../../../Page';
import SettingsMenu from '../../SettingsMenu';
import DatamartMenu from '../DatamartMenu';
import HeaderMenu from '../../../HeaderMenu';
import { logFunction } from '../../../log/LoggingDecorator';

class ChannelsPage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    SettingsMenu.clickDatamart();
    DatamartMenu.clickChannels();
  }

  @logFunction()
  clickBtnNewChannel() {
    cy.get('.mcs-channelListPage_newChannelButton').click();
  }

  @logFunction()
  clickBtnNewMobileApplication() {
    cy.get('.mcs-channelsListPage_NewMobileApplicationButton').click();
  }

  get btnSaveMobileApplication() {
    return cy.get('.mcs-form_saveButton_mobileApplicationForm');
  }
}

export default ChannelsPage;
