import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber, FormattedPlural } from 'react-intl';
import { Col, Row } from 'antd';

import { FormSection } from '../../../../../../../components/Form/index.ts';
import messages from '../../../messages';
import { formatMetric } from '../../../../../../../utils/MetricHelper.ts';
import { isToday, formatCalendarDate } from '../../../../../../../utils/DateHelper.ts';
import {
  filterTableByIncludeStatus,
  filterTableByRemovedStatus,
  filterTableByExcludeProperty,
  stringifyTable,
} from '../../../../../../../utils/TableUtils';
import GeonameRenderer from '../../../../../../Geoname/GeonameRenderer.tsx';

function Summary({ displayAudience, formatMessage, formValues }) {

  const {
    adGroupStartDate,
    adGroupEndDate,
    adGroupMaxBudgetPeriod,
    adGroupMaxBudgetPerPeriod,
    adTable,
    areas,
    audienceTable,
    locationTargetingTable,
    publisherTable,
    devices,
    optimizerTable,
  } = formValues;

  /* Format data */
  const formatPeriod = {
    DAY: formatMessage(messages.contentSectionSummaryPart1Group6OptionDAY),
    WEEK: formatMessage(messages.contentSectionSummaryPart1Group6OptionWEEK),
    MONTH: formatMessage(messages.contentSectionSummaryPart1Group6OptionMONTH),
  };

  /* Data to display */
  const nothingToDisplay = formatMessage(messages.noResults);
  const startDate = adGroupStartDate && formatCalendarDate(adGroupStartDate);
  const endDate = adGroupEndDate && formatCalendarDate(adGroupEndDate);
  const period = formatPeriod[adGroupMaxBudgetPeriod];
  const budgetPerPeriod = `${(adGroupMaxBudgetPerPeriod
    ? formatMetric(adGroupMaxBudgetPerPeriod, '0,0')
    : nothingToDisplay
  )}${formatMessage(messages.contentSectionSummaryPart1Group8)}`;
  const includedSegments = stringifyTable(filterTableByIncludeStatus(audienceTable, true), 'name');
  const excludedSegments = stringifyTable(filterTableByIncludeStatus(audienceTable, false), 'name');
  const publishers = stringifyTable(filterTableByRemovedStatus(publisherTable), 'display_network_name');
  const optimizers = stringifyTable(filterTableByRemovedStatus(optimizerTable), 'provider');
  const numberOfCreatives = (adTable ? adTable.filter(ad => !ad.toBeRemoved).length : 0);

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

  const renderGeoname = geoname => <P blue>{geoname.name}</P>;

  const includedGeonames = filterTableByExcludeProperty(locationTargetingTable, false)
    .map(id => <GeonameRenderer key={id} geonameId={id} renderMethod={renderGeoname} />);

  const excludedGeonames = filterTableByExcludeProperty(locationTargetingTable, true)
    .map(id => <GeonameRenderer key={id} geonameId={id} renderMethod={renderGeoname} />);


  return (
    <div id="summary">
      <FormSection
        subtitle={messages.sectionSubtitleSummary}
        title={messages.sectionTitleSummary}
      />
      <Row className="ad-group-summary-section">
        <Col span={16} className="content">
          <Section>
            <div>
              <Span>{formatMessage(messages.contentSectionSummaryPart1Group1)}</Span>
              {startDate && isToday(adGroupStartDate)
                  ? <Span blue>{formatMessage(messages.contentSectionSummaryPart1Group3)}</Span>
                  : <span>
                    <Span>{formatMessage(messages.contentSectionSummaryPart1Group2)}</Span>
                    <Span blue>{startDate}</Span>
                  </span>
                }
              <Span>{formatMessage(messages.contentSectionSummaryPart1Group4)}</Span>
              <Span blue>{endDate}</Span>
              <Span>{formatMessage(messages.contentSectionSummaryPart1Group5)}</Span>
              <Span blue>{period}</Span>
              <Span>{formatMessage(messages.contentSectionSummaryPart1Group7)}</Span>
              <Span blue>{budgetPerPeriod}</Span>
            </div>
          </Section>

          {displayAudience && <Section>
            {formatMessage(messages.contentSectionSummaryPart2)}
            <P blue>{includedSegments}</P>
          </Section>}

          {displayAudience && <Section>
            {formatMessage(messages.contentSectionSummaryPart3)}
            <P blue>{excludedSegments}</P>
          </Section>}

          {devices && <Section>
            {formatMessage(messages.contentSectionSummaryPart4)}
            <P blue>XXX</P>
          </Section>}

          {areas && <Section>
            {formatMessage(messages.contentSectionSummaryPart5)}
            <P blue>XXX</P>
          </Section>}

          { (includedGeonames.length > 0 || excludedGeonames.length > 0) &&
          <Section>
            { includedGeonames.length > 0 ?
              formatMessage(messages.contentSectionIncludedLocations) :
              null
            }
            { includedGeonames }
            { excludedGeonames.length > 0 ?
              formatMessage(messages.contentSectionExcludedLocations) :
              null
            }
            { excludedGeonames }
          </Section>}

          <Section>
            {formatMessage(messages.contentSection8Part6)}
            <P blue>{publishers}</P>
          </Section>

          {false && <Section>
            {formatMessage(messages.contentSectionSummaryPart7)}
            <P blue>XXX</P>
          </Section>}

          <Section>
            {formatMessage(messages.contentSectionSummaryPart8)}
            <P blue>{optimizers}</P>
          </Section>

          <div className="sectionPaddingTop textPadding">
            <Span>{formatMessage(messages.contentSectionSummaryPart9Group1)}</Span>
            {numberOfCreatives
              ? (
                <span>
                  <Span blue><FormattedNumber value={numberOfCreatives} /></Span>
                  <Span>
                    <FormattedPlural
                      value={numberOfCreatives}
                      one={formatMessage(messages.contentSectionSummaryPart9Singular)}
                      other={formatMessage(messages.contentSectionSummaryPart9Plural)}
                    />
                  </Span>
                </span>
              )
              : (
                <span>
                  <Span blue>{formatMessage(messages.contentSectionSummaryPart9Negation)}</Span>
                  <Span>{formatMessage(messages.contentSectionSummaryPart9Singular)}</Span>
                </span>
              )
            }
            <Span>{formatMessage(messages.contentSectionSummaryPart9Group2)}</Span>
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
