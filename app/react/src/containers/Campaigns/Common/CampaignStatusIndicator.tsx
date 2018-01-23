import * as React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

type Status = 'ACTIVE' | 'PENDING' | 'PAUSED';

export interface Props {
  status: Status
}

class CampaignStatusIndicator extends React.Component<Props> {
  render() {
    const { status } = this.props
    return (
      <div className="campaign-status-indicator">
        <div className={status.toLowerCase()} />
        <span className="divider">|</span>
        <div className="status-value">
          <FormattedMessage {...messages[status]} />
        </div>
      </div>
    );
  }
}

export default CampaignStatusIndicator;

const messages: {
  [status in Status]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ACTIVE: {
    id:'campaign-status-active',
    defaultMessage: 'Active',
  },
  PENDING: {
    id:'campaign-status-pending',
    defaultMessage: 'Pending',
  },
  PAUSED: {
    id:'campaign-status-paused',
    defaultMessage: 'Paused',
  },
})