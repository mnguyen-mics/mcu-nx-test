import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';

import McsTabs from '../../../../../components/McsTabs.tsx';
import Card from '../../../../../components/Card/Card.tsx';
import { DisplayStackedAreaChart, MediaPerformanceTable, GoalStackedAreaChart } from '../Charts';

import messages from '../messages';


function DisplayCampaignDashboard({
      isFetchingCampaignStat,
      hasFetchedCampaignStat,
      campaignStat,
      isFetchingMediaStat,
      hasFetchedMediaStat,
      mediaStat,
      overallStat,
      hasFetchedOverallStat,
      isFetchingOverallStat,
      goals,
      intl: {
        formatMessage
      }
    }) {

  const goalsItems = goals.map(goal => {
    return {
      title: goal.goal_name,
      key: goal.id,
      display: <GoalStackedAreaChart goal={goal} />,
    };
  });

  const items = [
    {
      title: formatMessage(messages.dashboardOverview),
      display: (
        <DisplayStackedAreaChart
          isFetchingCampaignStat={isFetchingCampaignStat}
          hasFetchedCampaignStat={hasFetchedCampaignStat}
          dataSource={campaignStat}
          overallStat={overallStat}
          hasFetchedOverallStat={hasFetchedOverallStat}
          isFetchingOverallStat={isFetchingOverallStat}
          renderCampaignProgress
        />
        ),
    },
    {
      title: formatMessage(messages.dashboardTopSites),
      display: (
        <MediaPerformanceTable
          isFetchingMediaStat={isFetchingMediaStat}
          hasFetchedMediaStat={hasFetchedMediaStat}
          dataSet={mediaStat}
        />
        ),
    },
    ...goalsItems,
  ];

  return <Card><McsTabs items={items} /></Card>;
}

DisplayCampaignDashboard.propTypes = {
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  campaignStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  mediaStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetchingMediaStat: PropTypes.bool.isRequired,
  hasFetchedMediaStat: PropTypes.bool.isRequired,
  isFetchingOverallStat: PropTypes.bool.isRequired,
  hasFetchedOverallStat: PropTypes.bool.isRequired,
  overallStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: intlShape.isRequired,
  goals: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};


export default compose(
  injectIntl,
  withRouter,
)(DisplayCampaignDashboard);
