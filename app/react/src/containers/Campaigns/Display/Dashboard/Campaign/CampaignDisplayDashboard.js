import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';

import McsTabs from '../../../../../components/McsTabs';
import Card from '../../../../../components/Card/Card';
import { DisplayStackedAreaChart, MediaPerformanceTable } from '../Charts';

import messages from '../messages';

class CampaignDisplayDashboard extends Component {

  render() {

    const {
      isFetchingCampaignStat,
      hasFetchedCampaignStat,
      campaignStat,
      isFetchingMediaStat,
      hasFetchedMediaStat,
      mediaStat,
      intl: {
        formatMessage,
      },
    } = this.props;

    const items = [
      {
        title: formatMessage(messages.dashboardOverview),
        display: <DisplayStackedAreaChart isFetchingCampaignStat={isFetchingCampaignStat} hasFetchedCampaignStat={hasFetchedCampaignStat} dataSource={campaignStat} />,
      },
      {
        title: formatMessage(messages.dashboardTopSites),
        display: <MediaPerformanceTable isFetchingMediaStat={isFetchingMediaStat} hasFetchedMediaStat={hasFetchedMediaStat} dataSet={mediaStat} />,
      },
    ];

    return <Card><McsTabs items={items} /></Card>;
  }

}

CampaignDisplayDashboard.propTypes = {
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  campaignStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  mediaStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetchingMediaStat: PropTypes.bool.isRequired,
  hasFetchedMediaStat: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};


CampaignDisplayDashboard = compose(
  injectIntl,
  withRouter,
)(CampaignDisplayDashboard);

export default CampaignDisplayDashboard;
