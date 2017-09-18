import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { CardWithHeader } from '../../../../components/Card';
import McsTabs from '../../../../components/McsTabs';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { formatMetric } from '../../../../utils/MetricHelper';

function AudienceSegmentDashboard({ segment, translations }) {

  function buildItemHeaders() {
    const report = segment.report_view ? segment.report_view[0] : undefined;
    return [
      {
        iconType: 'full-users',
        translationKey: 'USER_POINTS',
        number: report ? formatMetric(report.user_points, '0,0') : '--'
      },
      {
        iconType: 'users',
        translationKey: 'USER_ACCOUNTS',
        number: report ? formatMetric(report.user_accounts, '0,0') : '--'
      },
      {
        iconType: 'display',
        translationKey: 'DISPLAY',
        number: report ? formatMetric(report.desktop_cookie_ids, '0,0') : '--'
      },
      {
        iconType: 'email-inverted',
        translationKey: 'EMAILS',
        number: report ? formatMetric(report.emails, '0,0') : '--'
      }
    ];
  }

  function buildItems() {
    return [
      {
        title: translations.OVERVIEW,
        display: <Overview />,
      },
      {
        title: translations.ADDITION_DELETION,
        display: <AdditionDeletion />,
      },
      {
        title: translations.OVERLAP,
        display: <Overlap />,
      },
    ];
  }

  const itemsHeaders = buildItemHeaders();
  const items = buildItems();
  return (
    <CardWithHeader title="test" headerItems={itemsHeaders}>
      <McsTabs items={items} isCard={false} />
    </CardWithHeader>
  );
}

AudienceSegmentDashboard.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  segment: PropTypes.shape().isRequired
};

const mapStateToProps = state => ({
  translations: state.translations,
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment
});

const ConnectedAudienceSegmentDashboard = connect(mapStateToProps)(AudienceSegmentDashboard);
export default withRouter(ConnectedAudienceSegmentDashboard);
