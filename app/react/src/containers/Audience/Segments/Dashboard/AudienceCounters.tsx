import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { CounterDashboard } from '../../../../components/Counter/index';
import { CounterProps } from '../../../../components/Counter/Counter';

interface LoadingValue {
  value?: number;
  loading?: boolean;
}

export interface Props {
  userPoints?: LoadingValue;
  userAccounts?: LoadingValue;
  userAgents?: LoadingValue;
  userEmails?: LoadingValue;
}

class AudienceCounters extends React.Component<Props> {
  render() {
    const { userPoints, userAccounts, userAgents, userEmails } = this.props;
    const counters: CounterProps[] = [];

    if (userPoints) {
      counters.push({
        iconType: 'full-users',
        title: (
          <FormattedMessage
            id="audience-segment-dashboard-counters-user-points"
            defaultMessage="User Points"
          />
        ),
        ...userPoints,
      });
    }

    if (userAccounts) {
      counters.push({
        iconType: 'users',
        title: (
          <FormattedMessage
            id="audience-segment-dashboard-counters-user-accounts"
            defaultMessage="User Accounts"
          />
        ),
        ...userAccounts,
      });
    }

    if (userAgents) {
      counters.push({
        iconType: 'display',
        title: (
          <FormattedMessage
            id="audience-segment-dashboard-counters-user-points"
            defaultMessage="User Points"
          />
        ),
        ...userAgents,
      });
    }

    if (userEmails) {
      counters.push({
        iconType: 'email-inverted',
        title: (
          <FormattedMessage
            id="audience-segment-dashboard-counters-emails"
            defaultMessage="Email"
          />
        ),
        ...userEmails,
      });
    }

    return (
      <div className="audience-statistic">
        <CounterDashboard counters={counters} invertedColor={true} />
      </div>
    );
  }
}

export default AudienceCounters;
