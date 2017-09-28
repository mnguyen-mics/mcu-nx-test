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
import CreativeService from '../../../../../services/CreativeService';

class EditAdGroupPage extends Component {

  state = {
    initialValues: {},
    loading: true,
  }

  componentDidMount() {
    const { adGroupId, campaignId, organisationId } = this.props.match.params;

    Promise.all([
      this.getGeneralInfo({ adGroupId, campaignId }),
      this.getAds({ adGroupId, campaignId, organisationId }),
      this.getPublishers({ campaignId }),
      this.getSegments({ adGroupId, campaignId, organisationId }),
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

  getAds({ adGroupId, campaignId, organisationId }) {
    const fetchAllAds = CreativeService.getDisplayAds({ organisationId })
      .then(({ data }) => data);

    const fetchSelectedAds = DisplayCampaignService.getAds(campaignId, adGroupId)
      .then(({ data }) => data.map(ad => ({ id: ad.creative_id, otherId: ad.id })));

    return Promise.all([fetchAllAds, fetchSelectedAds])
      .then((results) => {
        const allAds = results[0];
        const selectedAds = results[1];
        const selectedAdIds = selectedAds.map(ad => ad.id);

        const ads = allAds
          .filter(ad => selectedAdIds.includes(ad.id))
          .map(ad => ({
            ...ad,
            otherId: (selectedAds.find(selection => selection.id === ad.id)).otherId
          }));

        return { ads };
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
