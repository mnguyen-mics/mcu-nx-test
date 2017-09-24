import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';

function Summary({ formatMessage, formValues }) {
  console.log('formValues = ', formValues);

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

  const Section = ({ children }) => {
    return <div className="summaryRow">{children}</div>;
  };

  const BlueText = ({ children }) => {
    return <p className="blue-text">{children}</p>;
  };

  const formatCalendarDate = (date) => {
    return moment(date).locale('fr').format('L');
  };
  const start = formatCalendarDate(adGroupStartDate);
  const finish = formatCalendarDate(adGroupEndDate);

  const tableElement = (tableLength, i, text) => `${i > 0 && i < tableLength ? ',' : ''} ${text}`;
  const segmentsIncluded = (bool) => audienceTable.reduce((acc, segment, i) => {
    return (segment.include === bool
      ? `${acc}${tableElement(audienceTable.length, i, segment.name)}`
      : acc
    );
  }, '');
  const otherTableToString = (table, key) => table.reduce((acc, element, i) => (
    `${acc}${tableElement(table.length, i, element[key])}`
  ), '');

  return (
    <div id="summary">
      <FormSection
        subtitle={messages.sectionSubtitle8}
        title={messages.sectionTitle8}
      />
      <Row className="summarySection">
        <Section>
          <div className="inline">
            {formatMessage(messages.contentSection8Part1Group1)}
            <BlueText>{start}</BlueText>
            {formatMessage(messages.contentSection8Part1Group2)}
            <BlueText>{finish}</BlueText>
            {formatMessage(messages.contentSection8Part1Group3)}
            <BlueText>{adGroupMaxBudgetPeriod}</BlueText>
            {formatMessage(messages.contentSection8Part1Group5)}
            <BlueText>{adGroupMaxBudgetPerPeriod}€</BlueText>
          </div>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part2)}
          <BlueText>{segmentsIncluded(true)}</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part3)}
          <BlueText>{segmentsIncluded(false)}</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part4)}
          <BlueText>XXX</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part5)}
          <BlueText>XXX</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part6)}
          <BlueText>{otherTableToString(publisherTable, 'display_network_name')}</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part7)}
          <BlueText>XXX</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part8)}
          <BlueText>{otherTableToString(optimizerTable, 'provider')}</BlueText>
        </Section>

        <Section>
          {formatMessage(messages.contentSection8Part9Group1)}
          <BlueText>{adTable ? adTable.length : 0}</BlueText>
          {formatMessage(messages.contentSection8Part9Group2)}
        </Section>
      </Row>
    </div>
  );
}

Summary.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape({}).isRequired,
};

export default Summary;
