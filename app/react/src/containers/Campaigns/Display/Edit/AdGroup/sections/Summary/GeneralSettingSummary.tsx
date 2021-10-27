import * as React from 'react';
import { AdGroupFormData, AD_GROUP_FORM_NAME } from '../../domain';
import { getFormValues } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { AdGroupResource } from '../../../../../../../models/campaign/display/index';
import { BudgetPeriod } from '../../../../../../../models/campaign/constants/index';
import { formatUnixTimestamp } from '../../../../../../../utils/DateHelper';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

interface MapStateProps {
  adGroup: Partial<AdGroupResource>;
}

type Props = MapStateProps & InjectedIntlProps;

class GeneralSettingSummary extends React.Component<Props> {
  render() {
    const { adGroup, intl } = this.props;

    return (
      <div>
        <FormattedMessage
          id='display.campaign.edit.adGroup.generalSettingSummary.scheduleDate'
          defaultMessage={`Your ad group will run from 
          the { startDate } to the { endDate }`}
          values={{
            startDate: (
              <span className='info-color'>{formatUnixTimestamp(adGroup.start_date)}</span>
            ),
            endDate: <span className='info-color'>{formatUnixTimestamp(adGroup.end_date)}</span>,
          }}
        />
        <br />
        <FormattedMessage
          id='display.campaign.edit.adGroup.generalSettingSummary.bugetPeriod'
          defaultMessage={`Your ad group will run with a { budgetPeriod } budget of { budgetAmount }`}
          values={{
            budgetPeriod: (
              <span className='info-color'>
                {intl.formatMessage(budgetPeriodMessageMap[adGroup.max_budget_period || 'DAY'])}
              </span>
            ),
            budgetAmount: (
              <span className='info-color'>
                {adGroup.max_budget_per_period
                  ? intl.formatNumber(adGroup.max_budget_per_period, {
                      style: 'currency',
                      currency: 'EUR', // TODO get currency from campaign theoricaly
                      currencyDisplay: 'symbol',
                    })
                  : '--'}
              </span>
            ),
          }}
        />
      </div>
    );
  }
}

const getAdGroupFormData = (state: MicsReduxState): AdGroupFormData => {
  return getFormValues(AD_GROUP_FORM_NAME)(state) as AdGroupFormData;
};

export default compose(
  injectIntl,
  connect((state: MicsReduxState) => ({
    adGroup: getAdGroupFormData(state).adGroup,
  })),
)(GeneralSettingSummary);

const budgetPeriodMessageMap: {
  [key in BudgetPeriod]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  DAY: {
    id: 'adgroup-budget-period-day',
    defaultMessage: 'DAILY',
  },
  WEEK: {
    id: 'adgroup-budget-period-week',
    defaultMessage: 'WEEKLY',
  },
  MONTH: {
    id: 'adgroup-budget-period-month',
    defaultMessage: 'MONTHLY',
  },
});
