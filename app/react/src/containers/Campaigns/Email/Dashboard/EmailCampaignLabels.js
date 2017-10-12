import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LabelListView from '../../../../components/LabelListView.tsx';

import * as LabelsActions from '../../../../state/Labels/actions';
import * as EmailsActions from '../../../../state/Campaign/Email/actions';


class EmailCampaignLabels extends Component {

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

  buildFilters = () => {
    // const {
    //   emailCampaign
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

  onClickOnCloseLabel = (label) => {
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

  onSubmit = (value) => {
    const {
      activeWorkspace: {
        organisationId,
      },
      createLabels,
      emailCampaign,
      pairLabelWithObject,
    } = this.props;

    if (value === 'CREATE_NEW') {
      createLabels(value, organisationId);
    } else {
      pairLabelWithObject(value, organisationId, 'EMAIL_CAMPAIGN', emailCampaign.id);
    }
  }

}

EmailCampaignLabels.propTypes = {
  emailCampaign: PropTypes.shape().isRequired,
  activeWorkspace: PropTypes.shape().isRequired,
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
    data: PropTypes.shape(),
  })).isRequired,
  unPairLabelWithObject: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  params: ownProps.router.params,
  query: ownProps.router.location.query,
  activeWorkspace: state.sessionState.activeWorkspace,
  emailCampaign: state.emailCampaignSingle.emailCampaignApi.emailCampaign,
  labels: state.labels.labelsApi,
  attachedLabels: state.labels.labelsAttachedApi,
});

const mapDispatchToProps = {
  getLabels: LabelsActions.fetchAllLabels.request,
  createLabels: LabelsActions.createLabels.request,
  pairLabelWithObject: LabelsActions.pairLabelWithObject.request,
  unPairLabelWithObject: LabelsActions.unPairLabelWithObject.request,
  fetchEmailCampaign: EmailsActions.fetchEmailCampaign.request,
  getLabelsOfObject: LabelsActions.fetchLabelsOfObjects.request,
};

EmailCampaignLabels = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailCampaignLabels);

export default EmailCampaignLabels;
