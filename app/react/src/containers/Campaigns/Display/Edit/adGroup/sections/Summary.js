import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber, FormattedPlural } from 'react-intl';
import { Col, Row } from 'antd';

import { FormSection } from '../../../../../../components/Form/index.ts';
import messages from '../../messages';
import { formatMetric } from '../../../../../../utils/MetricHelper';
import { isToday, formatCalendarDate } from '../../../../../../utils/DateHelper';
import {
  filterTableByIncludeStatus,
  filterTableByRemovedStatus,
  stringifyTable,
} from '../../../../../../utils/TableUtils';

function Summary({ displayAudience, formatMessage, formValues }) {

  const {
    adGroupStartDate,
    adGroupEndDate,
    adGroupMaxBudgetPeriod,
    adGroupMaxBudgetPerPeriod,
    ads,
    areas,
    audienceTable,
    devices,
    optimizerTable,
    publisherTable,
  } = formValues;

  /* Format data */
  const formatPeriod = {
    DAY: formatMessage(messages.contentSection8Part1Group6OptionDAY),
    WEEK: formatMessage(messages.contentSection8Part1Group6OptionWEEK),
    MONTH: formatMessage(messages.contentSection8Part1Group6OptionMONTH),
  };

  /* Data to display */
  const nothingToDisplay = formatMessage(messages.noResults);
  const startDate = adGroupStartDate && formatCalendarDate(adGroupStartDate);
  const endDate = adGroupEndDate && formatCalendarDate(adGroupEndDate);
  const period = formatPeriod[adGroupMaxBudgetPeriod];
  const budgetPerPeriod = `${(adGroupMaxBudgetPerPeriod
    ? formatMetric(adGroupMaxBudgetPerPeriod, '0,0')
    : nothingToDisplay
  )}${formatMessage(messages.contentSection8Part1Group8)}`;
  const includedSegments = stringifyTable(filterTableByIncludeStatus(audienceTable, true), 'name');
  const excludedSegments = stringifyTable(filterTableByIncludeStatus(audienceTable, false), 'name');
  const publishers = stringifyTable(filterTableByRemovedStatus(publisherTable), 'display_network_name');
  const optimizers = stringifyTable(filterTableByRemovedStatus(optimizerTable), 'provider');
  const numberOfCreatives = (ads ? ads.filter(ad => !ad.toBeRemoved).length : 0);

  /* JSX */
  const Section = ({ children }) => (
    <div className="section sectionPaddingTop">
      <Row className="textPadding"><Col span={16}>{children}</Col></Row>
    </div>
  );
  const Span = ({ children, blue }) => (  // eslint-disable-line
    <span className={blue ? 'blue-text text' : 'text'}>{children || nothingToDisplay}</span>
  );
  const P = ({ children, blue }) => ( // eslint-disable-line
    <p className={blue ? 'blue-text text' : 'text'}>{children || nothingToDisplay}</p>
  );

  return (
    <div id="summary" className="summarySection">
      <FormSection
        subtitle={messages.sectionSubtitle8}
        title={messages.sectionTitle8}
      />
      <Row className="content">
        <Col span={16}>
          <Section>
            <div>
              <Span>{formatMessage(messages.contentSection8Part1Group1)}</Span>
              {startDate && isToday(adGroupStartDate)
                  ? <Span blue>{formatMessage(messages.contentSection8Part1Group3)}</Span>
                  : <span>
                    <Span>{formatMessage(messages.contentSection8Part1Group2)}</Span>
                    <Span blue>{startDate}</Span>
                  </span>
                }
              <Span>{formatMessage(messages.contentSection8Part1Group4)}</Span>
              <Span blue>{endDate}</Span>
              <Span>{formatMessage(messages.contentSection8Part1Group5)}</Span>
              <Span blue>{period}</Span>
              <Span>{formatMessage(messages.contentSection8Part1Group7)}</Span>
              <Span blue>{budgetPerPeriod}</Span>
            </div>
          </Section>

          {displayAudience && <Section>
            {formatMessage(messages.contentSection8Part2)}
            <P blue>{includedSegments}</P>
          </Section>}

          {displayAudience && <Section>
            {formatMessage(messages.contentSection8Part3)}
            <P blue>{excludedSegments}</P>
          </Section>}

          {devices && <Section>
            {formatMessage(messages.contentSection8Part4)}
            <P blue>XXX</P>
          </Section>}

          {areas && <Section>
            {formatMessage(messages.contentSection8Part5)}
            <P blue>XXX</P>
          </Section>}

          <Section>
            {formatMessage(messages.contentSection8Part6)}
            <P blue>{publishers}</P>
          </Section>

          {false && <Section>
            {formatMessage(messages.contentSection8Part7)}
            <P blue>XXX</P>
          </Section>}

          <Section>
            {formatMessage(messages.contentSection8Part8)}
            <P blue>{optimizers}</P>
          </Section>

          <div className="sectionPaddingTop textPadding">
            <Span>{formatMessage(messages.contentSection8Part9Group1)}</Span>
            {numberOfCreatives
              ? (
                <span>
                  <Span blue><FormattedNumber value={numberOfCreatives} /></Span>
                  <Span>
                    <FormattedPlural
                      value={numberOfCreatives}
                      one={formatMessage(messages.contentSection8Part9Singular)}
                      other={formatMessage(messages.contentSection8Part9Plural)}
                    />
                  </Span>
                </span>
              )
              : (
                <span>
                  <Span blue>{formatMessage(messages.contentSection8Part9Negation)}</Span>
                  <Span>{formatMessage(messages.contentSection8Part9Singular)}</Span>
                </span>
              )
            }
            <Span>{formatMessage(messages.contentSection8Part9Group2)}</Span>
          </div>
        </Col>
      </Row>
    </div>
  );
}

Summary.defaultProps = {
  displayAudience: false,
};

Summary.propTypes = {
  displayAudience: PropTypes.bool,
  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape({}).isRequired,
};

export default Summary;
