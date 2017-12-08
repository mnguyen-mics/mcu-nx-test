import React from 'react';
import PropTypes from 'prop-types';

import TitleAndStatusHeader from '../../../components/TitleAndStatusHeader.tsx';

function DashboardHeader({
  object: {
    name: displayCampaignName
  },
  translationKey,
}) {

  return displayCampaignName ? (
    <div className="mcs-campaign-header">
      <TitleAndStatusHeader
        headerTitle={displayCampaignName}
      />
    </div>
    ) : (
      <div className="mcs-campaign-header">
        <i className="mcs-table-cell-loading-large" />
      </div>);

}

DashboardHeader.propTypes = {
  translationKey: PropTypes.string.isRequired,
  object: PropTypes.shape().isRequired,
};

export default DashboardHeader;
