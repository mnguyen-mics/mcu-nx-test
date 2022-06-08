import HeaderMenu from '../../HeaderMenu';
import Page from '../../Page';
import OrganisationMenu from './OrganisationMenu';

class ProfilePage extends Page {
  goToProfilePage() {
    HeaderMenu.clickSettingsIcon();
    OrganisationMenu.clickProfile();
  }

  get organisationNameField() {
    return cy.get('#organisation_name');
  }

  get logoZone() {
    return cy.get('.mcs-logo-dragger');
  }

  get logoInformationIcon() {
    return cy.get('.mcs-icon > .mcs-info');
  }

  typeOrganisationName(orgName: string) {
    this.organisationNameField.type(orgName);
  }

  clickLogoInformationIcon() {
    this.logoInformationIcon.click();
  }
}

export default new ProfilePage();
