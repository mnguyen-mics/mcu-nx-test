import * as React from 'react';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import CampaignStatusIndicator from './CampaignStatusIndicator';
import { CampaignStatus } from '../../../models/campaign/constants';

interface Props {
  campaign?: {
    name: string;
    id: string;
    status: CampaignStatus;
  };
  showStatus?: boolean;
}

class CampaignDashboardHeader extends React.Component<Props> {
  static defaultProps = {
    showStatus: true,
  };

  render() {
    const { campaign, showStatus } = this.props;

    const campaignStatus = campaign && (
      <CampaignStatusIndicator status={campaign.status} />
    );

    return (
      <ContentHeader
        title={campaign ? campaign.name || campaign.id : ''}
        subTitle={showStatus ? campaignStatus : null}
        loading={!campaign}
      />
    );
  }
}

export default CampaignDashboardHeader;
