import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import McsTabs from '../../../../components/McsTabs.tsx';
import { Card } from '../../../../components/Card/index.ts';
import { EmailPieCharts, EmailStackedAreaChart } from './Charts';
import { withTranslations } from '../../../Helpers';

function EmailCampaignDashboard({ translations }) {

  const items = [
    {
      title: translations.CAMPAIGN_OVERVIEW,
      display: <EmailPieCharts />,
    },
    {
      title: translations.CAMPAIGN_DELIVERY_ANALYSIS,
      display: <EmailStackedAreaChart />,
    },
  ];

  return <Card><McsTabs items={items} /></Card>;
}

EmailCampaignDashboard.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default compose(
  withTranslations,
)(EmailCampaignDashboard);
