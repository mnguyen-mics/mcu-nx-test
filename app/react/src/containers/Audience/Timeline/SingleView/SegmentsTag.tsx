import * as React from 'react';
import { Tag, Tooltip } from 'antd';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';

interface SegmentsTagProps {
  segmentId: string;
}

interface State {
  segment: {
    name: string;
  };
}

class SegmentsTag extends React.Component<SegmentsTagProps, State> {
  constructor(props: SegmentsTagProps) {
    super(props);
    this.state = {
      segment: {
        name: '',
      },
    };
  }

  fetchSegmentData = (segmentId: string) => {
    AudienceSegmentService.getSegment(segmentId).then(response => {
      this.setState({
        segment: response.data,
      });
    });
  };

  componentDidMount() {
    const { segmentId } = this.props;

    this.fetchSegmentData(segmentId);
  }

  componentDidUpdate(prevProps: SegmentsTagProps) {
    const { segmentId } = this.props;
    const { segmentId: prevSegmentId } = prevProps;
    if (segmentId !== prevSegmentId) {
      this.fetchSegmentData(segmentId);
    }
  }

  render() {
    return (
      <Tooltip title={this.state.segment.name}>
        <Tag className="card-tag alone">{this.state.segment.name}</Tag>
      </Tooltip>
    );
  }
}

export default SegmentsTag;
