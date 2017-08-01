import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LabelListView from '../../../../components/LabelListView';

import * as LabelsActions from '../../../../state/Labels/actions';
import * as EmailsActions from '../../../../state/Campaign/Email/actions';


class CampaignEmailLabels extends Component {

  constructor(props) {
    super(props);
    this.buildFilters = this.buildFilters.bind(this);
    this.onClickOnCloseLabel = this.onClickOnCloseLabel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const {
      params: {
        campaignId,
      },
      activeWorkspace: {
        organisationId,
      },
      getLabels,
      getLabelsOfObject,
    } = this.props;
    getLabels(organisationId);
    getLabelsOfObject(organisationId, 'EMAIL_CAMPAIGN', campaignId);
  }

  render() {

    const {
      labels,
      attachedLabels,
    } = this.props;

    return (
      <div className="mcs-campaign-labels">
        <LabelListView
          filters={attachedLabels.data}
          onClickOnClose={this.onClickOnCloseLabel}
          onInputSubmit={this.onSubmit}
          isInputVisible
          listItems={labels.data}
        />
      </div>
    );

  }

  buildFilters() {

    // const {
    //   campaignEmail
    // } = this.props;

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
      activeWorkspace: {
        organisationId,
      },
      unPairLabelWithObject,
      params: {
        campaignId,
      },
    } = this.props;
    unPairLabelWithObject(label.id, organisationId, 'EMAIL_CAMPAIGN', campaignId);
  }

  onSubmit(value) {
    const {
      activeWorkspace: {
        organisationId,
      },
      createLabels,
      campaignEmail,
      pairLabelWithObject,
    } = this.props;

    if (value === 'CREATE_NEW') {
      createLabels(value, organisationId);
    } else {
      pairLabelWithObject(value, organisationId, 'EMAIL_CAMPAIGN', campaignEmail.id);
    }
  }

}

CampaignEmailLabels.propTypes = {
  campaignEmail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getLabels: PropTypes.func.isRequired,
  createLabels: PropTypes.func.isRequired,
  pairLabelWithObject: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    isFetching: PropTypes.bool,
    data: PropTypes.arrayOf({
      id: PropTypes.number,
      organisation_id: PropTypes.number,
      name: PropTypes.string,
    }),
    total: PropTypes.number,
    count: PropTypes.number,
    first_result: PropTypes.number,
    max_result: PropTypes.number,
  }).isRequired,
  getLabelsOfObject: PropTypes.func.isRequired,
  params: PropTypes.shape({
    campaignId: PropTypes.string,
  }).isRequired,
  attachedLabels: PropTypes.arrayOf(PropTypes.shape({
    isFetching: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  })).isRequired,
  unPairLabelWithObject: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  params: ownProps.router.params,
  query: ownProps.router.location.query,
  activeWorkspace: state.sessionState.activeWorkspace,
  campaignEmail: state.campaignEmailSingle.campaignEmailApi.campaignEmail,
  labels: state.labels.labelsApi,
  attachedLabels: state.labels.labelsAttachedApi,
});

const mapDispatchToProps = {
  getLabels: LabelsActions.fetchAllLabels.request,
  createLabels: LabelsActions.createLabels.request,
  pairLabelWithObject: LabelsActions.pairLabelWithObject.request,
  unPairLabelWithObject: LabelsActions.unPairLabelWithObject.request,
  fetchCampaignEmail: EmailsActions.fetchCampaignEmail.request,
  getLabelsOfObject: LabelsActions.fetchLabelsOfObjects.request,
};

CampaignEmailLabels = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CampaignEmailLabels);

export default CampaignEmailLabels;
