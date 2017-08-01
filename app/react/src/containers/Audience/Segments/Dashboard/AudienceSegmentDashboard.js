import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { CardWithHeader } from '../../../../components/Card';
import McsTabs from '../../../../components/McsTabs';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { formatMetric } from '../../../../utils/MetricHelper';

function AudienceSegmentDashboard({ segment, translations }) {

  const headerItems = [{
    iconType: 'full-users',
    translationKey: 'USERPOINTS',
    number: (segment.report_view
        ? formatMetric(segment.report_view[0].user_points, '0,0')
        : '--'
      ),
  },
  {
    iconType: 'users',
    translationKey: 'USER_ACCOUNTS',
    number: (segment.report_view
        ? formatMetric(segment.report_view[0].user_accounts, '0,0')
        : '--'
      ),
  },
  {
    iconType: 'display',
    translationKey: 'DISPLAY',
    number: (segment.report_view
        ? formatMetric(segment.report_view[0].desktop_cookie_ids, '0,0')
        : '--'
      ),
  },
  {
    iconType: 'email-inverted',
    translationKey: 'EMAILS',
    number: (segment.report_view
        ? formatMetric(segment.report_view[0].emails, '0,0')
        : '--'
      ),
  }];

  const items = [
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
  return (
    <CardWithHeader title="test" headerItems={headerItems}>
      <McsTabs items={items} isCard={false} />
    </CardWithHeader>
  );
}

AudienceSegmentDashboard.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  segment: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
});

const ConnectedAudienceSegmentDashboard = connect(mapStateToProps)(AudienceSegmentDashboard);
export default withRouter(ConnectedAudienceSegmentDashboard);
