import * as React from 'react';
import { Tag, Tooltip } from 'antd';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { UserActivationSegment, AudienceSegmentResource } from '../../../../models/audiencesegment';
import messages from '../messages';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';

interface SegmentsTagProps {
  segmentId: string;
}

type Props = SegmentsTagProps &
  InjectedIntlProps

interface State {
  segment: AudienceSegmentResource;
}

class SegmentsTag extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  constructor(props: Props) {
    super(props);
    this.state = {
      segment: {
        id: 'FAKE',
        organisation_id: 'FAKE',
        datamart_id: 'FAKE',
        persisted: true,
        type: "USER_LIST",
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

    const formatUserActivationSegmentName = (record: UserActivationSegment): string => {
      const { intl } = this.props;
      
      if(record.clickers) {
        return intl.formatMessage(messages.userActivationClickers, {audienceSegmentName: record.name});
      } else if (record.exposed){
        return intl.formatMessage(messages.userActivationExposed, {audienceSegmentName: record.name});
      } else {
        // Not supposed to happen
        return record.name;
      }
    }
    
    return (
      <Tooltip title={this.state.segment.name}>
        <Tag className="card-tag alone">{this.state.segment.type === "USER_ACTIVATION" ? formatUserActivationSegmentName(this.state.segment as UserActivationSegment) : name}</Tag>
      </Tooltip>
    );
  }
}

export default compose<Props, SegmentsTagProps>(
  injectIntl,
)(SegmentsTag);
