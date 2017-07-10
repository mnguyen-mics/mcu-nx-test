import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon } from 'antd';
import { TitleAndStatusHeader } from '../../../../components/TitleAndStatusHeader';

class AudienceSegmentHeader extends Component {

  render() {
    const {
      segment,
      translations
    } = this.props;

    let iconType = '';
    if (segment.type === 'USER_ACTIVATION') {
      iconType = 'rocket';
    } else if (segment.type === 'USER_QUERY') {
      iconType = 'database';
    } else if (segment.type === 'USER_LIST') {
      iconType = 'solution';
    }

    const attributes = [<span><Icon type={iconType} /> {translations[segment.type]}</span>];

    return (
      <div className="mcs-campaign-header">
        <TitleAndStatusHeader headerTitle={segment.name || ''} headerAttibutes={attributes} />
      </div>
    );
  }

}

AudienceSegmentHeader.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  segment: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translations,
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment
});

AudienceSegmentHeader = connect(
  mapStateToProps,
)(AudienceSegmentHeader);

AudienceSegmentHeader = withRouter(AudienceSegmentHeader);

export default AudienceSegmentHeader;
