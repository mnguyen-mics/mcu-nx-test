import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon } from 'antd';

import TitleAndStatusHeader from '../../../../components/TitleAndStatusHeader';

function AudienceSegmentHeader({ segment, translations }) {

  let iconType = '';

  if (segment.type === 'USER_ACTIVATION') {
    iconType = 'rocket';
  } else if (segment.type === 'USER_QUERY') {
    iconType = 'database';
  } else if (segment.type === 'USER_LIST') {
    iconType = 'solution';
  }

  const attributes = [
    <span><Icon type={iconType} /> {translations[segment.type]}</span>,
  ];

  return (
    <div className="mcs-campaign-header">
      <TitleAndStatusHeader
        headerTitle={segment.name || ''}
        headerAttibutes={attributes}
      />
    </div>
  );
}

AudienceSegmentHeader.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  segment: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
});

const ConnectedAudienceSegmentHeader = connect(mapStateToProps)(AudienceSegmentHeader);

export default withRouter(ConnectedAudienceSegmentHeader);
