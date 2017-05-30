import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { LabelListView } from '../../../components/LabelListView';

import * as CampaignEmailActions from '../../../state/Campaign/Email/actions';

class CampaignEmailLabels extends Component {

  constructor(props) {
    super(props);
    this.buildFilters = this.buildFilters.bind(this);
    this.onClickOnCloseLabel = this.onClickOnCloseLabel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {

    const filters = this.buildFilters();

    return (
      <div className="mcs-campaign-labels">
        <LabelListView
          filters={filters}
          onClickOnClose={this.onClickOnCloseLabel}
          onInputSubmit={this.onSubmit}
          isInputVisible
        />
      </div>
    );

  }

  buildFilters() {

    const {
      campaignEmail
    } = this.props;

    return {
      // test: {
      //   closable: true,
      //   data: [
      //     'ACTIVE',
      //     'PAUSED'
      //   ]
      // }
    };
  }

  onClickOnCloseLabel(label) {
    const {
      updateCampaignEmail
    } = this.props;
    // updateCampaignEmail();
  }

  onSubmit(value) {
    const {
      updateCampaignEmail
    } = this.props;
    // updateCampaignEmail();
  }

}

CampaignEmailLabels.propTypes = {
  campaignEmail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  updateCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  campaignEmail: state.campaignEmailState.campaignEmail
});

const mapDispatchToProps = {
  updateCampaignEmail: CampaignEmailActions.updateCampaignEmail.request,
};

CampaignEmailLabels = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailLabels);

export default CampaignEmailLabels;
