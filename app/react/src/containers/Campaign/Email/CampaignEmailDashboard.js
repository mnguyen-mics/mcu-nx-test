import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { CampaignDashboardTabs } from '../../../components/CampaignDashboardTabs';

class CampaignEmailDashboard extends Component {

  render() {

    const {
      translations
    } = this.props;

    const items = [
      {
        title: translations.CAMPAIGN_OVERVIEW,
        display: null
      },
      {
        title: translations.CAMPAIGN_DELIVERY_ANALYSIS,
        display: null
      }
    ];

    return <CampaignDashboardTabs items={items} />;
  }

}

CampaignEmailDashboard.propTypes = {
  translations: PropTypes.object.isRequired  // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations
});

const mapDispatchToProps = {};

CampaignEmailDashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailDashboard);

export default CampaignEmailDashboard;
