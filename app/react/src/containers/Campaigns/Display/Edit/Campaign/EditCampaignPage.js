import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import CampaignContent from './CampaignContent';
import withDrawer from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService.ts';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import log from '../../../../../utils/Logger';
import * as AdGroupWrapper from '../../../../../formServices/AdGroupServiceWrapper';


class EditCampaignPage extends Component {

  state = {
    initialValues: {},
    loading: true,
  }

  componentDidMount() {
    const { campaignId, organisationId } = this.props.match.params;
    this.fetchAll(campaignId, organisationId);
  }

  componentWillReceiveProps(nextProps) {
    const { campaignId, organisationId } = this.props.match.params;
    const { campaignId: nextCampaignId, organisationId: nextOrganisationId } = nextProps.match.params;
    if (campaignId !== nextCampaignId || organisationId !== nextOrganisationId) {
      this.fetchAll(nextCampaignId, nextOrganisationId);
    }
  }


  fetchAll = (campaignId, organisationId) => {
    Promise.all([
      this.fetchCampaignInfo(campaignId),
      this.fetchGoalsSelection(campaignId),
      this.fetchAdGroups(campaignId, organisationId)
    ])
    .then((results) => {
      this.setState({
        initialValues: { ...results[0], goalsTable: results[1], adGroupsTable: results[2] },
        loading: false,
      });
    })
    .catch(err => {
      log.error(err);
      this.setState({ loading: false });
      this.props.notifyError(err);
    });
  }

  fetchCampaignInfo = (campaignId) => {
    return DisplayCampaignService.getCampaignDisplay(campaignId).then(data => data.data);
  }

  fetchGoalsSelection = (campaignId) => {
    return DisplayCampaignService.getGoal(campaignId)
      .then(data => data.data)
      .then(data => data.map(item => {
        const newItem = item;
        newItem.main_id = item.goal_id;
        return newItem;
      }));
  }

  fetchAdGroups = (campaignId, organisationId) => {
    return AdGroupWrapper.getAdGroups(organisationId, campaignId)
    .then(data => data.map(item => {
      const newItem = item;
      newItem.main_id = item.id;
      return newItem;
    }));
  }


  render() {
    const {
      closeNextDrawer,
      openNextDrawer,
    } = this.props;

    return (
      <CampaignContent
        closeNextDrawer={closeNextDrawer}
        openNextDrawer={openNextDrawer}
        editionMode
        initialValues={this.state.initialValues}
        loading={this.state.loading}
      />
    );
  }
}

EditCampaignPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
};


export default compose(
  withMcsRouter,
  withDrawer,
  connect(
    undefined,
    { notifyError: NotificationActions.notifyError }
  )
)(EditCampaignPage);
