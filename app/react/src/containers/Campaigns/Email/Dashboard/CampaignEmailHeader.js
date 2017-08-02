import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TitleAndStatusHeader from '../../../../components/TitleAndStatusHeader';

function CampaignEmailHeader({
  campaignEmail: {
    name: campaignEmailName,
    status: campaignEmailStatus,
  },
}) {

  const campaignEmailStatusHeader = {
    value: campaignEmailStatus,
    translationKeyPrefix: 'CAMPAIGN_STATUS',
  };

  return (campaignEmailName
    ? (
      <div className="mcs-campaign-header">
        <TitleAndStatusHeader
          headerTitle={campaignEmailName}
          headerStatus={campaignEmailStatusHeader}
        />
      </div>
    )
    : null
  );

}

CampaignEmailHeader.propTypes = {
  campaignEmail: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  campaignEmail: state.campaignEmailSingle.campaignEmailApi.campaignEmail,
});

export default connect(
  mapStateToProps,
)(CampaignEmailHeader);
