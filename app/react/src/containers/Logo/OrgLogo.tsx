import * as React from 'react';
import { Spin } from 'antd';
import { lazyInject } from '../../config/inversify.config';
import { IOrganisationService } from '../../services/OrganisationService';
import { TYPES } from '../../constants/types';

export interface OrgLogoProps {
  organisationId: string;
}

interface OrgLogoState {
  logoUrl: string;
  isLoading: boolean;
}

export default class OrgLogo extends React.Component<
  OrgLogoProps,
  OrgLogoState
> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: OrgLogoProps) {
    super(props);
    this.state = {
      logoUrl: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    // fetch org logo
    const { organisationId } = this.props;
    this.getFileThenGenerateUrl(
      this._organisationService.getLogo(organisationId),
    ).catch(() =>
      this.getFileThenGenerateUrl(this._organisationService.getStandardLogo()),
    );
  }

  getFileThenGenerateUrl = (myPromise: Promise<Blob>) => {
    return myPromise
      .then((res: Blob) => URL.createObjectURL(res))
      .then((res: string) => this.setState({ isLoading: false, logoUrl: res }));
  };

  render() {
    return (
      <div className="mcs-card-cover" style={{}}>
        {this.state.isLoading ? (
          <Spin />
        ) : (
          <img
            src={this.state.logoUrl}
            alt={this.props.organisationId}
            className="mcs-cover-image"
            style={{}}
          />
        )}
      </div>
    );
  }
}
