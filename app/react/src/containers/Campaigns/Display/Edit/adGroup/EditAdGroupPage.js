import React, { Component } from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
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
    Promise.all([
      this.getGeneralInfo(),
      this.getSegments()
    ])
      .then((results) => {
        const initialValues = results.reduce((acc, result) => ({
          ...acc,
          ...result
        }), {});

        this.setState({ initialValues });
      });
  }

  getGeneralInfo() {
    const {
      intl: { formatMessage },
      match: {
        params: { adGroupId, campaignId },
      },
    } = this.props;

    const formatBudgetPeriod = {
      DAY: formatMessage(messages.contentSection1Row2Option1),
      WEEK: formatMessage(messages.contentSection1Row2Option2),
      MONTH: formatMessage(messages.contentSection1Row2Option3),
    };

    return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
      .then(({ data }) => {
        return {
          adGroupName: data.name,
          adGroupBudgetSplit: data.max_budget_per_period,
          adGroupBudgetSplitPeriod: formatBudgetPeriod[data.max_budget_period],
          adGroupBudgetTotal: data.total_budget,
          adGroupBudgetStartDate: moment(data.start_date),
          adGroupBudgetEndDate: moment(data.end_date),
          adGroupTechnicalName: data.technical_name || '',
        };
      });
  }

  getSegments() {
    let initialSegments;
    const {
      match: {
        params: { adGroupId, campaignId, organisationId },
      },
    } = this.props;

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
