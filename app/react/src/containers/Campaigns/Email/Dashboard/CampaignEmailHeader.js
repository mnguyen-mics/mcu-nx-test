import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { TitleAndStatusHeader } from '../../../../components/TitleAndStatusHeader';

class CampaignEmailHeader extends Component {

  render() {

    const {
      campaignEmail: {
        name: campaignEmailName,
        status: campaignEmailStatus
      }
    } = this.props;

    const campaignEmailStatusHeader = {
      value: campaignEmailStatus,
      translationKeyPrefix: 'CAMPAIGN_STATUS'
    };

    return campaignEmailName ? (
      <div className="mcs-campaign-header">
        <TitleAndStatusHeader headerTitle={campaignEmailName} headerStatus={campaignEmailStatusHeader} />
      </div>
    ) : null;

  }

}

CampaignEmailHeader.propTypes = {
  campaignEmail: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  campaignEmail: state.campaignEmailSingle.campaignEmailApi.campaignEmail,
});

const mapDispatchToProps = {};

CampaignEmailHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailHeader);

export default CampaignEmailHeader;
