import * as React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Card, McsTabs } from '@mediarithmics-private/mcs-components-library';
import { DisplayStackedAreaChart, MediaPerformanceTable } from '../Charts';
import messages from '../messages';
import { OverallStat } from '../Charts/DisplayStackedAreaChart';
import { MediaPerformance } from '../Charts/MediaPerformanceTable';

interface AdGroupDashboardProps {
  isFetchingAdGroupStat: boolean;
  adGroupStat: OverallStat[];
  isFetchingMediaStat: boolean;
  mediaStat: MediaPerformance[];
  isFetchingOverallStat: boolean;
  overallStat: OverallStat[];
}

type JoinedProps = AdGroupDashboardProps & InjectedIntlProps;

class AdGroupDashboard extends React.Component<JoinedProps> {
  render() {
    const {
      intl,
      isFetchingAdGroupStat,
      adGroupStat,
      isFetchingMediaStat,
      mediaStat,
      isFetchingOverallStat,
      overallStat,
    } = this.props;
    const items = [
      {
        title: intl.formatMessage(messages.dashboardOverview),
        display: (
          <DisplayStackedAreaChart
            isFetchingCampaignStat={isFetchingAdGroupStat}
            dataSource={adGroupStat}
            isFetchingOverallStat={isFetchingOverallStat}
            overallStat={overallStat}
          />
        ),
      },
      {
        title: intl.formatMessage(messages.dashboardTopSites),
        display: (
          <MediaPerformanceTable
            isFetchingMediaStat={isFetchingMediaStat}
            dataSet={mediaStat}
          />
        ),
      },
    ];
    return (
      <Card>
        <McsTabs items={items} />
      </Card>
    );
  }
}

export default compose<JoinedProps, AdGroupDashboardProps>(
  injectIntl,
  withRouter,
)(AdGroupDashboard);
