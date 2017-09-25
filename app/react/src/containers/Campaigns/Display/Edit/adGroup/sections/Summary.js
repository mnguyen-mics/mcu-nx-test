import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Col, Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';

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

  /*
    const formatCalendarDate = (date) => moment(date).locale('fr').format('L');

    const tableElement = (tableLength, i, text) => `${i > 0 && i < tableLength ? ',' : ''} ${text}`;
    const segmentsIncluded = (bool) => audienceTable.reduce((acc, segment, i) => (
      segment.include === bool ? `${acc}${tableElement(audienceTable.length, i, segment.name)}` : acc
    ), '');
    const otherTableToString = (table, key) => table.reduce((acc, element, i) => (
      `${acc}${tableElement(table.length, i, element[key])}`
    ), '');
  */

  /* Data formatting to strings */
  const formatCalendarDate = (date) => moment(date).locale('fr').format('L');
  const filterTableByIncludeStatus = (table = [], bool) => table.filter(elem => elem.include === bool);
  const stringifyTableElements = (table = [], key) => table.reduce((acc, element, i) => (
    `${acc}${`${i > 0 && i < table.length ? ',' : ''} ${element[key]}`}`
  ), '');

  const includedSegments = filterTableByIncludeStatus(audienceTable, true);
  const excludedSegments = filterTableByIncludeStatus(audienceTable, false);

  // const segmentsIncluded = (table, bool) => table.reduce((acc, segment, i) => (
  //   segment.include === bool ? `${acc}${tableElement(table.length, i, segment.name)}` : acc
  // ), '');

  /* JSX to display */
  const Section = ({ children }) => (
    <div className="section sectionPaddingTop">
      <Row className="textPadding"><Col span={16}>{children}</Col></Row>
    </div>
    );
  const text = (value, isBlue) => <span className={isBlue ? 'blue-text' : ''}>{value}</span>;

  return (Object.keys(formValues).length
     ? (<div id="summary" className="summarySection">
       <FormSection
         subtitle={messages.sectionSubtitle8}
         title={messages.sectionTitle8}
       />
       <Row className="content">
         <Col span={16}>
           {adGroupStartDate && adGroupEndDate && adGroupMaxBudgetPeriod && adGroupMaxBudgetPerPeriod
            ? (
              <Section>
                <div>
                  {text(formatMessage(messages.contentSection8Part1Group1))}
                  {text(formatCalendarDate(adGroupStartDate), true)}
                  {text(formatMessage(messages.contentSection8Part1Group2))}
                  {text(formatCalendarDate(adGroupEndDate), true)}
                  {text(formatMessage(messages.contentSection8Part1Group3))}
                  {text(adGroupMaxBudgetPeriod, true)}
                  {text(formatMessage(messages.contentSection8Part1Group5))}
                  {text(adGroupMaxBudgetPerPeriod, true)}
                </div>
              </Section>
            )
            : null
          }

           {includedSegments
            ? <Section>
              {formatMessage(messages.contentSection8Part2)}
              {text(stringifyTableElements(includedSegments, 'name'), true)}
            </Section>
            : null
          }

           {excludedSegments
             ? <Section>
               {formatMessage(messages.contentSection8Part3)}
               {text(stringifyTableElements(excludedSegments, 'name'), true)}
             </Section>
             : null
           }

           <Section>
             {formatMessage(messages.contentSection8Part4)}
             {text('XXX', true)}
           </Section>

           <Section>
             {formatMessage(messages.contentSection8Part5)}
             {text('XXX', true)}
           </Section>

           <Section>
             {formatMessage(messages.contentSection8Part6)}
             {text(stringifyTableElements(publisherTable, 'display_network_name'), true)}
           </Section>

           <Section>
             {formatMessage(messages.contentSection8Part7)}
             {text('XXX', true)}
           </Section>

           <Section>
             {formatMessage(messages.contentSection8Part8)}
             {text(stringifyTableElements(optimizerTable, 'provider'), true)}
           </Section>

           {/* <div className="sectionPaddingTop textPadding">
             {formatMessage(messages.contentSection8Part9Group1)}
             {text(adTable ? adTable.length : 0, true)}
             {formatMessage(messages.contentSection8Part9Group2)}
           </div> */}
         </Col>
       </Row>
     </div>
  )
  : null
  );
}

Summary.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape({}).isRequired,
};

export default Summary;
