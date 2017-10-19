import React from 'react';
import PropTypes from 'prop-types';

import TitleAndStatusHeader from '../../../../../components/TitleAndStatusHeader.tsx';

function DisplayCampaignHeader({
  object: {
    name: displayCampaignName,
    status: displayCampaignStatus,
  },
  translationKey,
}) {

  const displayCampaignStatusHeader = {
    value: displayCampaignStatus,
    translationKeyPrefix: `${translationKey}_STATUS`,
  };

  return displayCampaignName ? (
    <div className="mcs-campaign-header">
      <TitleAndStatusHeader
        headerTitle={displayCampaignName}
        headerStatus={displayCampaignStatusHeader}
      />
    </div>
    ) : (
      <div className="mcs-campaign-header">
        <i className="mcs-table-cell-loading-large" />
      </div>);

}

DisplayCampaignHeader.propTypes = {
  translationKey: PropTypes.string.isRequired,
  object: PropTypes.shape().isRequired,
};

export default DisplayCampaignHeader;
