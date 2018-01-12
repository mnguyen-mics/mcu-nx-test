import * as React from 'react';
import { Spin } from 'antd';
import OrganisationService from '../../services/OrganisationService';

export interface OrgLogoProps {
  organisationId: string;
}

interface OrgLogoState {
  logoUrl: string;
  isLoading: boolean;
}

export default class OrgLogo extends React.Component<OrgLogoProps, OrgLogoState> {

  constructor(props: OrgLogoProps) {
    super(props);
    this.state = {
      logoUrl: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    // fetch org logo
    const {
      organisationId,
    } = this.props;
    this.getFileThenGenerateUrl(OrganisationService
      .getLogo(organisationId))
      .catch(() => this.getFileThenGenerateUrl(OrganisationService.getStandardLogo()));
  }

  getFileThenGenerateUrl = (myPromise: Promise<Blob>) => {
    return myPromise
    .then((res: Blob) => URL.createObjectURL(res))
    .then((res: string) => this.setState({ isLoading: false, logoUrl: res }));
  }

  render() {
    return (
      <div className="mcs-card-cover" style={{  }}>
        {this.state.isLoading ?
          <Spin /> :
          <img src={this.state.logoUrl} alt={this.props.organisationId} className="mcs-cover-image" style={{ }} />}
      </div>
    );
  }
}
