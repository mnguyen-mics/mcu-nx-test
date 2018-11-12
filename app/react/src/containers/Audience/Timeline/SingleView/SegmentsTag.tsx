import * as React from 'react';
import { Tag, Tooltip } from 'antd';
import { injectable } from 'inversify';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';

interface SegmentsTagProps {
  segmentId: string;
}

interface State {
  segment: {
    name: string;
  };
}

@injectable()
class SegmentsTag extends React.Component<SegmentsTagProps, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  constructor(props: SegmentsTagProps) {
    super(props);
    this.state = {
      segment: {
        name: '',
      },
    };
  }

  fetchSegmentData = (segmentId: string) => {
    this._audienceSegmentService.getSegment(segmentId).then(response => {
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
