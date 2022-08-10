import HeaderMenu from '../../HeaderMenu';
import Page from '../../Page';
import OrganisationMenu from './OrganisationMenu';
import { logFunction, logGetter } from '../../log/LoggingDecorator';

class ProfilePage extends Page {
  constructor() {
    super();
  }

  @logFunction()
  goToPage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickProfile();
  }

  @logGetter()
  get organisationNameField() {
    return cy.get('.ant-descriptions-item').eq(0);
  }

  @logGetter()
  get logoZone() {
    return cy.get('.mcs-logo').find('input');
  }

  @logGetter()
  get logoInformationIcon() {
    return cy.get('.mcs-icon > .mcs-info');
  }

  @logFunction()
  clickLogoInformationIcon() {
    this.logoInformationIcon.click();
  }
}

export default ProfilePage;
