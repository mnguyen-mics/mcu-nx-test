import React, { Component } from 'react';
import { compose } from 'recompose';
import moment from 'moment';
import { injectIntl, intlShape } from 'react-intl';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import messages from '../messages';

class EditAdGroupPage extends Component {

  state = {
    initialValues: {}
  }

  componentDidMount() {
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

    DisplayCampaignService.getAdGroup(campaignId, adGroupId)
      .then(({ data }) => {
        this.setState({
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
  injectIntl
)(EditAdGroupPage);
