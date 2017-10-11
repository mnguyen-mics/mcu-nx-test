import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TitleAndStatusHeader from '../../../../components/TitleAndStatusHeader.tsx';

class EmailCampaignHeader extends Component {

  render() {

    const {
      emailCampaign: {
        name: emailCampaignName,
        status: emailCampaignStatus
      }
    } = this.props;

    const emailCampaignStatusHeader = {
      value: emailCampaignStatus,
      translationKeyPrefix: 'CAMPAIGN_STATUS'
    };

    return emailCampaignName ? (
      <div className="mcs-campaign-header">
        <TitleAndStatusHeader headerTitle={emailCampaignName} headerStatus={emailCampaignStatusHeader} />
      </div>
    ) : null;

  }

}

EmailCampaignHeader.propTypes = {
  emailCampaign: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  emailCampaign: state.emailCampaignSingle.emailCampaignApi.emailCampaign,
});

EmailCampaignHeader = connect(
  mapStateToProps
)(EmailCampaignHeader);

export default EmailCampaignHeader;
