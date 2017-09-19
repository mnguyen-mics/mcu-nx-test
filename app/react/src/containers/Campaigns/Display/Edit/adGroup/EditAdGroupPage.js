import React, { Component } from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
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
      .then((bidOptimizerTable) => {
        this.setState({ initialValues: { ...this.state.initialValues, bidOptimizerTable } });
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
    let initialSegments;

    return DisplayCampaignService.getSegments(campaignId, adGroupId)
      .then((segments) => {
        initialSegments = segments;

        return AudienceSegmentService.getSegmentMetaData(organisationId);
      })
      .then((results) => {
        const metadata = normalizeArrayOfObject(
          normalizeReportView(results),
          'audience_segment_id',
        );

        const audienceTable = initialSegments.map(segment => {
          const { user_points, desktop_cookie_ids } = metadata[segment.audience_segment_id];
          const { technical_name, exclude, ...relevantData } = segment;

          return {
            ...relevantData,
            desktop_cookie_ids,
            include: !exclude,
            toBeRemoved: false,
            user_points,
          };
        });

        return { audienceTable };
      });
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
