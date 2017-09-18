import React, { Component } from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { filterEmptyValues, formatKeysToPascalCase } from '../../../../../utils/ReduxFormHelper';
import messages from '../messages';

import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import {
  getAdGroup,
  getSegments,
  getPublishers,
} from '../../../../../services/DisplayCampaignService';
import { getBidOptimizers } from '../../../../../services/BidOptimizerServices';


class EditAdGroupPage extends Component {

  state = {
    initialValues: {}
  }

  componentDidMount() {
    const {
      match: {
        params: { adGroupId, campaignId, organisationId },
      },
    } = this.props;

    Promise.all([
      this.getGeneralInfo({ adGroupId, campaignId }),
      this.getPublishers({ campaignId }),
      this.getSegments({ adGroupId, campaignId, organisationId }),
    ])
      .then((results) => {
        const initialValues = results.reduce((acc, result) => ({ ...acc, ...result }), {});
        const reqParams = {
          organisationId,
          selectedIds: [initialValues.adGroupBidOptimizerId],
        };

        this.setState({ initialValues });

        return getBidOptimizers(reqParams);
      })
      .then((bidOptimizerTable) => {
        const { initialValues } = this.state;

        this.setState({
          initialValues: { ...initialValues, bidOptimizerTable }
        });
      });
  }

  getGeneralInfo({ campaignId, adGroupId }) {
    const {
      intl: { formatMessage }
    } = this.props;

    return getAdGroup(campaignId, adGroupId)
      .then((results) => {
        const formatBudgetPeriod = {
          DAY: formatMessage(messages.contentSection1Row2Option1),
          WEEK: formatMessage(messages.contentSection1Row2Option2),
          MONTH: formatMessage(messages.contentSection1Row2Option3),
        };

        return {
          ...results,
          adGroupMaxBudgetPeriod: formatBudgetPeriod[results.adGroupMaxBudgetPeriod],
        };
      });
  }

  getPublishers({ campaignId }) {
    return getPublishers({ campaignId })
      .then(publisherTable => ({ publisherTable }));
  }

  getSegments({ adGroupId, campaignId, organisationId }) {
    let initialSegments;

    return getSegments(campaignId, adGroupId)
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
