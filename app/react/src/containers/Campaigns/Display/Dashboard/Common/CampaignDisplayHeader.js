import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TitleAndStatusHeader from '../../../../../components/TitleAndStatusHeader';

class CampaignDisplayHeader extends Component {

  render() {
    const {
      object: {
        name: campaignDisplayName,
        status: campaignDisplayStatus,
      },
      translationKey,
    } = this.props;

    const campaignDisplayStatusHeader = {
      value: campaignDisplayStatus,
      translationKeyPrefix: `${translationKey}_STATUS`,
    };

    return campaignDisplayName ? (
      <div className="mcs-campaign-header">
        <TitleAndStatusHeader
          headerTitle={campaignDisplayName}
          headerStatus={campaignDisplayStatusHeader}
        />
      </div>
    ) : (
      <div className="mcs-campaign-header">
        <i className="mcs-table-cell-loading-large" />
      </div>);

  }

}

CampaignDisplayHeader.propTypes = {
  translationKey: PropTypes.string.isRequired,
  object: PropTypes.shape().isRequired,
};

export default CampaignDisplayHeader;
