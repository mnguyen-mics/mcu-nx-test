import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon } from 'antd';

import ContentHeader from '../../../../components/ContentHeader.tsx';

function AudienceSegmentHeader({ segment, translations }) {

  let iconType = '';

  if (segment.type === 'USER_ACTIVATION') {
    iconType = 'rocket';
  } else if (segment.type === 'USER_QUERY') {
    iconType = 'database';
  } else if (segment.type === 'USER_LIST') {
    iconType = 'solution';
  }

  const segmentType = <span><Icon type={iconType} /> {translations[segment.type]}</span>;

  return (
    <ContentHeader
      title={segment.name || ''}
      subTitle={segmentType}
    />
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
