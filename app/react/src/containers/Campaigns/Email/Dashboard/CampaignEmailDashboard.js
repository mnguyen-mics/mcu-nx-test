import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { McsTabs } from '../../../../components/McsTabs';
import { EmailPieCharts, EmailStackedAreaChart } from './Charts';
import { withTranslations } from '../../../Helpers';

class CampaignEmailDashboard extends Component {

  render() {

    const {
      translations,
    } = this.props;

    const items = [
      {
        title: translations.CAMPAIGN_OVERVIEW,
        display: <EmailPieCharts />
      },
      {
        title: translations.CAMPAIGN_DELIVERY_ANALYSIS,
        display: <EmailStackedAreaChart />
      }
    ];

    return <McsTabs items={items} />;
  }

}

CampaignEmailDashboard.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired
};

CampaignEmailDashboard = compose(
  withTranslations,
  withRouter
)(CampaignEmailDashboard);

export default CampaignEmailDashboard;
