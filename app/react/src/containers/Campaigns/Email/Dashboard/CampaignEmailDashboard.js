import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import { CampaignDashboardTabs } from '../../../../components/CampaignDashboardTabs';
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

    return <CampaignDashboardTabs items={items} />;
  }

}

CampaignEmailDashboard.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired
};

CampaignEmailDashboard = compose(
  withTranslations
)(CampaignEmailDashboard);

export default CampaignEmailDashboard;
