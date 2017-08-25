import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';

import McsTabs from '../../../../../components/McsTabs';
import Card from '../../../../../components/Card/Card';
import { DisplayStackedAreaChart, MediaPerformanceTable } from '../Charts';

import messages from '../messages';

function CampaignDisplayDashboard({
  isFetchingCampaignStat,
  hasFetchedCampaignStat,
  campaignStat,
  isFetchingMediaStat,
  hasFetchedMediaStat,
  mediaStat,
  overallStat,
  hasFetchedOverallStat,
  isFetchingOverallStat,
  intl: {
    formatMessage,
  },
}) {

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
  ];

  return <Card><McsTabs items={items} /></Card>;
}

CampaignDisplayDashboard.propTypes = {
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
};


export default compose(
  injectIntl,
  withRouter,
)(CampaignDisplayDashboard);
