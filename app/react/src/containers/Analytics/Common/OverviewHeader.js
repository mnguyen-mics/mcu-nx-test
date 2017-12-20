import React from 'react';
import PropTypes from 'prop-types';

import TitleAndStatusHeader from '../../../components/TitleAndStatusHeader.tsx';

function OverviewHeader({
  object: {
    name: displayCampaignName
  },
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

OverviewHeader.propTypes = {
  object: PropTypes.shape().isRequired,
};

export default OverviewHeader;
