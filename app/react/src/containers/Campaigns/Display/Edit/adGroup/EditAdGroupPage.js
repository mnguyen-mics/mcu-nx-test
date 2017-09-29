import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import { camelCase } from 'lodash';

import withDrawer from '../../../../../components/Drawer';
import AdGroupContent from './AdGroupContent';
import { LoadingChart } from '../../../../../components/EmptyCharts';
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
    return (this.state.loading
      ? <LoadingChart />
      : <AdGroupContent
        closeNextDrawer={this.props.closeNextDrawer}
        editionMode
        initialValues={this.state.initialValues}
        openNextDrawer={this.props.openNextDrawer}
      />
    );
  }
}

EditAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  withDrawer,
  injectIntl,
)(EditAdGroupPage);
