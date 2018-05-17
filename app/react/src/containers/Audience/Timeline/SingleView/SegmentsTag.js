import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tag, Tooltip } from 'antd';

import AudienceSegmentService from '../../../../services/AudienceSegmentService.ts';

class SegmentsTag extends Component {

  constructor(props) {
    super(props);
    this.state = {
      segment: {
        name: null,
      },
    };
  }

  fetchSegmentData = (segmentId) => {
    AudienceSegmentService.getSegment(segmentId).then((response) => {
      this.setState({
        segment: response.data,
      });
    });
  }

  componentDidMount() {
    const {
      segmentId,
    } = this.props;

    this.fetchSegmentData(segmentId);
  }

  render() {

    return (
      <Tooltip title={this.state.segment.name}>
        <Tag className="card-tag alone">
          {this.state.segment.name}
        </Tag>
      </Tooltip>
    );
  }
}

SegmentsTag.propTypes = {
  segmentId: PropTypes.number.isRequired,
};

export default SegmentsTag;
