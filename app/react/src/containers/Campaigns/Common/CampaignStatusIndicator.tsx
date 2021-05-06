import * as React from 'react';
import { CampaignStatus } from '../../../models/campaign/constants/index';
import { formatDisplayCampaignProperty } from '../../Campaigns/Display/messages';

export interface Props {
  status: CampaignStatus;
}

class CampaignStatusIndicator extends React.Component<Props> {
  render() {
    const { status } = this.props;
    return (
      <div className='campaign-status-indicator'>
        <div className={status.toLowerCase()} />
        <span className='divider'>|</span>
        <div className='status-value'>{formatStatus(status)}</div>
      </div>
    );
  }
}

export default CampaignStatusIndicator;

function formatStatus(status: CampaignStatus): React.ReactNode {
  return formatDisplayCampaignProperty('status', status).formattedValue;
}
