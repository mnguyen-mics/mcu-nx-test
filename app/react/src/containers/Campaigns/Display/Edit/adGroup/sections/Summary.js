import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormattedNumber, FormattedPlural } from 'react-intl';
import { Col, Row } from 'antd';


import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';
import { formatMetric } from '../../../../../../utils/MetricHelper';

function Summary({ formatMessage, formValues }) {

  const {
    adGroupStartDate,
    adGroupEndDate,
    adGroupMaxBudgetPeriod,
    adGroupMaxBudgetPerPeriod,
    audienceTable,
    publisherTable,
    optimizerTable,
    adTable,
  } = formValues;

  /* Format data */
  const formatCalendarDate = (date) => moment(date).locale('fr').format('L');
  const filterIncludedElements = (table = [], bool) => table.filter(elem => !elem.toBeRemoved && elem.include === bool);
  const filterTable = (table = []) => table.filter(elem => !elem.toBeRemoved);
  const stringifyTableElements = (table = [], key) => table.reduce((acc, element, i) => (
    `${acc}${`${i > 0 && i < table.length ? ',' : ''} ${element[key]}`}`
  ), '');
  const formatPeriod = {
    'Per Day': formatMessage(messages.contentSection8Part1Group6OptionDAY),
    'Per Week': formatMessage(messages.contentSection8Part1Group6OptionWEEK),
    'Per Month': formatMessage(messages.contentSection8Part1Group6OptionMONTH),
  };

  /* Data to display */
  const nothingToDisplay = formatMessage(messages.noResults);
  const startIsToday = moment().diff(adGroupStartDate, 'days') === 0;
  const startDate = adGroupStartDate && formatCalendarDate(adGroupStartDate);
  const endDate = adGroupEndDate && formatCalendarDate(adGroupEndDate);
  const period = formatPeriod[adGroupMaxBudgetPeriod];
  const budgetPerPeriod = `${(adGroupMaxBudgetPerPeriod
    ? formatMetric(adGroupMaxBudgetPerPeriod, '0,0')
    : nothingToDisplay
  )}${formatMessage(messages.contentSection8Part1Group8)}`;
  const includedSegments = stringifyTableElements(filterIncludedElements(audienceTable, true), 'name');
  const excludedSegments = stringifyTableElements(filterIncludedElements(audienceTable, false), 'name');
  const publishers = stringifyTableElements(filterTable(publisherTable), 'display_network_name');
  const optimizers = stringifyTableElements(filterTable(optimizerTable), 'provider');
  const numberOfCreatives = 0; // TODO : remove static number of creatives

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
              {startDate && startIsToday
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

          <Section>
            {formatMessage(messages.contentSection8Part2)}
            <P blue>{includedSegments}</P>
          </Section>

          <Section>
            {formatMessage(messages.contentSection8Part3)}
            <P blue>{excludedSegments}</P>
          </Section>

          {adTable && <Section>
            {formatMessage(messages.contentSection8Part4)}
            <P blue>XXX</P>
          </Section>}

          {adTable && <Section>
            {formatMessage(messages.contentSection8Part5)}
            <P blue>XXX</P>
          </Section>}

          <Section>
            {formatMessage(messages.contentSection8Part6)}
            <P blue>{publishers}</P>
          </Section>

          {adTable && <Section>
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

Summary.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape({}).isRequired,
};

export default Summary;
