import * as React from 'react';
import { lazyInject } from '../../config/inversify.config';
import { IOrganisationService } from '../../services/OrganisationService';
import { TYPES } from '../../constants/types';
import OrgLogo from './OrgLogo';

export interface OrgLogoProps {
  organisationId: string;
}

interface OrgLogoState {
  logoUrl: string | null;
  isLoading: boolean;
}

export default class OrgLogoContainer extends React.Component<OrgLogoProps, OrgLogoState> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: OrgLogoProps) {
    super(props);
    this.state = {
      logoUrl: null,
      isLoading: true,
    };
  }

  componentDidMount() {
    // fetch org logo
    const { organisationId } = this.props;
    this._organisationService
      .getLogo(organisationId)
      .catch(() => this._organisationService.getStandardLogo())
      .then(blobLogo =>
        this.setState({
          isLoading: false,
          logoUrl: URL.createObjectURL(blobLogo),
        }),
      );
  }

  render() {
    return (
      <OrgLogo
        organisationId={this.props.organisationId}
        logoUrl={this.state.logoUrl}
        isLoading={this.state.isLoading}
      />
    );
  }
}
