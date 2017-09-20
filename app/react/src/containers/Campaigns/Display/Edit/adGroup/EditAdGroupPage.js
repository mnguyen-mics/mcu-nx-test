import React, { Component } from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import messages from '../messages';

import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import BidOptimizerServices from '../../../../../services/BidOptimizerServices';


class EditAdGroupPage extends Component {

  state = {
    initialValues: {}
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
      .then((optimizerTable) => {
        this.setState({ initialValues: { ...this.state.initialValues, optimizerTable } });
      });
  }

  getGeneralInfo({ campaignId, adGroupId }) {
    return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
      .then((results) => {
        if (!results.adGroupMaxBudgetPeriod) {
          return results;
        }

        return {
          ...results,
          adGroupMaxBudgetPeriod: this.props.intl.formatMessage(
            messages[`contentSection1Row2Option${results.adGroupMaxBudgetPeriod}`]
          ),
        };
      });
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
        editionMode
        initialValues={this.state.initialValues}
      />
    );
  }
}

EditAdGroupPage.propTypes = {
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
)(EditAdGroupPage);
