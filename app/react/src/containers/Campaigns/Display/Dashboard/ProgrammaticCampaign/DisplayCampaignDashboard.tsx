import React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Card, McsTabs } from '@mediarithmics-private/mcs-components-library';
import { DisplayStackedAreaChart, MediaPerformanceTable, GoalStackedAreaChart } from '../Charts';
import messages from '../messages';
import { GoalsCampaignRessource } from './domain';
import { MediaPerformance } from '../Charts/MediaPerformanceTable';
import { OverallStat } from '../Charts/DisplayStackedAreaChart';

export interface DisplayCampaignDashboardProps {
  isFetchingCampaignStat: boolean;
  campaignStat?: OverallStat[];
  mediaStat?: MediaPerformance[];
  isFetchingMediaStat: boolean;
  isFetchingOverallStat: boolean;
  overallStat?: OverallStat[];
  goals: GoalsCampaignRessource[];
}

type Props = DisplayCampaignDashboardProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  WrappedComponentProps;

class DisplayCampaignDashboard extends React.Component<Props> {
  render() {
    const {
      intl,
      goals,
      campaignStat,
      isFetchingCampaignStat,
      isFetchingMediaStat,
      overallStat,
      mediaStat,
      isFetchingOverallStat,
    } = this.props;

    const goalsItems = goals.map(goal => {
      return {
        title: goal.goal_name,
        key: goal.id,
        display: <GoalStackedAreaChart goal={goal} />,
      };
    });

    const items = [
      {
        title: intl.formatMessage(messages.dashboardOverview),
        display: (
          <DisplayStackedAreaChart
            isFetchingCampaignStat={isFetchingCampaignStat}
            dataSource={campaignStat}
            overallStat={overallStat}
            isFetchingOverallStat={isFetchingOverallStat}
            renderCampaignProgress={true}
          />
        ),
      },
      {
        title: intl.formatMessage(messages.dashboardTopSites),
        display: (
          <MediaPerformanceTable isFetchingMediaStat={isFetchingMediaStat} dataSet={mediaStat} />
        ),
      },
      ...goalsItems,
    ];

    return (
      <Card>
        <McsTabs items={items} />
      </Card>
    );
  }
}

export default compose<Props, DisplayCampaignDashboardProps>(
  injectIntl,
  withRouter,
)(DisplayCampaignDashboard);
