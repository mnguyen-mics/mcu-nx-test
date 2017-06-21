import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Icon } from 'antd';
import { TitleAndStatusHeader } from '../../../../components/TitleAndStatusHeader';

import { SEGMENT_QUERY_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';


class AudienceSegmentHeader extends Component {

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  updateQueryParams(params) {
  }

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
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  segment: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = (state, ownProps) => ({
  translations: state.translations,
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment
});

AudienceSegmentHeader = connect(
  mapStateToProps,
)(AudienceSegmentHeader);

AudienceSegmentHeader = withRouter(AudienceSegmentHeader);

export default AudienceSegmentHeader;
