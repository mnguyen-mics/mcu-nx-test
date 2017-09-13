import React, { Component } from 'react';
import { compose } from 'recompose';
import moment from 'moment';
import { injectIntl, intlShape } from 'react-intl';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import ReportService from '../../../../../services/ReportService';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import messages from '../messages';

class EditAdGroupPage extends Component {

  state = {
    initialValues: {}
  }

  componentDidMount() {
    let initialSegments;
    const {
      intl: { formatMessage },
      match: {
        params: { adGroupId, campaignId, organisationId },
      },
    } = this.props;

    const formatBudgetPeriod = {
      DAY: formatMessage(messages.contentSection1Row2Option1),
      WEEK: formatMessage(messages.contentSection1Row2Option2),
      MONTH: formatMessage(messages.contentSection1Row2Option3),
    };

    DisplayCampaignService.getAdGroup(campaignId, adGroupId)
      .then(({ data }) => {
        return this.setState({
          initialValues: {
            adGroupName: data.name,
            adGroupBudgetSplit: data.max_budget_per_period,
            adGroupBudgetSplitPeriod: formatBudgetPeriod[data.max_budget_period],
            adGroupBudgetTotal: data.total_budget,
            adGroupBudgetStartDate: moment(data.start_date),
            adGroupBudgetEndDate: moment(data.end_date),
            adGroupTechnicalName: data.technical_name || '',
          }
        });
      })
      .then(() => {
        return DisplayCampaignService.getSegments(campaignId, adGroupId);
      })
      .then((segments) => {
        initialSegments = segments;

        return ReportService.getAudienceSegmentReport(
          organisationId,
          moment().subtract(1, 'days'),
          moment(),
          'audience_segment_id',
        );
      })
      .then((results) => {
        const metadata = normalizeArrayOfObject(
          normalizeReportView(results.data.report_view),
          'audience_segment_id',
        );

        const segmentsWithAdditionalMetadata = initialSegments.map(segment => {
          const { user_points, desktop_cookie_ids } = metadata[segment.audience_segment_id];
          const { technical_name, exclude, ...relevantData } = segment;

          return {
            ...relevantData,
            desktop_cookie_ids,
            target: !exclude,
            toBeRemoved: false,
            user_points,
          };
        });

        return this.setState({
          initialValues: {
            ...this.state.initialValues,
            audienceTable: segmentsWithAdditionalMetadata
          }
        });
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
