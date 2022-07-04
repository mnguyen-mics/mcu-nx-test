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
    return cy.get('#organisation_name');
  }

  @logGetter()
  get logoZone() {
    return cy.get('.mcs-logo-dragger');
  }

  @logGetter()
  get logoInformationIcon() {
    return cy.get('.mcs-icon > .mcs-info');
  }

  @logFunction()
  typeOrganisationName(orgName: string) {
    this.organisationNameField.type(orgName);
  }

  @logFunction()
  clickLogoInformationIcon() {
    this.logoInformationIcon.click();
  }
}

export default ProfilePage;
