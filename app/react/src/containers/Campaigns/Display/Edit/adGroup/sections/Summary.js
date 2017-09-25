import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
  const filterTableByIncludeStatus = (table = [], bool) => table.filter(elem => !elem.toBeRemoved && elem.include === bool);
  const filterTableByToBeRemovedStatus = (table = []) => table.filter(elem => !elem.toBeRemoved);
  const stringifyTableElements = (table = [], key) => table.reduce((acc, element, i) => (
    `${acc}${`${i > 0 && i < table.length ? ',' : ''} ${element[key]}`}`
  ), '');

  const includedSegments = filterTableByIncludeStatus(audienceTable, true);
  const excludedSegments = filterTableByIncludeStatus(audienceTable, false);
  const publishers = filterTableByToBeRemovedStatus(publisherTable);
  const optimizers = filterTableByToBeRemovedStatus(optimizerTable);
  const startIsToday = moment().diff(adGroupStartDate, 'days') === 0;
  const displaySection = (
    (adGroupStartDate && adGroupEndDate && adGroupMaxBudgetPeriod && adGroupMaxBudgetPerPeriod)
    || includedSegments.length
    || excludedSegments.length
    || publishers.length
    || optimizers.length
  );

  /* JSX to display */
  const Section = ({ children }) => (
    <div className="section sectionPaddingTop">
      <Row className="textPadding"><Col span={16}>{children}</Col></Row>
    </div>
    );
  const span = (value, isBlue) => <span className={isBlue ? 'blue-text text' : 'text'}>{value}</span>;
  const p = (value, isBlue) => <p className={isBlue ? 'blue-text text' : 'text'}>{value}</p>;

  return (displaySection
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
                  {span(formatMessage(messages.contentSection8Part1Group1))}
                  {startIsToday
                    ? span(formatMessage(messages.contentSection8Part1Group3), true)
                    : <span>
                      {span(formatMessage(messages.contentSection8Part1Group2))}
                      {span(formatCalendarDate(adGroupStartDate), true)}
                    </span>
                  }
                  {span(formatMessage(messages.contentSection8Part1Group4))}
                  {span(formatCalendarDate(adGroupEndDate), true)}
                  {span(formatMessage(messages.contentSection8Part1Group5))}
                  {span(adGroupMaxBudgetPeriod, true)}
                  {span(formatMessage(messages.contentSection8Part1Group7))}
                  {span(`
                    ${formatMetric(adGroupMaxBudgetPerPeriod, '0,0')}
                    ${formatMessage(messages.contentSection8Part1Group8)}
                  `, true)}
                </div>
              </Section>
            )
            : null
          }

           {includedSegments.length
            ? <Section>
              {formatMessage(messages.contentSection8Part2)}
              {p(stringifyTableElements(includedSegments, 'name'), true)}
            </Section>
            : null
          }

           {excludedSegments.length
             ? <Section>
               {formatMessage(messages.contentSection8Part3)}
               {p(stringifyTableElements(excludedSegments, 'name'), true)}
             </Section>
             : null
           }

           <Section>
             {formatMessage(messages.contentSection8Part4)}
             {p('XXX', true)}
           </Section>

           <Section>
             {formatMessage(messages.contentSection8Part5)}
             {p('XXX', true)}
           </Section>

           {publishers.length
             ? <Section>
               {formatMessage(messages.contentSection8Part6)}
               {p(stringifyTableElements(publishers, 'display_network_name'), true)}
             </Section>
             : null
          }

           <Section>
             {formatMessage(messages.contentSection8Part7)}
             {p('XXX', true)}
           </Section>

           {optimizers.length
             ? <Section>
               {formatMessage(messages.contentSection8Part8)}
               {p(stringifyTableElements(optimizers, 'provider'), true)}
             </Section>
           : null
          }

           <div className="sectionPaddingTop textPadding">
             {span(formatMessage(messages.contentSection8Part9Group1))}
             {span(adTable ? adTable.length : 0, true)}
             {span(formatMessage(messages.contentSection8Part9Group2))}
           </div>
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
