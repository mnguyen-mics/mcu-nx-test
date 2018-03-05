import * as React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import McsTabs from '../../../../../components/McsTabs';
import { Card } from '../../../../../components/Card/index';
import { DisplayStackedAreaChart, MediaPerformanceTable } from '../Charts';

import messages from '../messages';

interface AdGroupDashboardProps {
  isFetchingAdGroupStat: boolean;
  hasFetchedAdGroupStat: boolean;
  adGroupStat: any; // type
  isFetchingMediaStat: boolean;
  hasFetchedMediaStat: boolean;
  mediaStat: any; // type
  isFetchingOverallStat: boolean;
  hasFetchedOverallStat: boolean;
  overallStat: any; // type
}

type JoinedProps = AdGroupDashboardProps & InjectedIntlProps;

class AdGroupDashboard extends React.Component<JoinedProps> {
  render() {
    const {
      intl,
      isFetchingAdGroupStat,
      hasFetchedAdGroupStat,
      adGroupStat,
      isFetchingMediaStat,
      mediaStat,
      isFetchingOverallStat,
      hasFetchedOverallStat,
      overallStat,
    } = this.props;
    const items = [
      {
        title: intl.formatMessage(messages.dashboardOverview),
        display: (
          <DisplayStackedAreaChart
            isFetchingCampaignStat={isFetchingAdGroupStat}
            hasFetchedCampaignStat={hasFetchedAdGroupStat}
            dataSource={adGroupStat}
            isFetchingOverallStat={isFetchingOverallStat}
            hasFetchedOverallStat={hasFetchedOverallStat}
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

export default compose<JoinedProps, AdGroupDashboardProps>(injectIntl, withRouter)(
  AdGroupDashboard,
);
