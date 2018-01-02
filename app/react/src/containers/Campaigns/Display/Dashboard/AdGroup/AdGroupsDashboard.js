import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';

import McsTabs from '../../../../../components/McsTabs.tsx';
import { Card } from '../../../../../components/Card/index.ts';
import { DisplayStackedAreaChart, MediaPerformanceTable } from '../Charts';

import messages from '../messages.ts';

function AdGroupDashboard({
  isFetchingAdGroupStat,
  hasFetchedAdGroupStat,
  adGroupStat,
  isFetchingMediaStat,
  hasFetchedMediaStat,
  mediaStat,
  isFetchingOverallStat,
  hasFetchedOverallStat,
  overallStat,
  intl: {
    formatMessage,
  },
}) {

  const items = [
    {
      title: formatMessage(messages.dashboardOverview),
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
      title: formatMessage(messages.dashboardTopSites),
      display: (
        <MediaPerformanceTable
          isFetchingMediaStat={isFetchingMediaStat}
          hasFetchedMediaStat={hasFetchedMediaStat}
          dataSet={mediaStat}
        />
        ),
    },
  ];

  return <Card><McsTabs items={items} /></Card>;
}

AdGroupDashboard.propTypes = {
  isFetchingAdGroupStat: PropTypes.bool.isRequired,
  hasFetchedAdGroupStat: PropTypes.bool.isRequired,
  adGroupStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  mediaStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetchingMediaStat: PropTypes.bool.isRequired,
  hasFetchedMediaStat: PropTypes.bool.isRequired,
  isFetchingOverallStat: PropTypes.bool.isRequired,
  hasFetchedOverallStat: PropTypes.bool.isRequired,
  overallStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: intlShape.isRequired,
};


export default compose(
  injectIntl,
  withRouter,
)(AdGroupDashboard);
