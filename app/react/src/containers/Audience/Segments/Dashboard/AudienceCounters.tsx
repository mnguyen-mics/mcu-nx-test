import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { CounterDashboard } from '../../../../components/Counter/index';
import { CounterProps, LoadingCounterValue } from '../../../../components/Counter/Counter';

export interface Props {
  userPoints?: LoadingCounterValue;
  userAccounts?: LoadingCounterValue;
  userAgents?: LoadingCounterValue;
  userEmails?: LoadingCounterValue;
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
            id="audience-segment-dashboard-counters-display-cookies"
            defaultMessage="Display Cookies"
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
