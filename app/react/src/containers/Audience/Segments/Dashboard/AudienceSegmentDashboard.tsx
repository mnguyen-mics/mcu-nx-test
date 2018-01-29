import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { Card } from '../../../../components/Card';
import McsTabs from '../../../../components/McsTabs';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import AudienceCounters from './AudienceCounters';

interface MapStateToProps {
  segment: {
    report_view: Array<{
      day: string;
      user_points: number;
      user_accounts: number;
      emails: number;
      desktop_cookie_ids: number;
    }>;
  };
  isFetching: boolean;
}

type Props = MapStateToProps & InjectedIntlProps;

class AudienceSegmentDashboard extends React.Component<Props> {
  render() {
    const { segment, intl, isFetching } = this.props;

    const getLoadingValue = (
      key: 'user_points' | 'user_accounts' | 'emails' | 'desktop_cookie_ids',
    ) => {
      const value =
        segment &&
        segment.report_view &&
        segment.report_view[0] &&
        segment.report_view[0][key];
      return {
        value,
        loading: isFetching,
      };
    };

    return (
      <div>
        <AudienceCounters
          userPoints={getLoadingValue('user_points')}
          userAccounts={getLoadingValue('user_accounts')}
          userAgents={getLoadingValue('desktop_cookie_ids')}
          userEmails={getLoadingValue('emails')}
        />
        <Card>
          <McsTabs
            items={[
              {
                title: intl.formatMessage(messages.overview),
                display: <Overview />,
              },
              {
                title: intl.formatMessage(messages.additionDeletion),
                display: <AdditionDeletion />,
              },
              {
                title: intl.formatMessage(messages.overlap),
                display: <Overlap />,
              },
            ]}
          />
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  segment:
    state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
  isFetching: state.audienceSegmentsTable.audienceSegmentsSingleApi.isFeching,
});

export default compose(injectIntl, connect(mapStateToProps))(
  AudienceSegmentDashboard,
);

const messages = defineMessages({
  overview: {
    id: 'audience-segment-dashboard-tab-title-overview',
    defaultMessage: 'Overview',
  },
  additionDeletion: {
    id: 'audience-segment-dashboard-tab-title-addition-deletion',
    defaultMessage: 'Addition Deletion',
  },
  overlap: {
    id: 'audience-segment-dashboard-tab-title-overlap',
    defaultMessage: 'Overlap',
  },
});
