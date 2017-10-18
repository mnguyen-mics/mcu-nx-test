import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { camelCase } from 'lodash';

import withDrawer from '../../../../../components/Drawer';
import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';

import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import BidOptimizerServices from '../../../../../services/BidOptimizerServices';


class EditAdGroupPage extends Component {

  state = {
    initialValues: {},
    loading: true,
  }

  componentDidMount() {
    const { adGroupId, campaignId, organisationId } = this.props.match.params;

    Promise.all([
      this.getGeneralInfo({ adGroupId, campaignId }),
      this.getPublishers({ campaignId }),
      this.getSegments({ adGroupId, campaignId, organisationId }),
      // this.getLocations({ adGroupId }),
    ])
      .then((results) => {
        const {
          adGroupBidOptimizerId,
          ...initialValues
        } = results.reduce((acc, result) => ({ ...acc, ...result }), {});

        this.setState({ initialValues });

        return BidOptimizerServices.getBidOptimizers({ organisationId, selectedIds: [adGroupBidOptimizerId] });
      })
      .then(({ data }) => {
        this.setState({
          initialValues: { ...this.state.initialValues, optimizerTable: data },
          loading: false,
        });
      });
  }

  getGeneralInfo({ campaignId, adGroupId }) {
    return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
      .then((results) => Object.keys(results).reduce((acc, key) => ({
        ...acc,
        [camelCase(`adGroup-${key}`)]: results[key]
      }), {})
      );
  }

  getPublishers({ campaignId }) {
    return DisplayCampaignService.getPublishers({ campaignId })
      .then(publisherTable => ({ publisherTable }));
  }

  getLocations({ apGroupId }) {
    return DisplayCampaignService.getLocations({ apGroupId })
      .then(locationAndTargetingTable => ({ locationAndTargetingTable }));
  }

  getSegments({ adGroupId, campaignId, organisationId }) {
    const fetchSegments = DisplayCampaignService.getAudiences(campaignId, adGroupId);
    const fetchMetadata = AudienceSegmentService.getSegmentMetaData(organisationId);

    return Promise.all([fetchSegments, fetchMetadata])
      .then((results) => {
        const segments = results[0];
        const metadata = results[1];

        return segments.map(segment => {
          const { desktop_cookie_ids, user_points } = metadata[segment.id];

          return { ...segment, desktop_cookie_ids, user_points };
        });
      })
      .then(audienceTable => ({ audienceTable }));
  }

  render() {
    return (
      <AdGroupContent
        closeNextDrawer={this.props.closeNextDrawer}
        editionMode
        initialValues={this.state.initialValues}
        loading={this.state.loading}
        openNextDrawer={this.props.openNextDrawer}
      />
    );
  }
}

EditAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  withDrawer,
)(EditAdGroupPage);
