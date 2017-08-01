import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from 'react-intl';

import { McsTabs } from '../../../../../components/McsTabs';
import { Card } from '../../../../../components/Card';
import { DisplayStackedAreaChart, MediaPerformanceTable } from '../Charts';

import messages from '../messages';

class AdGroupDashboard extends Component {

  render() {

    const {
      isFetchingAdGroupStat,
      hasFetchedAdGroupStat,
      adGroupStat,
      isFetchingMediaStat,
      hasFetchedMediaStat,
      mediaStat,
      intl: {
        formatMessage
      }
    } = this.props;

    const items = [
      {
        title: formatMessage(messages.dashboardOverview),
        display: <DisplayStackedAreaChart isFetchingCampaignStat={isFetchingAdGroupStat} hasFetchedCampaignStat={hasFetchedAdGroupStat} dataSource={adGroupStat} />
      },
      {
        title: formatMessage(messages.dashboardTopSites),
        display: <MediaPerformanceTable isFetchingMediaStat={isFetchingMediaStat} hasFetchedMediaStat={hasFetchedMediaStat} dataSet={mediaStat} />
      }
    ];

    return <Card><McsTabs items={items} /></Card>;
  }

}

AdGroupDashboard.propTypes = {
  isFetchingAdGroupStat: PropTypes.bool.isRequired,
  hasFetchedAdGroupStat: PropTypes.bool.isRequired,
  adGroupStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  mediaStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetchingMediaStat: PropTypes.bool.isRequired,
  hasFetchedMediaStat: PropTypes.bool.isRequired,
  intl: intlShape.isRequired
};


AdGroupDashboard = compose(
  injectIntl,
  withRouter
)(AdGroupDashboard);

export default AdGroupDashboard;
