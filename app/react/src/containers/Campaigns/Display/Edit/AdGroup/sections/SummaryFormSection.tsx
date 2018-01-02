import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'antd';
import { getFormValues } from 'redux-form';

import { WhenDatamart } from '../../../../../Datamart';
import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';
import { AdGroupFormData, AD_GROUP_FORM_NAME } from '../domain';

// function printStringArray(table: string[] = []) {
//   return table.reduce(
//     (acc, strValue, i) =>
//       `${acc}${`${i > 0 && i < table.length ? ',' : ''} ${strValue}`}`,
//     '',
//   );
// }

const Section: React.SFC = props => (
  <div className="section sectionPaddingTop">
    <Row className="textPadding">
      <Col span={16}>{props.children}</Col>
    </Row>
  </div>
);

interface MapStateProps {
  adGroupFormData: AdGroupFormData;
}

type Props = MapStateProps;

class SummaryFormSection extends React.Component<Props> {
  render() {
    const { adGroupFormData } = this.props;
    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleSummary}
          title={messages.sectionTitleSummary}
        />
        <Row className="ad-group-summary-section">
          <Col span={16} className="content">
            <Section>
              <FormattedMessage
                id="ad-group-form-summary-quick-description"
                defaultMessage={`Your ad group will run from 
                the { startDate , date , full } to the { endDate , date , full } 
                with a { budgetPeriod } budget of { budgetAmount , number , currency }`}
                values={{
                  startDate: (
                    <span className="info-color">
                      {adGroupFormData.adGroup.start_date}
                    </span>
                  ),
                  endDate: (
                    <span className="info-color">
                      {adGroupFormData.adGroup.end_date}
                    </span>
                  ),
                  budgetPeriod: (
                    <span className="info-color">
                      {adGroupFormData.adGroup.max_budget_period}
                    </span>
                  ),
                  budgetAmount: (
                    <span className="info-color">
                      {adGroupFormData.adGroup.max_budget_per_period}
                    </span>
                  ),
                }}
              />
            </Section>

            <WhenDatamart>
              <Section>
                <FormattedMessage
                  id="ad-group-form-summary-included-segments"
                  defaultMessage="Your ad will be visible for the following segments:"
                />
                <p className="info-color">TODO</p>
              </Section>
            </WhenDatamart>

            <WhenDatamart>
              <Section>
                <FormattedMessage
                  id="ad-group-form-summary-excluded-segments"
                  defaultMessage="Your ad will not be published for people inside the following segment:"
                />
                <p className="info-color">TODO</p>
              </Section>
            </WhenDatamart>

            <Section>
              <FormattedMessage
                id="ad-group-form-summary-included-locations"
                defaultMessage="Your ad will target the following locations:"
              />
              <p className="info-color">TODO</p>
            </Section>

            <Section>
              <FormattedMessage
                id="ad-group-form-summary-excluded-locations"
                defaultMessage="Your ad will exclude the following locations:"
              />
              <p className="info-color">TODO</p>
            </Section>

            <Section>
              <FormattedMessage
                id="ad-group-form-summary-publishers"
                defaultMessage="Your ad will be published on the following networks:"
              />
              <p className="info-color">TODO</p>
            </Section>

            <Section>
              <FormattedMessage
                id="ad-group-form-summary-keywords"
                defaultMessage="Your ad will target on the following keyword list:"
              />
              <p className="info-color">TODO</p>
            </Section>

            <Section>
              <FormattedMessage
                id="ad-group-form-summary-optimizers"
                defaultMessage="Your ad is using the following bid optimizer:"
              />
              <p className="info-color">TODO</p>
            </Section>

            <Section>
              <FormattedMessage
                id="ad-group-form-summary-creative"
                defaultMessage={`You have { numberOfCreatives , number } 
                  { numberOfCreatives , plural, 
                    zero {creative} one {creative} other {creatives} }
                  attached to your ad group`}
                values={{
                  numberOfCreatives: (
                    <span className="info-color">
                      {adGroupFormData.adFields.length}
                    </span>
                  ),
                }}
              />
            </Section>
          </Col>
        </Row>
      </div>
    );
  }
}

const getAdGroupFormData = (state: any): AdGroupFormData => {
  return getFormValues(AD_GROUP_FORM_NAME)(state) as AdGroupFormData;
};

export default compose(
  connect(state => ({ adGroupFormData: getAdGroupFormData(state) })),
)(SummaryFormSection);

// const formatPeriod = {
//   DAY: formatMessage(messages.contentSectionSummaryPart1Group6OptionDAY),
//   WEEK: formatMessage(messages.contentSectionSummaryPart1Group6OptionWEEK),
//   MONTH: formatMessage(
//     messages.contentSectionSummaryPart1Group6OptionMONTH,
//   ),
// };

// const nothingToDisplay = formatMessage(messages.noResults);
// const startDate = adGroupStartDate && formatCalendarDate(adGroupStartDate);
// const endDate = adGroupEndDate && formatCalendarDate(adGroupEndDate);
// const period = formatPeriod[adGroupMaxBudgetPeriod];
// const budgetPerPeriod = `${
//   adGroupMaxBudgetPerPeriod
//     ? formatMetric(adGroupMaxBudgetPerPeriod, '0,0')
//     : nothingToDisplay
// }${formatMessage(messages.contentSectionSummaryPart1Group8)}`;
// const includedSegments = stringifyTable(
//   filterTableByIncludeStatus(audienceTable, true),
//   'name',
// );
// const excludedSegments = stringifyTable(
//   filterTableByIncludeStatus(audienceTable, false),
//   'name',
// );
// const publishers = stringifyTable(
//   filterTableByRemovedStatus(publisherTable),
//   'display_network_name',
// );
// const optimizers = stringifyTable(
//   filterTableByRemovedStatus(optimizerTable),
//   'provider',
// );
// const numberOfCreatives = adTable
//   ? adTable.filter(ad => !ad.toBeRemoved).length
//   : 0;

// const renderGeoname = geoname => <P blue>{geoname.name}</P>;

// const includedGeonames = filterTableByExcludeProperty(
//   locationTargetingTable,
//   false,
// ).map(id => (
//   <GeonameRenderer key={id} geonameId={id} renderMethod={renderGeoname} />
// ));

// const excludedGeonames = filterTableByExcludeProperty(
//   locationTargetingTable,
//   true,
// ).map(id => (
//   <GeonameRenderer key={id} geonameId={id} renderMethod={renderGeoname} />
// ));
